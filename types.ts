export enum AppMode {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE'
}

export interface ParticleData {
  scatterPos: [number, number, number];
  treePos: [number, number, number];
  color: string;
  scale: number;
  rotationSpeed: number;
}