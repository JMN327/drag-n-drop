const gridContainer = document.querySelector(".grid-container");
gridContainerStyles = getComputedStyle(gridContainer);
let gap = parseInt(gridContainerStyles.getPropertyValue("gap"));
let padding = parseInt(gridContainerStyles.getPropertyValue("padding"));

let item = null;
let itemAbove = null;
let itemAboveY = null;
let itemBelow = null;
let itemBelowY = null;
let shiftY = null;
let startY = null;
let itemLocalPosY = null;
let switchOffset = 0;
let animating = false;

let sticky = false;

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
  item = event.target;
  item.classList.add("grabbed");
  item.style.zIndex = 1000;

  getImmediateSiblings(item);

  shiftY = event.offsetY;
  startY = item.getBoundingClientRect().top;
});

gridContainer.addEventListener("mousemove", (event) => {
  if (!item) {
    return;
  }
  if (animating) {
    return;
  }

  if (itemAbove) {
    let switchCheck = item.getBoundingClientRect().top;
    if (switchCheck <= itemAboveY) {
      let itemHeightSnapshot = itemAbove.offsetHeight;
      switchOffset += gap + itemHeightSnapshot;
      item.parentNode.insertBefore(item, itemAbove);
      getImmediateSiblings(item);

      animateSnap(itemBelow, -itemHeightSnapshot, 0, 150);
    }
  }

  if (itemBelow) {
    let switchCheck = item.getBoundingClientRect().top;
    if (switchCheck >= itemBelowY) {
      let itemHeightSnapshot = itemBelow.offsetHeight;
      switchOffset -= gap + itemHeightSnapshot;
      item.parentNode.insertBefore(itemBelow, item);
      getImmediateSiblings(item);

      animateSnap(itemAbove, itemHeightSnapshot, 0, 150);
    }
  }

  itemLocalPosY = event.clientY - startY + switchOffset - shiftY;
  
  itemContainerPosY =
    event.clientY - shiftY - gridContainer.getBoundingClientRect().top;

  if (itemContainerPosY < 0) {
    item.parentNode.prepend(item);
    itemLocalPosY = -padding;
    item.style.top = itemLocalPosY + "px";
  } else if (itemContainerPosY > gridContainer.offsetHeight - item.offsetHeight) {
    item.parentNode.append(item);
    itemLocalPosY = padding;
    item.style.top = itemLocalPosY + "px";
  } else {
    item.style.top = itemLocalPosY + "px";
  }

  getImmediateSiblings(item);
  
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
  if (!item) {
    return;
  }
  const snapAnimation = animateSnap(item, 0, -itemLocalPosY, 150);
  snapAnimation.onfinish = () => {
    item.style.top = 0 + "px";
    item.style.zIndex = 0;
    item.classList.remove("grabbed");
    item = null;
    shiftY = null;
    startY = null;
    switchOffset = 0;
    itemLocalPosY = 0;
    animating = false;
  };
}

function getImmediateSiblings(currentItem) {
  itemAbove = currentItem.previousElementSibling;
  itemBelow = currentItem.nextElementSibling;
  if (itemAbove) {
    itemAboveY = itemAbove.getBoundingClientRect().top;
  }
  if (itemBelow) {
    itemBelowY = itemBelow.getBoundingClientRect().top;
  }
}

function animateSnap(
  thisItem,
  startPosition,
  endPosition,
  durationMS
) {
  const snap = [
    { transform: `translate(0px, ${startPosition}px)` },
    { transform: `translate(0px, ${endPosition}px)` },
  ];
  const snapTiming = {
    duration: durationMS,
  };

  return thisItem.animate(snap, snapTiming);
}
