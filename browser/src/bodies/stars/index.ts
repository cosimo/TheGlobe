import {UpdatableMesh} from "../../interfaces/UpdatableMesh";
import * as THREE from "three";
import starsMaterial from "./materials/stars";

export class Stars implements UpdatableMesh {
  #geometry: THREE.BufferGeometry;
  #mesh: THREE.Mesh;

  constructor() {
    this.#geometry = new THREE.SphereGeometry(100, 32, 32);
    this.#mesh = new THREE.Mesh(this.#geometry, starsMaterial);
  }

  getMesh() {
    return this.#mesh;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  update(): void {}
}
