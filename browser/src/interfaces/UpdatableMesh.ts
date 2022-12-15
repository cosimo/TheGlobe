import {Object3D} from "three/src/core/Object3D";

export interface UpdatableMesh {
  update: (dt: number) => void;
  getMesh: () => Object3D
}
