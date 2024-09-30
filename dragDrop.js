const gridContainer = document.querySelector(".grid-container");
gridContainerStyles = getComputedStyle(gridContainer);
let gap = parseInt(gridContainerStyles.getPropertyValue("gap"));

let row = null;
let elder = null;
let elderY = null
let younger = null;
let youngerY = null
let shiftY = null;
let startY = null;
let currentYPos = null;
let switchOffset = 0;

gridContainer.addEventListener("dragstart", (event) => {
  event.preventDefault();
  return false;
});

gridContainer.addEventListener("mousedown", (event) => {
  if (!event.target.classList.contains("grid-item")) {
    return;
  }
  row = event.target;
  row.classList.add("grabbed");
  row.style.zIndex = 1000;

  getImmediateSiblings(row);

  shiftY = event.offsetY;
  startY = row.getBoundingClientRect().top;
});

gridContainer.addEventListener("mousemove", (event) => {
  if (!row) {
    return;
  }

  if (elder) {
    let switchCheck = row.getBoundingClientRect().top;
    if (switchCheck < elderY) {
      switchOffset += gap + elder.offsetHeight;
      row.parentNode.insertBefore(row, elder);
      getImmediateSiblings(row);
    }
  }

  if (younger) {
    let switchCheck = row.getBoundingClientRect().top;
    if (switchCheck > youngerY) {
      switchOffset -= gap + younger.offsetHeight;
      row.parentNode.insertBefore(younger, row);
      getImmediateSiblings(row);
    }
  }
  

  let mouseYRelToContainer = event.clientY - startY;
  currentYPos = mouseYRelToContainer + switchOffset - shiftY;
  row.style.top = currentYPos + "px";
});

gridContainer.addEventListener("mouseup", (event) => {
  let endYPos = currentYPos;
  const snap = [{ transform: `translate(0px, ${-endYPos}px)` }];
  const snapTiming = {
    duration: 200,
    iterations: 1,
  };

  const snapAni = row.animate(snap, snapTiming);
  snapAni.onfinish = (event) => {
    row.style.top = 0 + "px";
    row.style.zIndex = 0;
    row.classList.remove("grabbed");
    row = null;
    shiftY = null;
    startY = null;
    switchOffset = 0;
  };
});

function getImmediateSiblings(currentRow) {
  elder = currentRow.previousElementSibling;
  younger = currentRow.nextElementSibling;
  if (elder) {
    elder.classList.add("elder");
    elderY = elder.getBoundingClientRect().top;
  }
  if (younger) {
    younger.classList.add("younger");
    youngerY = younger.getBoundingClientRect().top;
  }
}
