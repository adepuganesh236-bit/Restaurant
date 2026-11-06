from decimal import Decimal
from io import StringIO

from django.core.management import call_command
from django.test import TestCase

from .management.commands.seed_foods import FOODS
from .models import Food


class SeedFoodsCommandTests(TestCase):
    def test_bootstraps_empty_menu_without_duplicates(self):
        Food.objects.all().delete()
        out = StringIO()

        call_command("seed_foods", stdout=out)
        self.assertEqual(Food.objects.count(), len(FOODS))

        call_command("seed_foods", stdout=out)
        self.assertEqual(Food.objects.count(), len(FOODS))

    def test_does_not_resurrect_deleted_items_without_force(self):
        Food.objects.all().delete()
        first = FOODS[0]
        Food.objects.create(
            name=first[0],
            category=first[1],
            price=Decimal(first[2]),
            available=first[3],
        )
        out = StringIO()

        call_command("seed_foods", stdout=out)
        self.assertEqual(Food.objects.count(), 1)

        call_command("seed_foods", "--force", stdout=out)
        self.assertEqual(Food.objects.count(), len(FOODS))
