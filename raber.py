#!/usr/bin/env python
"""
raber.py

Given the number of sections needed, calculate the number 12m rebars
required and the amount of waste.
"""

import math
from collections import Counter, defaultdict
from itertools import combinations

REBAR_LENGTH = 1200
PIECE_SIZE = 550

sizes = {
    3: {
        170: 16,  # T02
        15: 8,  # T03
        200: 126,  # Decking!
    },
    4: {325: 20},  # A03
    5: {
        413: 8,  # T01
        300: 4,  # A02
    },
    6: {285: 20},  # A01
}


def calculate_waste(required: dict):
    """
    Calculate waste from rebar pieces.
    """
    total_pieces = sum(required.values())

    # Always assume that the full rebar produces two pieces
    num_full_rebars = math.ceil(total_pieces / 2)
    from_bend = (REBAR_LENGTH - (PIECE_SIZE*2)) * num_full_rebars

    from_extra_piece = PIECE_SIZE * (total_pieces % 2)

    from_piece_remainders = sum(
        (PIECE_SIZE - sum(k)) * v
        for k, v in required.items()
    )

    total_waste = from_bend + from_extra_piece + from_piece_remainders

    return num_full_rebars, total_waste


def create_combinations(needed: dict):
    """
    Assumption: There are only two kinds
    """
    def get_max_bars(tup: tuple):
        length, num_pcs = tup
        return [length] * min(math.ceil(PIECE_SIZE/length), num_pcs)
    all_valid_bars = [j for i in needed.items() for j in get_max_bars(i)]
    valid_combos = set()
    seen = set()
    for i in range(len(all_valid_bars)):
        for c in combinations(all_valid_bars, i):
            if c not in seen and sum(c) <= PIECE_SIZE and len(c):
                valid_combos.add(c)
            seen.add(c)
    return valid_combos


def combo_fits(needed: dict, combo: tuple):
    """
    Check if the combination satisfies the pieces still needed
    """
    c = Counter(combo)
    valid = all(c[k] <= needed[k] for k in c)
    return c if valid else None


def main(needed: dict):
    """
    Inputs
    ------

    - `input`: Dictionary with keys as lengths and values as the quantity.
    """

    # Case 1: the PIECE_SIZE can only produce 1 piece from the input,
    # the rest is wasted
    if min(needed.keys()) * 2 > PIECE_SIZE:
        return {(length,): num for length, num in needed.items()}

    # Case 2: Only one length, just calculate
    if len(needed) == 1:
        length, num_pcs = next(iter(needed.items()))
        num_in_1_piece = PIECE_SIZE // length
        num_rebars = {(length,) * num_in_1_piece: num_pcs//num_in_1_piece}
        remainder = num_pcs % num_in_1_piece
        if remainder:
            num_rebars[(length,) * remainder] = 1
        return num_rebars

    # Case 3: Can be matched
    # greedy solution, not sure if it's good tbh
    combinations = create_combinations(needed)
    cp = dict(needed)
    rebars = defaultdict(lambda: 0)
    while any(c for c in cp.values()):
        min_waste = max(combinations, key=sum)
        while (counter := combo_fits(cp, min_waste)):
            rebars[min_waste] += 1
            for c in counter:
                cp[c] -= counter[c]
        combinations.remove(min_waste)

    return dict(rebars)


if __name__ == "__main__":
    for k, v in sizes.items():
        num_rebars = main(v)
        num_full_rebars, waste = calculate_waste(num_rebars)
        print("-------------------\n"
              f"{v}\n"
              f"#{k} rebar {PIECE_SIZE} cm pieces: {num_rebars}\n"
              f"#{k} full 12m rebars: {num_full_rebars}\n"
              f"waste: {waste/100:02} m")
