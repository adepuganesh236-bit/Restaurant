from django.contrib import admin
from .models import Food,  Order, Review

admin.site.register(Food)
admin.site.register(Review)

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "food",
        "quantity",
        "total_price",
        "ordered_at",
    )

    list_filter = ("ordered_at",)
    search_fields = ("user__username", "food__name")
