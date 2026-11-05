from rest_framework import serializers
from .models import Food, Order, Review, ContactMessage, Profile
from django.contrib.auth.models import User


class FoodSerializer(serializers.ModelSerializer):
    class Meta:
        model = Food
        fields = '__all__'

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("price must be a greater than 0")
        return value

    def validate_name(self, value):
        if len(value)< 3:
            raise serializers.ValidationError("Food name must contain at least 3 characters")
        return value

class UserSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "password", "phone"]
        extra_kwargs = {
            "password": {"write_only": True}
        }

    def validate_phone(self, value):
        if Profile.objects.filter(phone=value).exists():
            raise serializers.ValidationError("This phone number is already registered.")
        return value

    def create(self, validated_data):
        phone = validated_data.pop("phone")
        user = User.objects.create_user(
            username=validated_data.get("username"),
            email=validated_data.get("email"),
            password=validated_data.get("password")
        )
        Profile.objects.create(user=user, phone=phone)
        return user


class OrderSerializer(serializers.ModelSerializer):
    food_name = serializers.CharField(source="food.name", read_only=True)

    class Meta:
        model = Order
        fields = "__all__"
        read_only_fields = ["user", "total_price"]

    def validate_food(self, value):
        if not value.available:
            raise serializers.ValidationError("This item is currently unavailable.")
        return value

    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError("Quantity must be at least 1.")
        return value

    def update(self, instance, validated_data):
        # Food is fixed at creation time; changing it would desync the price.
        validated_data.pop("food", None)
        if "quantity" in validated_data:
            validated_data["total_price"] = instance.food.price * validated_data["quantity"]
        return super().update(instance, validated_data)


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = "__all__"
        read_only_fields = ["user"]

    def validate_rating(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = "__all__"
        read_only_fields = ["user"]
