from decimal import Decimal

from django.core.management.base import BaseCommand

from restaurant.models import Food

FOODS = [
    ("Chicken Biryani", "Non-Veg", "250", True),
    ("Mutton Biryani", "Non-Veg", "350", True),
    ("Paneer Butter Masala", "Veg", "200", True),
    ("Veg Biryani", "Veg", "150", True),
    ("Veg Fried Rice", "Veg", "120", True),
    ("Chicken Fried Rice", "Non-Veg", "200", True),
    ("Veg Pulao", "Veg", "150", True),
    ("Pizza", "Veg", "300", True),
    ("Burger", "Veg", "150", True),
    ("French Fries", "Veg", "120", True),
    ("Chicken Noodles", "Non-Veg", "200", True),
    ("Ice Cream", "Ice Cream", "100", True),
    ("Chocolate Cake", "Desserts", "180", True),
    ("Soft Drinks", "Drinks", "50", True),
    ("Butter Chicken", "Non-Veg", "300", True),
    ("Chicken Wings", "Starters", "180", True),
    ("Paneer Tikka", "Starters", "150", True),
    ("Veg Spring Rolls", "Starters", "120", True),
    ("Chicken 65", "Starters", "200", True),
    ("Fish Fingers", "Starters", "220", True),
    ("Hara Bhara Kebab", "Starters", "130", True),
    ("Tandoori Chicken", "Starters", "250", True),
    ("Onion Rings", "Starters", "100", True),
    ("Cold Coffee", "Drinks", "80", True),
    ("Mango Lassi", "Drinks", "90", True),
    ("Fresh Lime Soda", "Drinks", "60", True),
    ("Masala Chai", "Drinks", "40", True),
    ("Milkshake", "Drinks", "100", True),
    ("Thandai", "Drinks", "110", True),
    ("Vanilla Ice Cream", "Ice Cream", "80", True),
    ("Chocolate Ice Cream", "Ice Cream", "90", True),
    ("Strawberry Ice Cream", "Ice Cream", "90", True),
    ("Butterscotch Ice Cream", "Ice Cream", "85", True),
    ("Kulfi", "Ice Cream", "70", True),
    ("Sundae", "Ice Cream", "120", True),
    ("Gulab Jamun", "Desserts", "80", True),
    ("Rasgulla", "Desserts", "90", True),
    ("Jalebi", "Desserts", "70", True),
    ("Panna Cotta", "Desserts", "150", True),
    ("Palak Paneer", "Veg", "180", True),
    ("Aloo Gobi", "Veg", "140", True),
    ("Dal Makhani", "Veg", "160", True),
    ("Veg Manchurian", "Veg", "150", True),
    ("Chicken Tikka", "Non-Veg", "220", True),
    ("Fish Curry", "Non-Veg", "280", True),
    ("Prawn Masala", "Non-Veg", "300", True),
    ("Egg Curry", "Non-Veg", "140", True),
    ("Chole Bhature", "Veg", "130", True),
    ("Masala Dosa", "Veg", "110", True),
    ("Idli Sambar", "Veg", "80", True),
    ("Pav Bhaji", "Veg", "120", True),
    ("Veg Thali", "Veg", "200", True),
    ("Rajma Chawal", "Veg", "140", True),
    ("Malai Kofta", "Veg", "220", True),
    ("Butter Naan", "Veg", "60", True),
    ("Garlic Naan", "Veg", "70", True),
    ("Chicken Tikka Masala", "Non-Veg", "280", True),
    ("Mutton Rogan Josh", "Non-Veg", "350", True),
    ("Chicken Korma", "Non-Veg", "270", True),
    ("Egg Bhurji", "Non-Veg", "100", True),
    ("Keema Pav", "Non-Veg", "180", True),
    ("Chicken Shawarma", "Non-Veg", "150", True),
    ("Mutton Seekh Kebab", "Non-Veg", "260", True),
    ("Chicken Momos", "Starters", "120", True),
    ("Veg Momos", "Starters", "100", True),
    ("Samosa", "Starters", "60", True),
    ("Aloo Tikki", "Starters", "70", True),
    ("Pani Puri", "Starters", "50", True),
    ("Dahi Puri", "Starters", "60", True),
    ("Chicken Seekh Kebab", "Starters", "200", True),
    ("Paneer Pakora", "Starters", "110", True),
    ("Brownie", "Desserts", "150", True),
    ("Tiramisu", "Desserts", "200", True),
    ("Cheesecake", "Desserts", "220", True),
    ("Creme Brulee", "Desserts", "180", True),
    ("Phirni", "Desserts", "90", True),
    ("Halwa", "Desserts", "80", True),
    ("Kheer", "Desserts", "70", True),
    ("Mango Pudding", "Desserts", "110", True),
    ("Carrot Halwa", "Desserts", "100", True),
    ("Shahi Tukda", "Desserts", "120", True),
]


class Command(BaseCommand):
    help = (
        "Create default menu items that are missing from the database. "
        "Existing foods, users, orders and reviews are never modified or deleted."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Report what would be created without writing to the database.",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        existing = set(Food.objects.values_list("name", flat=True))
        pending = [food for food in FOODS if food[0] not in existing]

        if not dry_run:
            Food.objects.bulk_create(
                [
                    Food(
                        name=name,
                        category=category,
                        price=Decimal(price),
                        available=available,
                    )
                    for name, category, price, available in pending
                ]
            )

        verb = "Would create" if dry_run else "Created"
        self.stdout.write(
            self.style.SUCCESS(
                f"{verb} {len(pending)} food item(s); "
                f"{Food.objects.count()} currently in the database."
            )
        )
