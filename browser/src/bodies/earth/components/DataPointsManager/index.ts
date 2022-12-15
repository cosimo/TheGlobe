import {UpdatableMesh} from "../../../../interfaces/UpdatableMesh";
import * as THREE from 'three';

import {InstancedBeams} from "../InstancedBeams";
import {InstancedRings} from "../InstancedRings";

type X = number;
type Y = number;
type Z = number;
type Scale = number;
export type Data = [X, Y, Z, Scale];

export class DataPointsManager implements UpdatableMesh {
  #group: THREE.Group;

  #instancedBeams: InstancedBeams | undefined;
  #instancedRings: InstancedRings | undefined;

  #oldInstancedBeams: InstancedBeams | undefined;
  #oldInstancedRings: InstancedRings | undefined;

  constructor() {
    this.#group = new THREE.Group();
  }

  addDataPointList(data: Data[]) {
    this.#instancedBeams = new InstancedBeams(data);
    this.#group.add(this.#instancedBeams.getMesh());

    this.#instancedRings = new InstancedRings(data);
    this.#group.add(this.#instancedRings.getMesh());
  }

  replaceDataPointList(data: Data[]) {
    this.clearDataPointList();
    this.addDataPointList(data);
  }

  clearDataPointList() {
    const animationTimeInMs = 2000;

    this.#oldInstancedBeams = this.#instancedBeams;
    this.#instancedBeams = undefined;
    this.#oldInstancedBeams?.setFadeOutAnimation();

    setTimeout(() => {
      if(this.#oldInstancedBeams) {
        this.#group.remove(this.#oldInstancedBeams.getMesh());
        this.#oldInstancedBeams.dispose();
        this.#oldInstancedBeams = undefined;
      }
    }, animationTimeInMs);


    this.#oldInstancedRings = this.#instancedRings;
    this.#instancedRings = undefined;
    this.#oldInstancedRings?.setFadeOutAnimation();

    setTimeout(() => {
      if(this.#oldInstancedRings) {
        this.#group.remove(this.#oldInstancedRings.getMesh());
        this.#oldInstancedRings.dispose();
        this.#oldInstancedRings = undefined;
      }
    }, InstancedRings.animationTimeInMs);
  }

  getMesh() {
    return this.#group;
  }

  update(dt: number) {
    this.#instancedBeams?.update(dt);
    this.#instancedRings?.update(dt);
  }
}
