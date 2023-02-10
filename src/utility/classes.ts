import type { Expand } from './merge';
import type { Point, ValidObjects } from './types';

class Circle {
  objType: ValidObjects = 'Circle';
  id: string;
  x!: number;
  y!: number;
  radius!: number;
  text? = '';
  caption? = '';
  borderColor? = 'var(--circle-border)';
  fillColor? = 'var(--circle-fill)';
  textColor? = 'var(--circle-text)';
  captionColor? = 'var(--circle-caption)';

  constructor(vars: Omit<Partial<Circle>, 'id'> & { id: string | number; x: number; y: number; radius: number }) {
    this.objType = 'Circle' as ValidObjects;

    const { id, objType: _, ...rest } = vars;
    if (typeof id === 'number') {
      this.id = `${this.objType}${id}`;
    } else {
      this.id = id;
    }
    Object.assign(this, rest);
  }
}

class Rectangle {
  objType: ValidObjects = 'Rectangle';
  id: string;
  x!: number;
  y!: number;
  width!: number;
  height!: number;
  borderRadius? = '0';
  text? = '';
  caption? = '';
  borderColor? = 'var(--rectangle-border)';
  fillColor? = 'var(--rectangle-fill)';
  textColor? = 'var(--rectangle-text)';
  captionColor? = 'var(--rectangle-caption)';

  constructor(
    vars: Omit<Partial<Rectangle>, 'id'> & {
      id: string | number;
      x: number;
      y: number;
      width: number;
      height: number;
    },
  ) {
    this.objType = 'Rectangle' as ValidObjects;

    const { id, objType: _, ...rest } = vars;
    if (typeof id === 'number') {
      this.id = `${this.objType}${id}`;
    } else {
      this.id = id;
    }
    Object.assign(this, rest);
  }
}

class Edge {
  objType: ValidObjects = 'Edge';
  id: string;
  a?: Point;
  b?: Point;
  forward? = true;
  backward? = false;
  color? = 'var(--edge-color)';

  constructor(vars: Omit<Partial<Edge>, 'id'> & { id: string | number; a: Point; b: Point }) {
    this.objType = 'Edge' as ValidObjects;

    const { id, objType: _, ...rest } = vars;
    if (typeof id === 'number') {
      this.id = `${this.objType}${id}`;
    } else {
      this.id = id;
    }
    Object.assign(this, rest);
  }
}

export { Circle, Rectangle, Edge };
