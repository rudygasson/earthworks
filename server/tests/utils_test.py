from utils import merge_area_lists
from utils_fixtures import (
    area_list_a,
    area_list_b,
    combined_area_list_a_b,
    combined_area_list_b_a
)


def test_first_smaller():
    combination = merge_area_lists(area_list_a, area_list_b)
    assert combination == combined_area_list_a_b, "Content is different"


def test_first_greater():
    combination = merge_area_lists(area_list_b, area_list_a)
    assert combination == combined_area_list_b_a
