type ValidObjects = 'Circle' | 'Rectangle' | 'Edge';

type Point = {
  objType: Omit<ValidObjects, 'Edge'>;
  id: string;
  x: number;
  y: number;
  radius?: number;
  width?: number;
  height?: number;
  caption?: string;
};

type ScreenInfo = {
  width: number;
  height: number;
  rem: number;
};

export type { ValidObjects, Point, ScreenInfo };
