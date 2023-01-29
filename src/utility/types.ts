type ValidObjects = 'Circle' | 'Rectangle' | 'Edge';

type Point = {
  objType: Omit<ValidObjects, 'Edge'>;
  x: number;
  y: number;
  radius?: number;
  width?: number;
  height?: number;
  caption?: string;
};

type Step = { id: string; type: 'add | update | delete'; origValues: [] };

type ScreenInfo = {
  width: number;
  height: number;
  rem: number;
};

export type { ValidObjects, Point, ScreenInfo };
