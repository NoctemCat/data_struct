import type { Rectangle, Circle } from './classes';
import type { Point } from './types';

const pointOnRect = (a: Rectangle, { x, y }: Point) => {
  const minX = a.x - a.width / 2;
  const maxX = a.x + a.width / 2;
  const minY = a.y - a.height / 2;
  const maxY = a.y + a.height / 2;

  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;
  // if (midX - x == 0) -> m == ±Inf -> minYx/maxYx == x (because value / ±Inf = ±0)
  const m = (midY - y) / (midX - x);

  if (x <= midX) {
    // check "left" side
    const minXy = m * (minX - x) + y;
    if (minY <= minXy && minXy <= maxY) return { x: minX, y: minXy };
  }

  if (x >= midX) {
    // check "right" side
    const maxXy = m * (maxX - x) + y;
    if (minY <= maxXy && maxXy <= maxY) return { x: maxX, y: maxXy };
  }

  if (y <= midY) {
    // check "top" side
    const minYx = (minY - y) / m + x;
    if (minX <= minYx && minYx <= maxX) return { x: minYx, y: minY };
  }

  if (y >= midY) {
    // check "bottom" side
    const maxYx = (maxY - y) / m + x;
    if (minX <= maxYx && maxYx <= maxX) return { x: maxYx, y: maxY };
  }

  // return if m = 0/0 = NaN
  return { x: x, y: y };
};

const pointOnCircle = (a: Circle, { x, y }: Point) => {
  const angle = -(Math.atan2(a.y - y, a.x - x) + Math.PI * 0.5);

  const ax = Math.round(a.radius * Math.sin(angle));
  const ay = Math.round(a.radius * Math.cos(angle));

  return { x: a.x + ax, y: a.y + ay };
};

export { pointOnRect, pointOnCircle };
