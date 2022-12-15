import {UpdatableMesh} from "../../interfaces/UpdatableMesh";
import * as THREE from "three";

import {gui, showDebug} from "../../debug";

const moonTexture = new THREE.TextureLoader().load("textures/lroc_color_poles_1k.jpg");

const settings = {
  visible: true,
  geometry: {
    radius: 0.2727,
    widthSegments: 32,
    heightSegments: 32,
    rotation: 0.0,
  },
  material: {
    bumpScale: 0.005,
    specular: new THREE.Color('#050505').getHex(),
    wireframe: false,
  }
}


export class Moon implements UpdatableMesh {
  #geometry: THREE.SphereGeometry;
  #material: THREE.MeshPhongMaterial;
  #mesh: THREE.Mesh;

  constructor(moonRadius: number) {
    settings.geometry.radius = moonRadius;

    this.#geometry = new THREE.SphereGeometry(
      settings.geometry.radius,
      settings.geometry.widthSegments,
      settings.geometry.heightSegments
    );

    this.#material = new THREE.MeshPhongMaterial({
      map: moonTexture,
      specular: settings.material.specular,
      wireframe: settings.material.wireframe,
    });

    this.#mesh = new THREE.Mesh(this.#geometry, this.#material);
    this.#mesh.rotation.set(0.0, settings.geometry.rotation, 0.0);
    this.#mesh.visible = settings.visible;
    this.#mesh.castShadow = true;
    this.#mesh.receiveShadow = true;

    if (showDebug) {
      this.initDebug();
    }
  }

  getMesh(): THREE.Object3D {
    return this.#mesh;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  update(): void {}

  initDebug() {
    const debugMoonFolder = gui.addFolder('Moon');
    debugMoonFolder
      .add(settings, 'visible')
      .onChange((value: boolean) => this.#mesh.visible = value)

    debugMoonFolder.close();

    this.initGeometryDebug(debugMoonFolder);
    this.initMaterialDebug(debugMoonFolder);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initGeometryDebug(parentFolder: any) {
    const geometryFolder = parentFolder.addFolder('geometry');

    geometryFolder
      .add(settings.geometry, 'radius')
      .min(0)
      .max(2)
      .step( 0.01 )
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

    geometryFolder
      .add(settings.geometry, 'rotation')
      .min(0)
      .max(6.28)
      .step(0.01)
      .onChange(() => {
        this.updateRotation()
      });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initMaterialDebug(parentFolder: any) {
    const materialFolder = parentFolder.addFolder('material');

    materialFolder
      .addColor(settings.material, 'specular')
      .onChange((value: string) => this.#material.specular = new THREE.Color(value))

    materialFolder
      .add(settings.material, 'wireframe')
      .onChange((value: boolean) => this.#material.wireframe = value )
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

  updateRotation() {
    this.#mesh.rotation.set(0.0, settings.geometry.rotation, 0.0);
  }
}
