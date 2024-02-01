class Raber {
  #bendWaste;
  #rebarPieceSize;

  constructor(rebarLength, rebarPieceSize) {
    this.#bendWaste = rebarLength - (rebarPieceSize * 2);
    this.#rebarPieceSize = rebarPieceSize;
  }

  calculateWaste(required) {
    const req = Object.entries(required);
    const totalPieces = req
      .map((e) => e[1])
      .reduce((acc, curr) => acc + numOrNumList(curr), 0);

    // Always assume that the full rebar produces two pieces
    const numFullRebars = Math.ceil(totalPieces / 2);

    const fromBend = this.#bendWaste * numFullRebars;
    const fromExtraPiece = this.#rebarPieceSize * (totalPieces % 2);
    const fromPieceRemainders = req
      .reduce(
        (acc, [length, quantity]) =>
          acc + (this.#rebarPieceSize - numOrNumList(length)) * quantity,
        0,
      );

    return [numFullRebars, fromBend + fromExtraPiece + fromPieceRemainders];
  }

  createCombinations(needed) {
    const allValidBars = Object.entries(needed)
      .flatMap(([length, numPieces]) => {
        const maxBars = Math.min(
          Math.ceil(this.#rebarPieceSize / length),
          numPieces,
        );
        return Array.from({ length: maxBars }, () => Number(length));
      });

    const validCombos = new Set();
    const seen = new Set();

    for (let i = 0; i <= allValidBars.length; i++) {
      for (const combo of getPermutations(allValidBars, i)) {
        if (combo.length > 0 && !seen.has(JSON.stringify(combo))) {
          const sumLengths = combo.reduce((acc, curr) => acc + curr, 0);
          if (sumLengths <= this.#rebarPieceSize) {
            validCombos.add(JSON.stringify(combo.sort()));
          }
        }
        seen.add(JSON.stringify(combo));
      }
    }

    return Array.from(validCombos, (combo) => JSON.parse(combo));
  }

  calculate(needed) {
    const entries = Object.entries(needed);
    // Case 1: Only 1 type of section piece
    if (entries.length === 1) {
      const [[length, numPieces]] = entries;
      return singleType(numPieces, length, this.#rebarPieceSize);
    }

    // Case 2: Only 1 section piece can be produced from the rebar piece
    if (Math.min(entries.map((e) => Number(e[0]))) * 2 > this.#rebarPieceSize) {
      return Object.entries(needed).reduce((acc, [length, num]) => {
        acc[[length]] = num;
        return acc;
      }, {});
    }

    let combinations = Array.from(this.createCombinations(needed));
    const cp = { ...needed };
    const rebars = {};

    while (Object.values(cp).some((v) => v > 0)) {
      const minWaste = combinations.reduce((acc, curr) =>
        sum(curr) > sum(acc) ? curr : acc
      );

      let counter;
      while ((counter = comboFits(cp, minWaste))) {
        rebars[JSON.stringify(minWaste)] =
          (rebars[JSON.stringify(minWaste)] || 0) + 1;
        for (const [length, count] of counter) {
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
  const c = combo.reduce((counter, length) => {
    counter[length] = (counter[length] || 0) + 1;
    return counter;
  }, {});

  const entries = Object.entries(c);
  const valid = entries.every(([length, count]) => count <= needed[length]);
  return valid ? entries : null;
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

function singleType(numPieces, pieceLength, rebarPieceSize) {
  const numInOnePiece = Math.floor(rebarPieceSize / pieceLength);
  const numRebars = {};
  numRebars[[...Array(numInOnePiece)].map(() => pieceLength)] = Math.floor(
    numPieces / numInOnePiece,
  );

  const remainder = numPieces % numInOnePiece;
  if (remainder > 0) {
    numRebars[[...Array(remainder)].map(() => pieceLength)] = 1;
  }
  return numRebars;
}

function numOrNumList(v) {
  const value = JSON.parse(String(v));
  if (Array.isArray(value)) {
    return sum(value);
  } else {
    return value;
  }
}
