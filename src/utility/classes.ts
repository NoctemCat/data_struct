import type { Point, ValidObjects } from './types';

type CircleVars = {
  objType: ValidObjects;
  x: number;
  y: number;
  radius: number;
  text?: string;
  caption?: string;
  borderColor?: string;
  fillColor?: string;
  textColor?: string;
  captionColor?: string;
};

let circleMaxId = 0;
class Circle {
  objType: ValidObjects = 'Circle';
  id: string;
  x: number;
  y: number;
  radius: number;
  text: string = '';
  caption: string = '';
  borderColor = 'var(--circle-border)';
  fillColor = 'var(--circle-fill)';
  textColor = 'var(--circle-text-border)';
  captionColor = 'var(--circle-caption-border)';

  constructor(vars: CircleVars) {
    this.id = `${this.objType}${circleMaxId++}`;
    this.x = vars.x;
    this.y = vars.y;
    this.radius = vars.radius;

    this.text = vars.text ?? this.text;
    this.caption = vars.caption ?? this.caption;
    this.borderColor = vars.borderColor ?? this.borderColor;
    this.fillColor = vars.fillColor ?? this.fillColor;
    this.textColor = vars.textColor ?? this.textColor;
    this.captionColor = vars.captionColor ?? this.captionColor;
  }
}

type RectangleVars = {
  objType: ValidObjects;
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius?: string;
  text?: string;
  caption?: string;
  borderColor?: string;
  fillColor?: string;
  textColor?: string;
  captionColor?: string;
};

let rectMaxId = 0;
class Rectangle {
  objType: ValidObjects = 'Rectangle';
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius = '0';
  text: string = '';
  caption: string = '';
  borderColor = 'var(--rectangle-border)';
  fillColor = 'var(--rectangle-fill)';
  textColor = 'var(--rectangle-text-border)';
  captionColor = 'var(--rectangle-caption-border)';

  constructor(vars: RectangleVars) {
    this.id = `${this.objType}${rectMaxId++}`;
    this.x = vars.x;
    this.y = vars.y;
    this.width = vars.width;
    this.height = vars.height;

    this.borderRadius = vars.borderRadius ?? this.borderRadius;
    this.text = vars.text ?? this.text;
    this.caption = vars.caption ?? this.caption;
    this.borderColor = vars.borderColor ?? this.borderColor;
    this.fillColor = vars.fillColor ?? this.fillColor;
    this.textColor = vars.textColor ?? this.textColor;
    this.captionColor = vars.captionColor ?? this.captionColor;
  }
}

type EdgeVars = {
  objType: ValidObjects;
  a: Point;
  b: Point;
  forward?: boolean;
  backward?: boolean;
  color?: string;
};

let edgeMaxId = 0;
class Edge {
  objType: ValidObjects = 'Edge';
  id: string;
  a: Point;
  b: Point;
  forward = true;
  backward = false;
  color = 'var(--edge-color)';

  constructor(vars: EdgeVars) {
    this.id = `${this.objType}${edgeMaxId++}`;
    this.a = vars.a;
    this.b = vars.b;

    this.forward = vars.forward ?? this.forward;
    this.backward = vars.backward ?? this.backward;
    this.color = vars.color ?? this.color;
  }
}

export { Circle, Rectangle, Edge };
export type { CircleVars, RectangleVars, EdgeVars };
