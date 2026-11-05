"""QA test suite for the restaurant backend.

Covers models, serializers, every documented API endpoint, the full ordering
flow, and database connectivity/integrity.

These tests run against an isolated Django test database and never touch the
production database or any deployment configuration.
"""

from decimal import Decimal

from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.db import IntegrityError, connection, transaction
from django.test import TestCase, TransactionTestCase, override_settings
from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase

from .models import (
    ContactMessage,
    Food,
    OTP,
    Order,
    Profile,
    Review,
    UserSession,
)
from .serializers import FoodSerializer, UserSerializer


def make_food(**overrides):
    defaults = {
        "name": "Test Dish",
        "category": "Veg",
        "price": Decimal("100.00"),
        "available": True,
    }
    defaults.update(overrides)
    return Food.objects.create(**defaults)


def make_user(username="user", password="Passw0rd!"):
    return User.objects.create_user(username, f"{username}@example.com", password)


# --------------------------------------------------------------------------- #
# Models
# --------------------------------------------------------------------------- #

class ModelTests(TestCase):
    def test_food_defaults_and_str(self):
        food = Food.objects.create(name="Paneer", price=Decimal("120.50"))
        self.assertEqual(food.category, "Veg")
        self.assertTrue(food.available)
        self.assertEqual(str(food), "Paneer")

    def test_order_defaults_and_str(self):
        user = make_user("orderuser")
        food = make_food()
        order = Order.objects.create(
            user=user, food=food, quantity=2, total_price=Decimal("198.00")
        )
        self.assertEqual(order.status, "Pending")
        self.assertEqual(order.payment_status, "Pending")
        self.assertEqual(order.payment_method, "Online")
        self.assertEqual(order.quantity, 2)
        self.assertEqual(str(order), "orderuser - Test Dish")

    def test_profile_str(self):
        user = make_user("profileuser")
        profile = Profile.objects.create(user=user, phone="9990000001")
        self.assertEqual(str(profile), "profileuser - 9990000001")

    def test_profile_phone_is_unique(self):
        u1 = make_user("p1")
        u2 = make_user("p2")
        Profile.objects.create(user=u1, phone="9990000002")
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Profile.objects.create(user=u2, phone="9990000002")

    def test_otp_defaults(self):
        user = make_user("otpmodel")
        otp = OTP.objects.create(user=user, otp="123456")
        self.assertFalse(otp.is_used)
        self.assertIsNotNone(otp.created_at)

    def test_usersession_defaults(self):
        user = make_user("sessmodel")
        session = UserSession.objects.create(user=user)
        self.assertTrue(session.is_active)

    def test_review_and_contact(self):
        user = make_user("reviewmodel")
        food = make_food()
        review = Review.objects.create(user=user, food=food, rating=5, comment="great")
        self.assertEqual(str(review), "reviewmodel - Test Dish")

        contact = ContactMessage.objects.create(
            name="Anon", email="anon@example.com", message="hello"
        )
        self.assertIsNone(contact.user)


# --------------------------------------------------------------------------- #
# Serializers
# --------------------------------------------------------------------------- #

class SerializerTests(TestCase):
    def test_food_serializer_rejects_negative_price(self):
        serializer = FoodSerializer(
            data={"name": "Ok Dish", "category": "Veg", "price": "-5.00"}
        )
        self.assertFalse(serializer.is_valid())
        self.assertIn("price", serializer.errors)

    def test_food_serializer_rejects_short_name(self):
        serializer = FoodSerializer(
            data={"name": "Ab", "category": "Veg", "price": "5.00"}
        )
        self.assertFalse(serializer.is_valid())
        self.assertIn("name", serializer.errors)

    def test_user_serializer_creates_profile(self):
        serializer = UserSerializer(
            data={
                "username": "serializeruser",
                "email": "serializer@example.com",
                "password": "Passw0rd!",
                "phone": "9111111111",
            }
        )
        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()
        self.assertTrue(
            Profile.objects.filter(user=user, phone="9111111111").exists()
        )

    def test_user_serializer_rejects_duplicate_phone(self):
        make_user("existing")
        Profile.objects.create(user=User.objects.get(username="existing"), phone="9111111122")
        serializer = UserSerializer(
            data={
                "username": "another",
                "email": "another@example.com",
                "password": "Passw0rd!",
                "phone": "9111111122",
            }
        )
        self.assertFalse(serializer.is_valid())
        self.assertIn("phone", serializer.errors)


