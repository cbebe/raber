class Raber {
  #rebarLength;
  #pieceSize;

  constructor(rebarLength, pieceSize) {
    this.#rebarLength = rebarLength;
    this.#pieceSize = pieceSize;
  }

  calculateWaste(required) {
    function getValue(v) {
      const value = JSON.parse(String(v));
      if (Array.isArray(value)) {
        return sum(value);
      } else {
        return value;
      }
    }
    let totalPieces = Object.values(required).reduce(
      (acc, curr) => acc + getValue(curr),
      0,
    );

    // Always assume that the full rebar produces two pieces
    let numFullRebars = Math.ceil(totalPieces / 2);
    let fromBend = (this.#rebarLength - (this.#pieceSize * 2)) * numFullRebars;

    let fromExtraPiece = this.#pieceSize * (totalPieces % 2);

    let fromPieceRemainders = Object.entries(required).reduce(
      (acc, [length, quantity]) => {
        return acc + (this.#pieceSize - getValue(length)) * quantity;
      },
      0,
    );

    let totalWaste = fromBend + fromExtraPiece + fromPieceRemainders;

    return [numFullRebars, totalWaste];
  }

  createCombinations(needed) {
    const allValidBars = Object.entries(needed).flatMap(([length, num_pcs]) => {
      const maxBars = Math.min(Math.ceil(this.#pieceSize / length), num_pcs);
      return Array.from({ length: maxBars }, () => Number(length));
    });

    const validCombos = new Set();
    const seen = new Set();

    for (let i = 0; i <= allValidBars.length; i++) {
      for (let combo of getPermutations(allValidBars, i)) {
        if (combo.length > 0 && !seen.has(JSON.stringify(combo))) {
          const sumLengths = combo.reduce((acc, curr) => acc + curr, 0);
          if (sumLengths <= this.#pieceSize) {
            validCombos.add(JSON.stringify(combo.sort()));
          }
        }
        seen.add(JSON.stringify(combo));
      }
    }

    return Array.from(validCombos, (combo) => JSON.parse(combo));
  }

  calculate(needed) {
    if (Math.min(...Object.keys(needed)) * 2 > this.#pieceSize) {
      return Object.entries(needed).reduce((acc, [length, num]) => {
        acc[[length]] = num;
        return acc;
      }, {});
    }

    if (Object.keys(needed).length === 1) {
      let [length, numPieces] = Object.entries(needed)[0];
      let numInOnePiece = Math.floor(this.#pieceSize / length);
      let numRebars = {};
      numRebars[[...Array(numInOnePiece)].map(() => length)] = Math.floor(
        numPieces / numInOnePiece,
      );
      let remainder = numPieces % numInOnePiece;
      if (remainder > 0) {
        numRebars[[...Array(remainder)].map(() => length)] = 1;
      }
      return numRebars;
    }

    // This is buggy!
    let combinations = Array.from(this.createCombinations(needed));
    let cp = { ...needed };
    let rebars = {};

    while (Object.values(cp).some((v) => v > 0)) {
      let minWaste = combinations.reduce((acc, curr) =>
        sum(curr) > sum(acc) ? curr : acc
      );

      let counter;
      while ((counter = comboFits(cp, minWaste))) {
        rebars[JSON.stringify(minWaste)] =
          (rebars[JSON.stringify(minWaste)] || 0) + 1;
        for (let [length, count] of Object.entries(counter)) {
          cp[length] -= count;
        }
      }
      combinations = combinations.filter((combo) => !isEqual(combo, minWaste));
    }
    return rebars;
  }
}

function isEqual(arr1, arr2) {
  return arr1.length === arr2.length &&
    arr1.every((val, index) => val === arr2[index]);
}

function sum(arr) {
  return arr.reduce((acc, curr) => acc + curr, 0);
}

function comboFits(needed, combo) {
  let c = combo.reduce((counter, length) => {
    counter[length] = (counter[length] || 0) + 1;
    return counter;
  }, {});

  let valid = Object.entries(c).every(([length, count]) =>
    count <= needed[length]
  );
  return valid ? c : null;
}

function getPermutations(array, size) {
  function p(t, i) {
    if (t.length === size) {
      result.push(t);
      return;
    }
    if (i + 1 > array.length) {
      return;
    }
    p(t.concat(array[i]), i + 1);
    p(t, i + 1);
  }

  var result = [];
  p([], 0);
  return result;
}
