const gridContainer = document.querySelector(".grid-container");
gridContainerStyles = getComputedStyle(gridContainer);
let gap = parseInt(gridContainerStyles.getPropertyValue("gap"));
let padding = parseInt(gridContainerStyles.getPropertyValue("padding"));

let row = null;
let elder = null;
let elderY = null;
let younger = null;
let youngerY = null;
let shiftY = null;
let startY = null;
let currentYPos = null;
let containerBottom = null;
let switchOffset = 0;
let animating = false;

let sticky = true;

gridContainer.addEventListener("mousedown", (event) => {
  if (!event.target.classList.contains("grid-item")) {
    return;
  }
  if (event.buttons !== 1) {
    return;
  }
  if (animating) {
    return;
  }
  row = event.target;
  row.classList.add("grabbed");
  row.style.zIndex = 1000;

  getImmediateSiblings(row);

  shiftY = event.offsetY;
  startY = row.getBoundingClientRect().top;
  containerBottom = gridContainer.offsetHeight - row.offsetHeight - padding;
  console.log(containerBottom);
});

gridContainer.addEventListener("mousemove", (event) => {
  if (!row) {
    return;
  }
  if (animating) {
    return;
  }

  if (elder) {
    let switchCheck = row.getBoundingClientRect().top;
    if (switchCheck <= elderY) {
      let currentHeight = elder.offsetHeight;
      switchOffset += gap + currentHeight;
      row.parentNode.insertBefore(row, elder);
      getImmediateSiblings(row);
      const snap = [
        { transform: `translate(0px, ${-currentHeight}px)` },
        { transform: `translate(0px, 0px)` },
      ];
      const snapTiming = {
        duration: 100,
        iterations: 1,
      };

      younger.animate(snap, snapTiming);
    }
  }

  if (younger) {
    let switchCheck = row.getBoundingClientRect().top;
    if (switchCheck >= youngerY) {
      let currentHeight = younger.offsetHeight;
      switchOffset -= gap + currentHeight;
      row.parentNode.insertBefore(younger, row);
      getImmediateSiblings(row);
      const snap = [
        { transform: `translate(0px, ${currentHeight}px)` },
        { transform: `translate(0px, 0px)` },
      ];
      const snapTiming = {
        duration: 100,
        iterations: 1,
      };

      elder.animate(snap, snapTiming);
    }
  }

  let mouseYRelToContainer = event.clientY - startY;
  currentYPos = mouseYRelToContainer + switchOffset - shiftY;
  containerPos =
    event.clientY - shiftY - gridContainer.getBoundingClientRect().top;

  if (containerPos < 0) {
    row.parentNode.prepend(row);
    row.style.top = -padding + "px";
    currentYPos = -padding;
  } else if (containerPos > containerBottom) {
    row.parentNode.append(row);
    row.style.top = padding + "px";
    currentYPos = padding;
  } else {
    row.style.top = currentYPos + "px";
  }
});

gridContainer.addEventListener("mouseup", (event) => {
  release(event);
});

if (sticky) {
  gridContainer.addEventListener("mouseenter", (event) => {
    if (event.buttons !== 1) {
      release(event);
    }
  });
} else {
  gridContainer.addEventListener("mouseleave", (event) => {
    if (event.buttons == 1) {
      release(event);
    }
  });
}




function release(event) {
  if (!row) {
    return;
  }
  const snap = [{ transform: `translate(0px, ${-currentYPos}px)` }];
  const snapTiming = {
    duration: 100,
    iterations: 1,
  };
  animating = true;
  const snapAni = row.animate(snap, snapTiming);
  snapAni.onfinish = (event) => {
    row.style.top = 0 + "px";
    row.style.zIndex = 0;
    row.classList.remove("grabbed");
    row = null;
    shiftY = null;
    startY = null;
    switchOffset = 0;
    currentYPos = 0;
    animating = false;
  };
}

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
