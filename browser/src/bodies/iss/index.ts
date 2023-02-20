import {UpdatableMesh} from "../../interfaces/UpdatableMesh";
import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {SimplifyModifier} from "three/examples/jsm/modifiers/SimplifyModifier.js";
import {km} from "../../ephemeris";
import {rotateJ2000Coords} from "../../astrodynamics";
import {gui, showDebug} from "../../debug";

// From the NASA's ISS ephemeris
// 2023-02-19T20:56:00.000 3239.569828342850 4055.919681103620 -4397.260437300800 -6.65824933190568 1.63790540882254 -3.38910165692533
// TODO load this on-demand every few minutes
const issPos = rotateJ2000Coords(3239.569828342850, 4055.919681103620, -4397.260437300800);
const issVel = {x:-6.65824933190568, y:1.63790540882254, z:-3.38910165692533};

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
    group_y: -1.75,
    group_z: 0,
  },
};

const stateVector = {
  position: {
    // 417.5 km over Earth is 0.13091 3D space coordinate units
    x: km(issPos.x),
    y: km(issPos.y),
    z: km(issPos.z),
  },
  velocity: {
    x: km(issVel.x),
    y: km(issVel.z),
    z: -km(issVel.y),
  },
};

// https://solarsystem.nasa.gov/resources/2378/international-space-station-3d-model/
const gltfLoader = new GLTFLoader();


export class Iss implements UpdatableMesh {
  #mesh: THREE.Mesh;
  #group: THREE.Group;

  constructor(scene: THREE.Scene) {
    const url = '/models/ISS_stationary.glb';
    gltfLoader.load(url, (gltf) => {

      const modelScene = gltf.scene;

      // Tried to simplify the ISS model since it's huge, but no success
      // https://stackoverflow.com/questions/52087673/a-frame-three-js-simplify-modifier-on-gltfglb-models
      const simplifyModel = false;

      if (simplifyModel) {
        const simplifyModifier = new SimplifyModifier();
        modelScene.traverse(function(o) {
          if (o.isMesh) {
            var numVertices = o.geometry.attributes.position.count;
            o.geometry = simplifyModifier.modify(o.geometry, Math.floor(numVertices * settings.geometry.simplifyFactor));
          }
        });
      }

      this.#group = new THREE.Group();

      // https://stackoverflow.com/questions/75255282/create-a-mesh-from-gltflaoder-load-in-thre-js
      this.#mesh = modelScene.children[0];
      this.#group.add(this.#mesh);

      scene.add(this.#group);

      if (showDebug) {
        this.initDebug();
      }

      this.updateGeometry();
    });
  }

  getMesh(): THREE.Mesh {
    return this.#mesh;
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
    this.#mesh.position.x = stateVector.position.x;
    this.#mesh.position.y = stateVector.position.y;
    this.#mesh.position.z = stateVector.position.z;
    this.#mesh.rotation.x = settings.rotation.x;
    this.#mesh.rotation.y = settings.rotation.y;
    this.#mesh.rotation.z = settings.rotation.z;
    this.#group.rotation.x = settings.rotation.group_x;
    this.#group.rotation.y = settings.rotation.group_y;
    this.#group.rotation.z = settings.rotation.group_z;
    this.#mesh.visible = settings.visible;
  }

  update(dt) {
    // TODO: Comment out the state vector update until we got the ephemeris
    // lines search and match figured out. The ISS would be lost into space
    // otherwise :-)
    //
    //stateVector.position.x += stateVector.velocity.x * dt;
    //stateVector.position.y += stateVector.velocity.y * dt;
    //stateVector.position.z += stateVector.velocity.z * dt;
    //console.log("updated iss state vector (x="+stateVector.position.x+
    //            ", y="+stateVector.position.y+
    //            ", z="+stateVector.position.z+")");
    //this.updateGeometry();
  }

}
