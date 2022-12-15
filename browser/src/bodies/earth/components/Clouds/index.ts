import {UpdatableMesh} from "../../../../interfaces/UpdatableMesh";
import * as THREE from "three";

import {gui, showDebug} from "../../../../debug";

const cloudsTexture = new THREE.TextureLoader().load('textures/earthCloud.png');

const settings = {
  visible: true,
  geometry: {
    radius: 1.01,
    widthSegments: 32,
    heightSegments: 32,
  },

  material: {
    transparent: true,
    depthWrite: false,
    wireframe: false,
  },

  animation: {
    rotationSpeedInSeconds: 0.006
  }
}

export class Clouds implements UpdatableMesh {
  #geometry: THREE.BufferGeometry;
  #material: THREE.MeshPhongMaterial;
  #mesh: THREE.Mesh;

  constructor() {
    this.#geometry = new THREE.SphereGeometry(
      settings.geometry.radius,
      settings.geometry.widthSegments,
      settings.geometry.heightSegments
    );

    this.#material = new THREE.MeshPhongMaterial({
      map: cloudsTexture,
      transparent: settings.material.transparent,
      depthWrite: settings.material.depthWrite,
      wireframe: settings.material.wireframe,
    });

    this.#mesh = new THREE.Mesh(this.#geometry, this.#material);
    this.#mesh.visible = settings.visible;

    if (showDebug) {
      this.initDebug();
    }
  }

  getMesh(): THREE.Object3D {
    return this.#mesh;
  }

  update(dt: number): void {
    this.#mesh.rotateY(dt * settings.animation.rotationSpeedInSeconds);
  }

  initDebug() {
    const debugFolder = gui.addFolder('Clouds');
    debugFolder
      .add(settings, 'visible')
      .onChange((value: boolean) => this.#mesh.visible = value)

    debugFolder.close();

    this.initGeometryDebug(debugFolder);
    this.initMaterialDebug(debugFolder);
    this.initAnimationDebug(debugFolder);
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
      .step( 1 )
      .onChange(() => {
        this.updateGeometry()
      });

    geometryFolder
      .add(settings.geometry, 'heightSegments')
      .min(1)
      .max(64)
      .step( 1 )
      .onChange(() => {
        this.updateGeometry()
      });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initMaterialDebug(parentFolder: any) {
    const materialFolder = parentFolder.addFolder('material');

    materialFolder
      .add(settings.material, 'transparent')
      .onChange((value: boolean) => this.#material.transparent = value )

    materialFolder
      .add(settings.material, 'depthWrite')
      .onChange((value: boolean) => this.#material.depthWrite = value )

    materialFolder
      .add(settings.material, 'wireframe')
      .onChange((value: boolean) => this.#material.wireframe = value )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initAnimationDebug(parentFolder: any) {
    const animationFolder = parentFolder.addFolder('Animation');

    animationFolder.add(settings.animation, 'rotationSpeedInSeconds')
      .min(0)
      .max(1)
      .step( 0.001 );
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
