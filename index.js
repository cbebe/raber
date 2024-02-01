const addPiece = document.getElementById("add-piece");
const calculate = document.getElementById("calculate");

function createNewElement(length, numPieces) {
  const pieceList = document.querySelectorAll("#piece-list > li");
  const ids = [].map.call(pieceList, (e) => e.id.split("-")[1]);
  const newId = Math.max(ids) + 1;
  const li = document.createElement("li");
  li.setAttribute("data-len", length);
  li.setAttribute("data-pcs", numPieces);
  li.setAttribute("id", `piece-${newId}`);
  li.innerHTML = `${length} cm (${numPieces} pcs)<button>Delete</button>`;
  return li;
}

function getInput(id) {
  const input = document.getElementById(id);
  return Number(input.value);
}

function deletePiece(e) {
  const li = e.target.parentElement;
  li.querySelector("button").removeEventListener("click", deletePiece);
  li.parentElement.removeChild(li);
}

function refreshEventListeners() {
  const pieceList = document.querySelectorAll("#piece-list > li");
  for (const p of pieceList) {
    p.querySelector("button").removeEventListener("click", deletePiece);
  }
  for (const p of pieceList) {
    p.querySelector("button").addEventListener("click", deletePiece);
  }
}

addPiece.addEventListener("click", () => {
  const pieceList = document.querySelector("#piece-list");
  const piece = createNewElement(getInput("section"), getInput("num-pieces"));
  piece.querySelector("button").addEventListener("click", deletePiece);
  pieceList.appendChild(piece);
});

calculate.addEventListener("click", () => {
  const rebar = getInput("rebar")
  const piece = getInput("piece")
  const pieceList = document.querySelectorAll("#piece-list > li");
  const needed = {};

  for (const p of pieceList) {
    const length = p.getAttribute('data-len')
    const numPieces = p.getAttribute('data-pcs')
    if (!(length in needed)) {
      needed[length] = 0
    }
    needed[length] += Number(numPieces)
  }
  const raber = new Raber(rebar, piece);
  const rebars = raber.calculate(needed);
  const [total, waste]  = raber.calculateWaste(rebars);
        alert(`\
Combinations and # of pieces: ${JSON.stringify(rebars, null, 2)}
Full 12m rebars required: ${total}
Waste: ${(waste/100).toFixed(2)} m`)
});

refreshEventListeners();
