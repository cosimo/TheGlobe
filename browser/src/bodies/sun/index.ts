import {UpdatableMesh} from "../../interfaces/UpdatableMesh";
import * as THREE from "three";

import {gui, showDebug} from "../../debug";

const settings = {
  visible: true,
  geometry: {
    // Given the Sun distance is 1000x *less* than real, a realistic radius of
    // the Sun should be 0.1092 as the Sun is 109.2x the radius of the Earth.
    // That wouldn't be as nice to look at though.
    radius: 0.5,
    widthSegments: 32,
    heightSegments: 32
  },
  material: {
    color: new THREE.Color('#ffeecc'),
    wireframe: false,
    transparent: true,
  }
};


export class Sun implements UpdatableMesh {
  #geometry: THREE.SphereGeometry;
  #material: THREE.MeshBasicMaterial;
  #mesh: THREE.Mesh;

  constructor(sunRadius?: number) {
    settings.geometry.radius = sunRadius || settings.geometry.radius;

    this.#geometry = new THREE.SphereGeometry(
      settings.geometry.radius,
      settings.geometry.widthSegments,
      settings.geometry.heightSegments
    );

    this.#material = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#ffeecc'),
      alphaTest: 0,
      fog: false,
      wireframe: settings.material.wireframe,
      //transparent: settings.material.transparent
    });

    this.#mesh = new THREE.Mesh(this.#geometry, this.#material);
    this.#mesh.visible = settings.visible;

    if (showDebug) {
      this.initDebug();
    }
  }

  getMesh(): THREE.Mesh {
    return this.#mesh;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  update(): void {}

  initDebug() {
    const debugSunFolder = gui.addFolder('Sun');
    debugSunFolder
      .add(settings, 'visible')
      .onChange((value: boolean) => this.#mesh.visible = value)

    debugSunFolder.close();

    this.initGeometryDebug(debugSunFolder);
    this.initMaterialDebug(debugSunFolder);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initGeometryDebug(parentFolder: any) {
    const geometryFolder = parentFolder.addFolder('geometry');

    geometryFolder
      .add(settings.geometry, 'radius')
      .min(0)
      .max(10)
      .step(0.1)
      .onChange(() => {
        this.updateGeometry()
      });
    
    geometryFolder
      .add(settings.geometry, 'widthSegments')
      .min(1)
      .max(64)
      .step(1)
      .onChange(() => {
        this.updateGeometry()
      });

    geometryFolder
      .add(settings.geometry, 'heightSegments')
      .min(1)
      .max(64)
      .step(1)
      .onChange(() => {
        this.updateGeometry()
      });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initMaterialDebug(parentFolder: any) {
    const materialFolder = parentFolder.addFolder('material');

    materialFolder
      .add(settings.material, 'wireframe')
      .onChange((value: boolean) => this.#material.wireframe = value );

    materialFolder
      .add(settings.material, 'transparent')
      .onChange((value: boolean) => this.#material.transparent = value );
  }

  updateGeometry() {
    this.#geometry = this.#geometry = new THREE.SphereGeometry(
      settings.geometry.radius,
      settings.geometry.widthSegments,
      settings.geometry.heightSegments
    );

    this.#mesh.geometry.dispose()
    this.#mesh.geometry = this.#geometry;
  }

}
