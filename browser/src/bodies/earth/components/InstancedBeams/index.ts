import * as THREE from "three";
import beamMaterial from "./BeamMaterial";
import {UpdatableMesh} from "../../../../interfaces/UpdatableMesh";

import {Data} from "../DataPointsManager";
import {AnimationController} from "../../../../animation/AnimationController";
import {TweenModule} from "../../../../animation/TweenModule";
import {LinearUpdateModule} from "../../../../animation/LinearUpdateModule";

import {gui, showDebug} from "../../../../debug";

const beamHeight = 0.5;
const beamRadius = 0.001;
const beamGeometry = new THREE.CylinderGeometry(beamRadius, beamRadius, beamHeight, 4, 1, true);
beamGeometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, -beamHeight / 2, 0));
beamGeometry.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2));

const settings = {
  visible: true,

  material: {
    transparent: beamMaterial.transparent,
    depthWrite: beamMaterial.depthWrite,
    wireframe: beamMaterial.wireframe,

    uniforms: {
      highBottomColor: beamMaterial.uniforms.u_high_bottom_color.value,
      highTopColor: beamMaterial.uniforms.u_high_top_color.value,
      lowBottomColor: beamMaterial.uniforms.u_low_bottom_color.value,
      lowTopColor: beamMaterial.uniforms.u_low_top_color.value,
      frequency: beamMaterial.uniforms.u_frequency.value,
      scaleFactor: beamMaterial.uniforms.u_scale_factor.value,
    }
  },
}

export class InstancedBeams implements UpdatableMesh {
  static animationTimeInMs = 2000;

  #geometry: THREE.BufferGeometry;
  #material: THREE.ShaderMaterial;
  #mesh: THREE.InstancedMesh<THREE.BufferGeometry, THREE.ShaderMaterial>;
  #animationController: AnimationController;

  constructor(data: Data[]) {
    this.#geometry = beamGeometry.clone();
    this.#material = beamMaterial.clone();

    this.#mesh = new THREE.InstancedMesh(this.#geometry, this.#material, data.length);
    this.setupDataPoints(data);

    this.#animationController  = new AnimationController();
    this.initAnimationController();
    this.#animationController.start('fadeIn');

    if (showDebug) {
      this.initDebug();
    }
  }

  setupDataPoints(data: Data[]) {
    const randoms = [];
    const scales = [];
    const matrices = [];

    for (const dataPoint of data) {
      const position = new THREE.Vector3(dataPoint[0], dataPoint[1], dataPoint[2]);

      const matrix = new THREE.Matrix4();
      matrix.setPosition(position);
      matrix.lookAt(new THREE.Vector3(0, 0, 0), position, THREE.Object3D.DefaultUp.clone());
      matrices.push(matrix.toArray());

      randoms.push(Math.random() * 255);
      scales.push(dataPoint[3] * 255);
    }

    this.#mesh.instanceMatrix = new THREE.InstancedBufferAttribute( new Float32Array( matrices.flat() ), 16 );
    this.#geometry.setAttribute('random', new THREE.InstancedBufferAttribute(new Uint8Array(randoms), 1, true));
    this.#geometry.setAttribute('scale',  new THREE.InstancedBufferAttribute(new Uint8Array(scales), 1, true));
  }

  private initAnimationController() {
    const fadeInModule = new TweenModule(0, 1, InstancedBeams.animationTimeInMs);
    fadeInModule.setUpdateTarget(this.#mesh.material.uniforms.u_opacity, 'value');
    this.#animationController.addModule('fadeIn', fadeInModule)

    const fadeOutModule = new TweenModule(1, 0, InstancedBeams.animationTimeInMs);
    fadeOutModule.setUpdateTarget(this.#material.uniforms.u_opacity, 'value');
    this.#animationController.addModule('fadeOut', fadeOutModule);

    const timeUpdateModule = new LinearUpdateModule(0);
    timeUpdateModule.setUpdateTarget(this.#material.uniforms.u_time, 'value');
    this.#animationController.addModule('timeUpdate', timeUpdateModule);
  }

  getMesh(): THREE.Object3D {
    return this.#mesh;
  }

  dispose() {
    this.#mesh.geometry.dispose();
    this.#mesh.material.dispose();
    this.#mesh.dispose();
  }

  setFadeOutAnimation() {
    this.#animationController.start('fadeOut');
  }

  update(dt: number): void {
    this.#animationController.update('timeUpdate', dt);
  }

  initDebug() {
    const debugFolder = gui.addFolder('Beams');
    debugFolder
      .add(settings, 'visible')
      .onChange((value: boolean) => this.#mesh.visible = value)

    debugFolder.close();

    this.initMaterialDebug(debugFolder);
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
      .add(settings.material.uniforms, 'frequency')
      .min(0)
      .max(10)
      .step( 0.1 )
      .onChange((value: boolean) => this.#material.uniforms.u_frequency.value = value )

    uniformsFolder
      .add(settings.material.uniforms, 'scaleFactor')
      .min(0)
      .max(2)
      .step( 0.01 )
      .onChange((value: boolean) => this.#material.uniforms.u_scale_factor.value = value )

    uniformsFolder
      .addColor(settings.material.uniforms, 'highBottomColor')
      .onChange((value: number[]) => {
          this.#material.uniforms.u_high_bottom_color.value = value;
        }
      )
    uniformsFolder
      .addColor(settings.material.uniforms, 'highTopColor')
      .onChange((value: number[]) =>
        this.#material.uniforms.u_high_top_color.value = value
      )

    uniformsFolder
      .addColor(settings.material.uniforms, 'lowBottomColor')
      .onChange((value: number[]) => {
          this.#material.uniforms.u_low_bottom_color.value = value;
        }
      )
    uniformsFolder
      .addColor(settings.material.uniforms, 'lowTopColor')
      .onChange((value: number[]) =>
        this.#material.uniforms.u_low_top_color.value = value
      )
  }
}
