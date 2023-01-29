import type { Point, ValidObjects } from './types';

class Circle {
  objType: ValidObjects = 'Circle';
  id: string;
  x: number;
  y: number;
  radius: number;
  text? = '';
  caption? = '';
  borderColor? = 'var(--circle-border)';
  fillColor? = 'var(--circle-fill)';
  textColor? = 'var(--circle-text-border)';
  captionColor? = 'var(--circle-caption-border)';

  constructor(vars: Circle) {
    this.id = vars.id;
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

class Rectangle {
  objType: ValidObjects = 'Rectangle';
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius? = '0';
  text? = '';
  caption? = '';
  borderColor? = 'var(--rectangle-border)';
  fillColor? = 'var(--rectangle-fill)';
  textColor? = 'var(--rectangle-text-border)';
  captionColor? = 'var(--rectangle-caption-border)';

  constructor(vars: Rectangle) {
    this.id = vars.id;
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

class Edge {
  objType: ValidObjects = 'Edge';
  id: string;
  a?: Point;
  b?: Point;
  forward? = true;
  backward? = false;
  color? = 'var(--edge-color)';

  constructor(vars: Edge) {
    this.id = vars.id;
    this.a = vars.a;
    this.b = vars.b;

    this.forward = vars.forward ?? this.forward;
    this.backward = vars.backward ?? this.backward;
    this.color = vars.color ?? this.color;
  }
}

export { Circle, Rectangle, Edge };
