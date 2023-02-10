export const useMouseScrollable = () => {
  let ele: HTMLElement | null = null;
  let pos = { left: 0, top: 0, x: 0, y: 0 };

  function captureClick(e: MouseEvent) {
    e.preventDefault();
    ele!.setAttribute('click-intercept', 'false');
    document.removeEventListener('click', captureClick, true);
  }

  const mouseMoveHandler = function (e: MouseEvent) {
    // How far the mouse has been moved
    const dx = e.clientX - pos.x;
    const dy = e.clientY - pos.y;

    // Scroll the element
    ele!.scrollTop = pos.top - dy;
    ele!.scrollLeft = pos.left - dx;

    if (ele!.getAttribute('click-intercept') !== 'true') {
      ele!.setAttribute('click-intercept', 'true');
      document.addEventListener('click', captureClick, true);
    }
  };

  const mouseUpHandler = (_: MouseEvent) => {
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);

    ele!.style.removeProperty('cursor');
    ele!.style.removeProperty('user-select');

    //pos = { left: 0, top: 0, x: 0, y: 0 };
  };

  const mouseDownHandler = (e: MouseEvent) => {
    ele = e.currentTarget! as HTMLElement;
    ele.style.cursor = 'grabbing';
    ele.style.userSelect = 'none';

    pos = {
      // The current scroll
      left: ele.scrollLeft,
      top: ele.scrollTop,
      // Get the current mouse position
      x: e.clientX,
      y: e.clientY,
    };

    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  };

  return { mouseDownHandler };
};
