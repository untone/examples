export const getSelectionRange = () => {
  const selection = window.getSelection();
  if (selection.rangeCount === 0) return null;
  return selection.getRangeAt(0);
};

export const getSelectedBlockElement = () => {
  let result = null;
  // Finds the block parent of the current selection
  // https://github.com/facebook/draft-js/issues/45
  const selection = window.getSelection();
  if (selection.rangeCount === 0) {
    result = null;
  }
  let node = selection.getRangeAt(0).startContainer;

  do {
    if (node.getAttribute && node.getAttribute('data-block') === 'true') {
      result = node;
    }
    node = node.parentNode;
  } while (node !== null);
  return result;
};

export const getSelectionCoords = (selectionRange) => {
  const editorBounds = document.querySelector('#editor').getBoundingClientRect();
  const rangeBounds = selectionRange && selectionRange.getBoundingClientRect();
  const rangeWidth = rangeBounds && (rangeBounds.right - rangeBounds.left);
  const offsetLeft = rangeBounds && (rangeBounds.left - editorBounds.left) + (rangeWidth / 2);
  const offsetTop = rangeBounds && (rangeBounds.top - editorBounds.top);
  return { offsetLeft, offsetTop };
};


