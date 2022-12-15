import {UpdatableMesh} from "../../interfaces/UpdatableMesh";
import * as THREE from "three";
import {Globe} from "./components/Globe";
import {Moon} from "../moon";
import {Clouds} from "./components/Clouds";
import {Atmosphere} from "./components/Atmosphere";
import {Data, DataPointsManager} from "./components/DataPointsManager";
import {getSunMoonPositions, getUTCDatetime} from "../../astrodynamics";

export class Earth implements UpdatableMesh {
  public static radius = 1;

  #earthGroup: THREE.Group;

  #globe: Globe;
  #clouds: Clouds;
  #moon: Moon;
  #atmosphere: Atmosphere;
  #dataPointsManager: DataPointsManager;

  #rotation: number;

  constructor() {
    this.#earthGroup = new THREE.Group();

    this.#dataPointsManager = new DataPointsManager();
    this.#earthGroup.add(this.#dataPointsManager.getMesh());

    this.#globe = new Globe(Earth.radius);
    this.#globe.getMesh().receiveShadow = true;
    this.#globe.getMesh().castShadow = true;

    this.#earthGroup.add(this.#globe.getMesh());

    this.#clouds = new Clouds();
    this.#earthGroup.add(this.#clouds.getMesh());

    this.#atmosphere = new Atmosphere();
    this.#earthGroup.add(this.#atmosphere.getMesh());

    const pos = getSunMoonPositions();

    this.#moon = new Moon(0.2727);
    this.#moon.getMesh().position.set(pos.moon.x, pos.moon.y, pos.moon.z);
    this.#earthGroup.add(this.#moon.getMesh());
    this.#earthGroup.castShadow = true;
    this.#earthGroup.receiveShadow = true;

    this.#rotation = 0.0;
    this.#earthGroup.rotation.set(0, this.#rotation, 0);
  }

  rotateForTime(datetime?: number) {
    // Initial fixed rotation is necessary to place the Earth's texture correctly
    // with regards to where the Sun is going to illuminate it
    const initialEarthRotation = Math.PI;
    const timeEarthRotation = this.getYRotationForTime(datetime);
    this.#globe.getMesh().rotation.set(0, initialEarthRotation + timeEarthRotation, 0);
    this.#dataPointsManager.getMesh().rotation.set(0, initialEarthRotation + timeEarthRotation, 0);
  }

  getYRotationForTime(datetime?: number): number {
    const referenceDatetime = datetime == undefined ? getUTCDatetime() : datetime;
    const hoursMinutes = (referenceDatetime % 1) * 10000;
    const minutes = Math.trunc(hoursMinutes % 100);
    const hours = Math.trunc(hoursMinutes / 100);
    const rotation = 15.0/360.0 * (hours + (minutes / 60.0)) * (2 * Math.PI);
    //console.log("Earth rotation for date:" + referenceDatetime + " h:" + hours + " m:" + minutes + " = " + rotation);
    return rotation;
  }

  replaceDataPointList(data: Data[]) {
    this.#dataPointsManager.replaceDataPointList(data);
  }

  getMesh(): THREE.Object3D {
    return this.#earthGroup;
  }

  getMoonMesh(): THREE.Object3D {
    return this.#moon.getMesh();
  }

  update(dt: number): void {
    this.#dataPointsManager.update(dt);
    this.#clouds.update(dt);
  }
}
