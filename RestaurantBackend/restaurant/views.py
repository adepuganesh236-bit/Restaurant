from django.shortcuts import render
from django.db.models import Sum
from rest_framework import viewsets, generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import Food, Order, Review, ContactMessage, UserSession, Profile, OTP
from .serializers import FoodSerializer, OrderSerializer, UserSerializer, ReviewSerializer, ContactMessageSerializer
from django.contrib.auth.models import User
from django_filters.rest_framework import DjangoFilterBackend
import random
from datetime import timedelta
from django.utils import timezone


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
        serializer.save(user=self.request.user)


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
@permission_classes([IsAuthenticated])
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
@permission_classes([IsAuthenticated])
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
    OTP.objects.filter(user=profile.user, is_used=False).update(is_used=True)
    OTP.objects.create(user=profile.user, otp=otp_code)

    return Response({"message": "OTP sent successfully", "otp": otp_code})


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

    return Response({"message": "OTP verified successfully"})


@api_view(["POST"])
@permission_classes([AllowAny])
def reset_password(request):
    phone = request.data.get("phone")
    new_password = request.data.get("new_password")

    if not phone or not new_password:
        return Response({"error": "Phone and new password are required"}, status=400)

    try:
        profile = Profile.objects.get(phone=phone)
    except Profile.DoesNotExist:
        return Response({"error": "Phone number not found"}, status=404)

    user = profile.user
    user.set_password(new_password)
    user.save()

    return Response({"message": "Password reset successfully"})