# --------------------------------------------------------------------------- #
# Food API
# --------------------------------------------------------------------------- #

class FoodAPITests(APITestCase):
    def setUp(self):
        self.starter = make_food(name="Paneer Tikka", category="Starters")
        self.veg = make_food(name="Veg Biryani", category="Veg")

    def test_list_is_public(self):
        response = self.client.get(reverse("food-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_filter_by_category(self):
        response = self.client.get(reverse("food-list"), {"category": "Starters"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Paneer Tikka")

    def test_search_by_name(self):
        response = self.client.get(reverse("food-list"), {"search": "biryani"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Veg Biryani")

    def test_create_food_public(self):
        response = self.client.post(
            reverse("food-list"),
            {"name": "New Dish", "category": "Veg", "price": "10.00"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_food_invalid_price(self):
        response = self.client.post(
            reverse("food-list"),
            {"name": "Bad Dish", "category": "Veg", "price": "-1.00"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


# --------------------------------------------------------------------------- #
# Auth flow
# --------------------------------------------------------------------------- #

class AuthFlowTests(APITestCase):
    credentials = {
        "username": "authuser",
        "email": "authuser@example.com",
        "password": "Passw0rd!",
        "phone": "9000000001",
    }

    def test_register_login_refresh(self):
        register = self.client.post(reverse("register"), self.credentials, format="json")
        self.assertEqual(register.status_code, status.HTTP_201_CREATED, register.data)

        token = self.client.post(
            reverse("token_obtain_pair"),
            {"username": self.credentials["username"], "password": self.credentials["password"]},
            format="json",
        )
        self.assertEqual(token.status_code, status.HTTP_200_OK)
        self.assertIn("access", token.data)
        self.assertIn("refresh", token.data)

        refreshed = self.client.post(
            reverse("token_refresh"), {"refresh": token.data["refresh"]}, format="json"
        )
        self.assertEqual(refreshed.status_code, status.HTTP_200_OK)
        self.assertIn("access", refreshed.data)

    def test_login_with_invalid_credentials(self):
        response = self.client.post(
            reverse("token_obtain_pair"),
            {"username": "nobody", "password": "wrong"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_register_duplicate_phone(self):
        self.client.post(reverse("register"), self.credentials, format="json")
        duplicate = dict(self.credentials, username="authuser2", email="a2@example.com")
        response = self.client.post(reverse("register"), duplicate, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("phone", response.data)


# --------------------------------------------------------------------------- #
# Order API
# --------------------------------------------------------------------------- #

class OrderAPITests(APITestCase):
    def setUp(self):
        self.user = make_user("buyer")
        self.other = make_user("other")
        self.food = make_food()

    def test_requires_authentication(self):
        response = self.client.get(reverse("order-list"))
        self.assertIn(response.status_code, (401, 403))

    def test_create_assigns_request_user(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            reverse("order-list"),
            {"food": self.food.id, "quantity": 2, "total_price": "200.00"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertEqual(Order.objects.get().user, self.user)

    def test_create_ignores_client_supplied_total(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            reverse("order-list"),
            {"food": self.food.id, "quantity": 2, "total_price": "1.00"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        order = Order.objects.get(id=response.data["id"])
        self.assertEqual(order.total_price, self.food.price * 2)

    def test_user_isolation(self):
        Order.objects.create(user=self.user, food=self.food, total_price=Decimal("100.00"))
        Order.objects.create(user=self.other, food=self.food, total_price=Decimal("100.00"))
        self.client.force_authenticate(self.user)
        response = self.client.get(reverse("order-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_cannot_read_other_users_order(self):
        order = Order.objects.create(
            user=self.other, food=self.food, total_price=Decimal("100.00")
        )
        self.client.force_authenticate(self.user)
        response = self.client.get(reverse("order-detail", args=[order.id]))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_patch_payment_and_status(self):
        order = Order.objects.create(
            user=self.user, food=self.food, total_price=Decimal("100.00")
        )
        self.client.force_authenticate(self.user)

        paid = self.client.patch(
            reverse("order-detail", args=[order.id]),
            {"payment_status": "Paid", "payment_method": "Card"},
            format="json",
        )
        self.assertEqual(paid.status_code, status.HTTP_200_OK, paid.data)
        order.refresh_from_db()
        self.assertEqual(order.payment_status, "Paid")
        self.assertEqual(order.payment_method, "Card")

        cancelled = self.client.patch(
            reverse("order-detail", args=[order.id]), {"status": "Cancelled"}, format="json"
        )
        self.assertEqual(cancelled.status_code, status.HTTP_200_OK)
        order.refresh_from_db()
        self.assertEqual(order.status, "Cancelled")

    def test_create_rejects_non_positive_quantity(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            reverse("order-list"),
            {"food": self.food.id, "quantity": 0},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, response.data)

    def test_create_rejects_unavailable_food(self):
        unavailable = make_food(name="Sold Out", available=False)
        self.client.force_authenticate(self.user)
        response = self.client.post(
            reverse("order-list"),
            {"food": unavailable.id, "quantity": 1},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, response.data)

    def test_patch_cannot_change_food(self):
        replacement = make_food(name="Replacement", price=Decimal("500.00"))
        order = Order.objects.create(
            user=self.user, food=self.food, quantity=1, total_price=self.food.price
        )
        self.client.force_authenticate(self.user)
        response = self.client.patch(
            reverse("order-detail", args=[order.id]),
            {"food": replacement.id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        order.refresh_from_db()
        self.assertEqual(order.food, self.food)

    def test_patch_quantity_reprices_order(self):
        order = Order.objects.create(
            user=self.user, food=self.food, quantity=1, total_price=self.food.price
        )
        self.client.force_authenticate(self.user)
        response = self.client.patch(
            reverse("order-detail", args=[order.id]),
            {"quantity": 3},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        order.refresh_from_db()
        self.assertEqual(order.quantity, 3)
        self.assertEqual(order.total_price, self.food.price * 3)


# --------------------------------------------------------------------------- #
# End-to-end ordering flow
# --------------------------------------------------------------------------- #

class OrderingFlowTests(APITestCase):
    def test_full_order_lifecycle(self):
        register = self.client.post(
            reverse("register"),
            {
                "username": "flowuser",
                "email": "flow@example.com",
                "password": "Passw0rd!",
                "phone": "9333333333",
            },
            format="json",
        )
        self.assertEqual(register.status_code, status.HTTP_201_CREATED, register.data)

        token = self.client.post(
            reverse("token_obtain_pair"),
            {"username": "flowuser", "password": "Passw0rd!"},
            format="json",
        )
        self.assertEqual(token.status_code, status.HTTP_200_OK)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.data['access']}")

        food = make_food(name="Flow Dish", price=Decimal("150.00"))

        listing = self.client.get(reverse("food-list"))
        self.assertEqual(listing.status_code, status.HTTP_200_OK)

        created = self.client.post(
            reverse("order-list"),
            {"food": food.id, "quantity": 1, "total_price": "150.00"},
            format="json",
        )
        self.assertEqual(created.status_code, status.HTTP_201_CREATED, created.data)
        order_id = created.data["id"]

        mine = self.client.get(reverse("order-list"))
        self.assertEqual(len(mine.data), 1)
        self.assertEqual(mine.data[0]["food_name"], "Flow Dish")

        paid = self.client.patch(
            reverse("order-detail", args=[order_id]),
            {"payment_status": "Paid", "payment_method": "Online"},
            format="json",
        )
        self.assertEqual(paid.status_code, status.HTTP_200_OK)

        cancelled = self.client.patch(
            reverse("order-detail", args=[order_id]), {"status": "Cancelled"}, format="json"
        )
        self.assertEqual(cancelled.status_code, status.HTTP_200_OK)

        final = Order.objects.get(id=order_id)
        self.assertEqual(final.payment_status, "Paid")
        self.assertEqual(final.status, "Cancelled")


# --------------------------------------------------------------------------- #
# Reviews & Contacts
# --------------------------------------------------------------------------- #

class ReviewAPITests(APITestCase):
    def setUp(self):
        self.user = make_user("reviewer")
        self.food = make_food()

    def test_requires_authentication(self):
        response = self.client.get(reverse("review-list"))
        self.assertIn(response.status_code, (401, 403))

    def test_create_assigns_user_and_is_isolated(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            reverse("review-list"),
            {"food": self.food.id, "rating": 4, "comment": "tasty"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertEqual(Review.objects.get().user, self.user)

        other = make_user("otherreviewer")
        Review.objects.create(user=other, food=self.food, rating=3, comment="meh")
        listing = self.client.get(reverse("review-list"))
        self.assertEqual(len(listing.data), 1)

    def test_create_rejects_out_of_range_rating(self):
        self.client.force_authenticate(self.user)
        for rating in (0, 6):
            response = self.client.post(
                reverse("review-list"),
                {"food": self.food.id, "rating": rating, "comment": "x"},
                format="json",
            )
            self.assertEqual(
                response.status_code, status.HTTP_400_BAD_REQUEST, response.data
            )


class ContactAPITests(APITestCase):
    def setUp(self):
        self.user = make_user("contactuser")

    def test_requires_authentication(self):
        response = self.client.get(reverse("contact-list"))
        self.assertIn(response.status_code, (401, 403))

    def test_create_assigns_user(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            reverse("contact-list"),
            {"name": "Bob", "email": "bob@example.com", "message": "hi"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertEqual(ContactMessage.objects.get().user, self.user)


# --------------------------------------------------------------------------- #
# Profile / user info / dashboard
# --------------------------------------------------------------------------- #

class ProfileAndDashboardTests(APITestCase):
    def setUp(self):
        self.user = make_user("info")
        self.staff = User.objects.create_user("admin", "admin@example.com", "Passw0rd!", is_staff=True)

    def test_profile_requires_auth(self):
        self.assertIn(self.client.get(reverse("profile")).status_code, (401, 403))

    def test_profile_returns_identity(self):
        self.client.force_authenticate(self.user)
        response = self.client.get(reverse("profile"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "info")

    def test_user_info_reports_staff_flag(self):
        self.client.force_authenticate(self.staff)
        response = self.client.get(reverse("user-info"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["is_staff"])

    def test_dashboard_stats(self):
        food = make_food()
        Order.objects.create(user=self.user, food=food, total_price=Decimal("100.00"))
        Order.objects.create(user=self.user, food=food, total_price=Decimal("50.00"))
        self.client.force_authenticate(self.staff)
        response = self.client.get(reverse("dashboard-stats"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_foods"], 1)
        self.assertEqual(response.data["total_orders"], 2)

    def test_dashboard_stats_requires_auth(self):
        self.assertIn(self.client.get(reverse("dashboard-stats")).status_code, (401, 403))

    def test_dashboard_stats_forbidden_for_non_staff(self):
        self.client.force_authenticate(self.user)
        response = self.client.get(reverse("dashboard-stats"))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


# --------------------------------------------------------------------------- #
# Session tracking
# --------------------------------------------------------------------------- #

class SessionTrackingTests(APITestCase):
    def setUp(self):
        self.user = make_user("sessionuser")
        self.staff = User.objects.create_user(
            "sessionadmin", "sessionadmin@example.com", "Passw0rd!", is_staff=True
        )

    def test_track_login_creates_active_session(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(reverse("track-login"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(UserSession.objects.filter(user=self.user, is_active=True).exists())

    def test_track_logout_deactivates(self):
        UserSession.objects.create(user=self.user, is_active=True)
        self.client.force_authenticate(self.user)
        self.client.post(reverse("track-logout"))
        self.assertFalse(UserSession.objects.filter(user=self.user, is_active=True).exists())

    def test_active_users_is_public(self):
        UserSession.objects.create(user=self.user, is_active=True)
        response = self.client.get(reverse("active-users"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["active_users"], 1)

    def test_user_logins_lists_sessions(self):
        UserSession.objects.create(user=self.user)
        self.client.force_authenticate(self.staff)
        response = self.client.get(reverse("user-logins"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]["username"], "sessionuser")

    def test_user_logins_forbidden_for_non_staff(self):
        UserSession.objects.create(user=self.user)
        self.client.force_authenticate(self.user)
        response = self.client.get(reverse("user-logins"))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


# --------------------------------------------------------------------------- #
# OTP / password reset
# --------------------------------------------------------------------------- #

@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    EMAIL_HOST_USER="noreply@restaurant.test",
)
class OtpResetTests(APITestCase):
    def setUp(self):
        self.user = make_user("otpuser")
        Profile.objects.create(user=self.user, phone="9222222222")

    def test_send_otp_unknown_phone(self):
        response = self.client.post(reverse("send-otp"), {"phone": "9000000000"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_send_otp_does_not_leak_otp(self):
        response = self.client.post(reverse("send-otp"), {"phone": "9222222222"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotIn("otp", response.data)

    def test_reset_requires_verification_token(self):
        response = self.client.post(
            reverse("reset-password"),
            {"phone": "9222222222", "new_password": "NewPassw0rd!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reset_rejects_invalid_token(self):
        response = self.client.post(
            reverse("reset-password"),
            {"phone": "9222222222", "new_password": "NewPassw0rd!", "token": "bogus"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_send_verify_reset_flow(self):
        sent = self.client.post(reverse("send-otp"), {"phone": "9222222222"}, format="json")
        self.assertEqual(sent.status_code, status.HTTP_200_OK)
        # The OTP is no longer returned in the response; read it from storage.
        otp = OTP.objects.filter(user=self.user, is_used=False).latest("created_at").otp

        bad = self.client.post(
            reverse("verify-otp"), {"phone": "9222222222", "otp": "000000"}, format="json"
        )
        self.assertEqual(bad.status_code, status.HTTP_400_BAD_REQUEST)

        good = self.client.post(
            reverse("verify-otp"), {"phone": "9222222222", "otp": otp}, format="json"
        )
        self.assertEqual(good.status_code, status.HTTP_200_OK)
        self.assertIn("reset_token", good.data)

        reuse = self.client.post(
            reverse("verify-otp"), {"phone": "9222222222", "otp": otp}, format="json"
        )
        self.assertEqual(reuse.status_code, status.HTTP_400_BAD_REQUEST)

        reset = self.client.post(
            reverse("reset-password"),
            {
                "phone": "9222222222",
                "new_password": "NewPassw0rd!",
                "token": good.data["reset_token"],
            },
            format="json",
        )
        self.assertEqual(reset.status_code, status.HTTP_200_OK)

        token = self.client.post(
            reverse("token_obtain_pair"),
            {"username": "otpuser", "password": "NewPassw0rd!"},
            format="json",
        )
        self.assertEqual(token.status_code, status.HTTP_200_OK)


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class EmailConfigurationTests(APITestCase):
    """send_otp must not report a false success when it cannot deliver mail."""

    def setUp(self):
        self.user = make_user("emailuser")
        Profile.objects.create(user=self.user, phone="9111111111")

    @override_settings(DEBUG=False, EMAIL_HOST_USER="your_email@gmail.com")
    def test_send_otp_reports_503_when_email_not_configured(self):
        response = self.client.post(
            reverse("send-otp"), {"phone": "9111111111"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)

    @override_settings(DEBUG=True, EMAIL_HOST_USER="your_email@gmail.com")
    def test_send_otp_returns_otp_in_debug(self):
        response = self.client.post(
            reverse("send-otp"), {"phone": "9111111111"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("otp", response.data)


# --------------------------------------------------------------------------- #
# Database connectivity & integrity
# --------------------------------------------------------------------------- #

class DatabaseTests(TestCase):
    EXPECTED_TABLES = [
        "auth_user",
        "restaurant_food",
        "restaurant_order",
        "restaurant_profile",
        "restaurant_otp",
        "restaurant_review",
        "restaurant_contactmessage",
        "restaurant_usersession",
    ]

    def test_connection_works(self):
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            self.assertEqual(cursor.fetchone()[0], 1)

    def test_expected_tables_exist(self):
        tables = connection.introspection.table_names()
        for table in self.EXPECTED_TABLES:
            self.assertIn(table, tables, f"missing table: {table}")


class ForeignKeyIntegrityTests(TransactionTestCase):
    """Uses TransactionTestCase so the database enforces FK constraints
    immediately (TestCase defers constraint checks until teardown)."""

    def test_order_requires_valid_food_foreign_key(self):
        user = make_user("fkuser")
        with self.assertRaises(IntegrityError):
            Order.objects.create(
                user=user, food_id=999999, total_price=Decimal("1.00")
            )


class FieldValidationTests(TestCase):
    """Model-level validators must reject nonsensical field values."""

    def test_order_quantity_must_be_positive(self):
        user = make_user("valuser")
        food = make_food()
        order = Order(user=user, food=food, quantity=0, total_price=Decimal("0.00"))
        with self.assertRaises(ValidationError):
            order.full_clean()

    def test_review_rating_must_be_between_1_and_5(self):
        user = make_user("valuser2")
        food = make_food()
        for rating in (0, 6):
            review = Review(user=user, food=food, rating=rating, comment="x")
            with self.assertRaises(ValidationError):
                review.full_clean()
