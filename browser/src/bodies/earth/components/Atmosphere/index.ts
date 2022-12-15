import {UpdatableMesh} from "../../../../interfaces/UpdatableMesh";
import * as THREE from "three";

import atmosphereMaterial from "./AtmosphereMaterual";

import {gui, showDebug} from "../../../../debug";

const settings = {
  visible: true,
  geometry: {
    radius: 1.015,
    widthSegments: 32,
    heightSegments: 32,
  },

  material: {
    transparent: atmosphereMaterial.transparent,
    depthWrite: atmosphereMaterial.depthWrite,
    wireframe: atmosphereMaterial.wireframe,

    uniforms: {
      intensityBase: atmosphereMaterial.uniforms.u_intensity_base.value,
      intensityPower: atmosphereMaterial.uniforms.u_intensity_power.value,
      baseColor: atmosphereMaterial.uniforms.u_base_color.value,
    }
  },
}

export class Atmosphere implements UpdatableMesh {
  #geometry: THREE.BufferGeometry;
  #material: THREE.ShaderMaterial;
  #mesh: THREE.Mesh;

  constructor() {
    this.#geometry = new THREE.SphereGeometry(
      settings.geometry.radius,
      settings.geometry.widthSegments,
      settings.geometry.heightSegments
    );

    this.#material = atmosphereMaterial.clone();

    this.#mesh = new THREE.Mesh(this.#geometry, this.#material);
    this.#mesh.visible = settings.visible;

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
    const debugFolder = gui.addFolder('Atmosphere');
    debugFolder
      .add(settings, 'visible')
      .onChange((value: boolean) => this.#mesh.visible = value)
    debugFolder.close();

    this.initGeometryDebug(debugFolder);
    this.initMaterialDebug(debugFolder);
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
    const uniformsFolder = materialFolder.addFolder('uniforms');

    materialFolder
      .add(settings.material, 'transparent')
      .onChange((value: boolean) => this.#material.transparent = value )

    materialFolder
      .add(settings.material, 'depthWrite')
      .onChange((value: boolean) => this.#material.depthWrite = value )

    materialFolder
      .add(settings.material, 'wireframe')
      .onChange((value: boolean) => this.#material.wireframe = value )

    uniformsFolder
      .add(settings.material.uniforms, 'intensityBase')
      .min(0)
      .max(2)
      .step( 0.01 )
      .onChange((value: boolean) => this.#material.uniforms.u_intensity_base.value = value )

    uniformsFolder
      .add(settings.material.uniforms, 'intensityPower')
      .min(0)
      .max(3)
      .step( 0.01 )
      .onChange((value: boolean) => this.#material.uniforms.u_intensity_power.value = value )

    uniformsFolder
      .addColor(settings.material.uniforms, 'baseColor')
      .onChange((value: boolean) =>
        this.#material.uniforms.u_base_color.value = value
      )
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
