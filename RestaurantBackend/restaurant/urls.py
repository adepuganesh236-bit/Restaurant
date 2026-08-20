from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import FoodViewSet, OrderViewSet, RegisterView, profile, user_info, dashboard_stats, ReviewViewSet, ContactMessageViewSet, track_login, track_logout, active_users_count, user_logins, send_otp, verify_otp, reset_password

router = DefaultRouter()
router.register(r"foods", FoodViewSet, basename="food")
router.register(r"orders", OrderViewSet, basename="order")
router.register(r"reviews", ReviewViewSet, basename="review")
router.register(r"contacts", ContactMessageViewSet, basename="contact")

urlpatterns = [
    path("", include(router.urls)),
    path("register/", RegisterView.as_view(), name="register"),
    path("profile/", profile, name="profile"),
    path("user-info/", user_info, name="user-info"),
    path("dashboard-stats/", dashboard_stats, name="dashboard-stats"),
    path("dashboard/", dashboard_stats, name="dashboard"),
    path("track-login/", track_login, name="track-login"),
    path("track-logout/", track_logout, name="track-logout"),
    path("active-users/", active_users_count, name="active-users"),
    path("user-logins/", user_logins, name="user-logins"),
    path("send-otp/", send_otp, name="send-otp"),
    path("verify-otp/", verify_otp, name="verify-otp"),
    path("reset-password/", reset_password, name="reset-password"),
]

