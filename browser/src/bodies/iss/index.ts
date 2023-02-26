import {UpdatableMesh} from "../../interfaces/UpdatableMesh";
import * as THREE from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import {getCurrentIssStateVector} from "../../ephemeris";
import {gui, showDebug} from "../../debug";
import { rotateJ2000Coords } from "../../astrodynamics";


const settings = {
  visible: true,
  geometry: {
    // NASA's ISS model is 1 unit =~ 1 meter. This is the real scale,
    // and it's still visible. Quite impressive.
    scale: 0.0001567889621,
  },
  rotation: {
    x: -0.28,
    y: 1.85,
    z: 0.22,

    // For still mysterious reasons, an initial sync rotation is needed
    group_x: 0,
    group_y: 0.8,
    group_z: 0,
  },
};

// https://solarsystem.nasa.gov/resources/2378/international-space-station-3d-model/
const gltfLoader = new GLTFLoader();


export class Iss implements UpdatableMesh {
  #mesh: THREE.Mesh | THREE.Object3D;
  #group: THREE.Group;

  constructor(scene: THREE.Scene) {
    const url = 'models/ISS_stationary.glb';
    const self = this;
    this.#group = new THREE.Group();

    gltfLoader.load(url, (gltf) => {

      const modelScene = gltf.scene;

      // https://stackoverflow.com/questions/75255282/create-a-mesh-from-gltflaoder-load-in-thre-js
      self.#mesh = modelScene.children[0];
      self.#group.add(this.#mesh);

      scene.add(self.#group);

      if (showDebug) {
        this.initDebug();
      }

      this.updateGeometry();
    });
  }

  getMesh(): THREE.Mesh | THREE.Object3D {
    return this.#mesh;
  }
  
  getGroup(): THREE.Group {
    return this.#group;
  }

  initDebug() {
    const debugIssFolder = gui.addFolder('ISS');

    debugIssFolder
      .add(settings, 'visible')
      .onChange((value: boolean) => this.#mesh.visible = value)

    debugIssFolder.close();

    this.initGeometryDebug(debugIssFolder);
    this.initRotationDebug(debugIssFolder);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initGeometryDebug(parentFolder: any) {
    const geometryFolder = parentFolder.addFolder('geometry');

    geometryFolder
      .add(settings.geometry, 'scale')
      .min(0)
      .max(0.01)
      .step(0.00001)
      .onChange(() => {
        this.updateGeometry()
      });
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initRotationDebug(parentFolder: any) {
    const rotationFolder = parentFolder.addFolder('rotation');

    rotationFolder 
      .add(settings.rotation, 'x')
      .min(-6.28)
      .max(6.28)
      .step(0.01)
      .onChange(() => {
        this.updateGeometry()
      });

    rotationFolder 
      .add(settings.rotation, 'y')
      .min(-6.28)
      .max(6.28)
      .step(0.01)
      .onChange(() => {
        this.updateGeometry()
      });

    rotationFolder 
      .add(settings.rotation, 'z')
      .min(-6.28)
      .max(6.28)
      .step(0.01)
      .onChange(() => {
        this.updateGeometry()
      });

    rotationFolder 
      .add(settings.rotation, 'group_x')
      .min(-6.28)
      .max(6.28)
      .step(0.01)
      .onChange(() => {
        this.updateGeometry()
      });

    rotationFolder 
      .add(settings.rotation, 'group_y')
      .min(-6.28)
      .max(6.28)
      .step(0.01)
      .onChange(() => {
        this.updateGeometry()
      });

    rotationFolder 
      .add(settings.rotation, 'group_z')
      .min(-6.28)
      .max(6.28)
      .step(0.01)
      .onChange(() => {
        this.updateGeometry()
      });
  }

  updateGeometry() {
    if (!this.#mesh) {
      return;
    }

    this.#mesh.scale.set(settings.geometry.scale, settings.geometry.scale, settings.geometry.scale);

    const stateVector = getCurrentIssStateVector(undefined);
    if (!stateVector) {
      return;
    }

    // Rotate our state vector coordinates but keep the state vector itself
    // in the J2000 frame of reference, or we'd get our velocity updates wrong
    const rotatedCoords = rotateJ2000Coords(stateVector.position.x, stateVector.position.y, stateVector.position.z);

    this.#mesh.position.x = rotatedCoords.x;
    this.#mesh.position.y = rotatedCoords.y;
    this.#mesh.position.z = rotatedCoords.z;

    this.#mesh.rotation.x = settings.rotation.x;
    this.#mesh.rotation.y = settings.rotation.y;
    this.#mesh.rotation.z = settings.rotation.z;

    this.#group.rotation.x = settings.rotation.group_x;
    this.#group.rotation.y = settings.rotation.group_y;
    this.#group.rotation.z = settings.rotation.group_z;

    this.#mesh.visible = settings.visible;
  }

  update(dt: number) {
    const stateVector = getCurrentIssStateVector(undefined);
    if (!stateVector) {
      return;
    }

    stateVector.position.x += stateVector.velocity.x * dt;
    stateVector.position.y += stateVector.velocity.y * dt;
    stateVector.position.z += stateVector.velocity.z * dt;

    this.updateGeometry();
  }

}
