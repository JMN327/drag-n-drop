# Drag Drop Grid List

Adds drag and drop functionality to a single column CSS Grid Layout or Flex-box single column directional layout.

To use:

- add the files DragDropList.css and DragDropList.js to the project root
- use the following in you index.js to import the javascript and call it:

import { DragDropList } from "./DragDropList.js";

DragDropList();

- in your html add class 'grid-container' to the element containing the list to be drag/dropped
- add the class 'grid-item' to the children of the 'grid-container' element
