#!/usr/bin/env python
"""
raber.py

Given the number of sections needed, calculate the number 12m rebars
required and the amount of waste.
"""

import math
from collections import Counter

REBAR_LENGTH = 1200
PIECE_SIZE = 550
GROUPS = 2

sizes = {
    3: {
        170: 8,  # T02
        15: 4,  # T03
    },
    4: {325: 10},  # A03
    5: {
        413: 4,  # T01
        300: 2,  # A02
    },
    6: {285: 10},  # A01
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

    return from_bend + from_extra_piece + from_piece_remainders


def multiple_lengths(needed: dict):
    print('WARNING: multiple lengths NOT implemented')
    return {}


def main(inputs: dict, num_grps=1):
    """
    Inputs
    ------

    - `input`: Dictionary with keys as lengths and values as the quantity.
    - `num_grps`: Number of groups by which to multiply the original `input`
      values.
    """
    needed = {length: num_pcs*num_grps for length, num_pcs in inputs.items()}

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
    return multiple_lengths(needed)


if __name__ == "__main__":
    for k, v in sizes.items():
        num_rebars = main(v, GROUPS)
        waste = calculate_waste(num_rebars)
        print("-------------------\n"
              f"{v} * {GROUPS} groups\n"
              f"#{k} rebar {PIECE_SIZE} cm pieces: {num_rebars}\n"
              f"waste: {waste/100:02} m")
