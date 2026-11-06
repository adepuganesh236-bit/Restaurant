from io import StringIO

from django.core.management import call_command
from django.test import TestCase

from .management.commands.seed_foods import FOODS
from .models import Food


class SeedFoodsCommandTests(TestCase):
    def test_seeds_missing_foods_without_duplicates(self):
        Food.objects.all().delete()
        out = StringIO()

        call_command("seed_foods", stdout=out)
        self.assertEqual(Food.objects.count(), len(FOODS))

        call_command("seed_foods", stdout=out)
        self.assertEqual(Food.objects.count(), len(FOODS))
