export function DragDropList() {
  console.log("DragDropList Initiated")
  const gridContainerList = document.querySelectorAll(".grid-container");
  const gridContainerArray = [...gridContainerList];

  gridContainerArray.forEach((gridContainer) => {
    makeDragNDrop(gridContainer);
  });

  function makeDragNDrop(gridContainer) {
    const gridContainerStyles = getComputedStyle(gridContainer);
    let gap = parseInt(gridContainerStyles.getPropertyValue("gap"));
    let paddingTop = parseInt(gridContainerStyles.getPropertyValue("padding-top"));

    let item = null;
    let itemAbove = null;
    let itemAboveY = null;
    let itemBelow = null;
    let itemBelowY = null;
    let gridContainerTop = null;
    let pointerOffset = null;
    let initialItemPosY = null;
    let itemContainerPosY = null;
    let itemLocalPosY = null;
    let switchOffset = 0;
    let animating = false;

    let sticky = true;

    gridContainer.addEventListener("mousedown", (event) =>
      pickUpGridItem(event)
    );
    gridContainer.addEventListener("mousemove", (event) => moveGridItem(event));
    gridContainer.addEventListener("mouseup", (event) =>
      releaseGridItem(event)
    );

    if (sticky) {
      gridContainer.addEventListener("mouseenter", (event) => {
        if (event.buttons !== 1) {
          releaseGridItem(event);
        }
      });
    } else {
      gridContainer.addEventListener("mouseleave", (event) => {
        if (event.buttons == 1) {
          releaseGridItem(event);
        }
      });
    }

    function pickUpGridItem(event) {
      item = event.target.closest(".grid-item");
      if (!item) {
        return;
      }
      if (event.buttons !== 1) {
        return;
      }
      if (animating) {
        return;
      }
      
      item.classList.add("moving");
      item.style.zIndex = 1000;
      gridContainerTop = gridContainer.getBoundingClientRect().top;
      initialItemPosY = item.getBoundingClientRect().top;
      pointerOffset = event.clientY - initialItemPosY;
      getImmediateSiblings(item);
    }

    function moveGridItem(event) {
      if (!item) {
        return;
      }
      if (animating) {
        return;
      }
      if (event.buttons !== 1) {
        return;
      }

      itemContainerPosY = event.clientY - pointerOffset - gridContainerTop;

      if (itemAbove) {
        if (itemContainerPosY <= itemAboveY) {
          let itemHeightSnapshot = itemAbove.offsetHeight;
          switchOffset += gap + itemHeightSnapshot;
          item.parentNode.insertBefore(item, itemAbove);
          getImmediateSiblings(item);

          animateSnap(itemBelow, -itemHeightSnapshot, 0, 150);
        }
      }

      if (itemBelow) {
        if (itemContainerPosY >= itemBelowY) {
          let itemHeightSnapshot = itemBelow.offsetHeight;
          switchOffset -= gap + itemHeightSnapshot;
          item.parentNode.insertBefore(itemBelow, item);
          getImmediateSiblings(item);

          animateSnap(itemAbove, itemHeightSnapshot, 0, 150);
        }
      }

      itemLocalPosY =
        event.clientY - initialItemPosY + switchOffset - pointerOffset;

      if (itemContainerPosY < 0) {
        item.parentNode.prepend(item);
        itemLocalPosY = -paddingTop;
        item.style.top = itemLocalPosY + "px";
      } else if (
        itemContainerPosY >
        gridContainer.offsetHeight - item.offsetHeight
      ) {
        item.parentNode.append(item);
        itemLocalPosY = paddingTop;
        item.style.top = itemLocalPosY + "px";
      } else {
        item.style.top = itemLocalPosY + "px";
      }

      getImmediateSiblings(item);
    }

    function releaseGridItem(event) {
      if (!item) {
        return;
      }
      const snapAnimation = animateSnap(item, 0, -itemLocalPosY, 150);
      snapAnimation.onfinish = () => {
        item.style.top = null;
        item.style.zIndex = null;
        item.classList.remove("moving");
        item = null;
        itemAbove = null;
        itemAboveY = null;
        itemBelow = null;
        itemBelowY = null;
        gridContainerTop = null;
        pointerOffset = null;
        initialItemPosY = null;
        itemContainerPosY = null;
        itemLocalPosY = null;
        switchOffset = 0;
        animating = false;
      };
    }

    function getImmediateSiblings(currentItem) {
      itemAbove = currentItem.previousElementSibling;
      itemBelow = currentItem.nextElementSibling;
      if (itemAbove) {
        itemAboveY = itemAbove.getBoundingClientRect().top - gridContainerTop;
      }
      if (itemBelow) {
        itemBelowY = itemBelow.getBoundingClientRect().top - gridContainerTop;
      }
    }

    function animateSnap(thisItem, startPosition, endPosition, durationMS) {
      const snap = [
        { transform: `translate(0px, ${startPosition}px)` },
        { transform: `translate(0px, ${endPosition}px)` },
      ];
      const snapTiming = {
        duration: durationMS,
      };

      return thisItem.animate(snap, snapTiming);
    }
  }
}
