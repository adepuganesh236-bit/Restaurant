import logging
import random
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.models import User
from django.core import signing
from django.core.mail import send_mail
from django.db.models import Sum
from django.shortcuts import render
from django.utils import timezone

from rest_framework import viewsets, generics, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Food, Order, Review, ContactMessage, UserSession, Profile, OTP
from .serializers import FoodSerializer, OrderSerializer, UserSerializer, ReviewSerializer, ContactMessageSerializer

logger = logging.getLogger(__name__)

# Signed token handed to the client after a successful OTP verification and
# required to complete a password reset. Keeps the reset endpoint from being
# usable without proof that the caller controls the phone number.
RESET_TOKEN_SALT = "restaurant.password-reset"
RESET_TOKEN_MAX_AGE = 600  # seconds


def _email_configured():
    """True only when real (non-placeholder) email credentials are present."""
    user = settings.EMAIL_HOST_USER or ""
    return bool(user) and "your_email" not in user


class FoodViewSet(viewsets.ModelViewSet):
    queryset = Food.objects.all()
    serializer_class = FoodSerializer
    permission_classes = [permissions.AllowAny]
    
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ["name", "category"]
    filterset_fields = ["category"]


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Never trust a client-supplied total; derive it from the stored price.
        food = serializer.validated_data["food"]
        quantity = serializer.validated_data.get("quantity", 1) or 1
        serializer.save(user=self.request.user, total_price=food.price * quantity)


class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Review.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ContactMessageViewSet(viewsets.ModelViewSet):
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ContactMessage.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def profile(request):
    return Response({
        "username": request.user.username,
        "email": request.user.email,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_info(request):
    return Response({
        "username": request.user.username,
        "email": request.user.email,
        "is_staff": request.user.is_staff,
        "is_superuser": request.user.is_superuser,
    })


@api_view(["GET"])
@permission_classes([IsAdminUser])
def dashboard_stats(request):
    return Response({
        "total_foods": Food.objects.count(),
        "total_orders": Order.objects.count(),
        "total_revenue": Order.objects.aggregate(total=Sum("total_price"))["total"] or 0,
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def track_login(request):
    UserSession.objects.create(user=request.user, is_active=True)
    return Response({"message": "Login tracked"})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def track_logout(request):
    UserSession.objects.filter(user=request.user, is_active=True).update(is_active=False)
    return Response({"message": "Logout tracked"})


@api_view(["GET"])
@permission_classes([AllowAny])
def active_users_count(request):
    count = UserSession.objects.filter(is_active=True).values("user").distinct().count()
    return Response({"active_users": count})


@api_view(["GET"])
@permission_classes([IsAdminUser])
def user_logins(request):
    sessions = UserSession.objects.select_related("user").order_by("-logged_in_at")
    data = []
    for s in sessions:
        data.append({
            "id": s.id,
            "username": s.user.username,
            "email": s.user.email,
            "is_staff": s.user.is_staff,
            "logged_in_at": s.logged_in_at,
            "is_active": s.is_active,
        })
    return Response(data)


@api_view(["POST"])
@permission_classes([AllowAny])
def send_otp(request):
    phone = request.data.get("phone")
    if not phone:
        return Response({"error": "Phone number is required"}, status=400)

    try:
        profile = Profile.objects.get(phone=phone)
    except Profile.DoesNotExist:
        return Response({"error": "Phone number not found"}, status=404)

    otp_code = str(random.randint(100000, 999999))

    # In production an OTP can only be delivered by email. If the mail backend
    # is not configured, fail loudly instead of reporting a false success.
    if not settings.DEBUG and not _email_configured():
        logger.error(
            "send_otp called but no email backend is configured (EMAIL_HOST_USER)."
        )
        return Response(
            {"error": "Email delivery is not configured; contact support."},
            status=503,
        )

    OTP.objects.filter(user=profile.user, is_used=False).update(is_used=True)
    OTP.objects.create(user=profile.user, otp=otp_code)

    payload = {"message": "OTP sent successfully"}

    # Never expose the OTP in a real deployment. In DEBUG we surface it (and
    # log it) so local development works without a mail server.
    if settings.DEBUG:
        payload["otp"] = otp_code
        logger.info("OTP for %s: %s", phone, otp_code)

    if _email_configured():
        send_mail(
            "Your password reset OTP",
            f"Your OTP is {otp_code}. It expires in 5 minutes.",
            settings.DEFAULT_FROM_EMAIL,
            [profile.user.email],
            fail_silently=True,
        )

    return Response(payload)


@api_view(["POST"])
@permission_classes([AllowAny])
def verify_otp(request):
    phone = request.data.get("phone")
    otp_code = request.data.get("otp")

    if not phone or not otp_code:
        return Response({"error": "Phone and OTP are required"}, status=400)

    try:
        profile = Profile.objects.get(phone=phone)
    except Profile.DoesNotExist:
        return Response({"error": "Phone number not found"}, status=404)

    five_min_ago = timezone.now() - timedelta(minutes=5)
    otp_obj = OTP.objects.filter(
        user=profile.user, otp=otp_code, is_used=False, created_at__gte=five_min_ago
    ).last()

    if not otp_obj:
        return Response({"error": "Invalid or expired OTP"}, status=400)

    otp_obj.is_used = True
    otp_obj.save()

    # Issue a short-lived proof-of-verification token that reset_password
    # requires, so the reset cannot be performed without a valid OTP.
    reset_token = signing.dumps({"uid": profile.user_id}, salt=RESET_TOKEN_SALT)

    return Response({
        "message": "OTP verified successfully",
        "reset_token": reset_token,
    })


@api_view(["POST"])
@permission_classes([AllowAny])
def reset_password(request):
    phone = request.data.get("phone")
    new_password = request.data.get("new_password")
    token = request.data.get("token")

    if not new_password:
        return Response({"error": "New password is required"}, status=400)

    if not token:
        return Response(
            {"error": "OTP verification is required before resetting the password"},
            status=400,
        )

    try:
        data = signing.loads(
            token, salt=RESET_TOKEN_SALT, max_age=RESET_TOKEN_MAX_AGE
        )
    except signing.BadSignature:
        return Response({"error": "Invalid or expired verification token"}, status=400)

    user = User.objects.filter(id=data.get("uid")).first()
    if user is None:
        return Response({"error": "Invalid verification token"}, status=400)

    # If a phone was supplied it must match the account the token was issued for.
    if phone:
        profile = Profile.objects.filter(phone=phone).first()
        if profile is None or profile.user_id != user.id:
            return Response({"error": "Phone does not match verification token"}, status=400)

    user.set_password(new_password)
    user.save()

    return Response({"message": "Password reset successfully"})

