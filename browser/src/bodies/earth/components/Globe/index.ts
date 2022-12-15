import {UpdatableMesh} from "../../../../interfaces/UpdatableMesh";
import * as THREE from "three";

import {gui, showDebug} from "../../../../debug";
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import globeVertexShader from "./shaders/vertex.glsl";
import globeFragmentShader from "./shaders/fragment.glsl";

const earthTexture = new THREE.TextureLoader().load('textures/earthmap10k.jpg');
const earthBumpMapTexture = new THREE.TextureLoader().load('textures/earthbump4k.jpg');
const earthSpecularHighlightMap = new THREE.TextureLoader().load('textures/earthspec4k.jpg');
const earthLightMap = new THREE.TextureLoader().load('textures/earthAtNight.jpg');
const earthLightMapBW = new THREE.TextureLoader().load('textures/earthMapBW.png');

const lightMaps = {
  color: earthLightMap,
  blackWhite: earthLightMapBW,
}

const settings = {
  visible: true,
  geometry: {
    radius: 1,
    widthSegments: 32,
    heightSegments: 32
  },
  material: {
    bumpScale: 0.005,
    specular: new THREE.Color('#111111').getHex(),
    wireframe: false,
    lightMapIntensity: 1.2,
    lightMap: 'color',
  }
}


export class Globe implements UpdatableMesh {
  #geometry: THREE.SphereGeometry;
  #material: CustomShaderMaterial<typeof THREE.MeshPhongMaterial>;
  #mesh: THREE.Mesh;

  constructor(earthRadius: number) {
    settings.geometry.radius = earthRadius;

    this.#geometry = new THREE.SphereGeometry(
      settings.geometry.radius,
      settings.geometry.widthSegments,
      settings.geometry.heightSegments
    );

    this.#material = new CustomShaderMaterial({
      baseMaterial: THREE.MeshPhongMaterial,
      map: earthTexture,
      bumpMap: earthBumpMapTexture,
      bumpScale: settings.material.bumpScale,
      specularMap: earthSpecularHighlightMap,
      specular: settings.material.specular,
      wireframe: settings.material.wireframe,
      vertexShader: globeVertexShader,
      fragmentShader: globeFragmentShader,
      lightMap: lightMaps.color,
      lightMapIntensity: settings.material.lightMapIntensity,
      patchMap: {
        csm_LightMapLight: {
          '#include <lights_fragment_maps>' : `
            vec4 lightMapTexel = texture2D( lightMap, vUv );
            float darkDirection = 1.0 - dotDirection;
            vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity * darkDirection;
        
            irradiance += lightMapIrradiance;
          `
        }
      }
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

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  update(): void {}

  initDebug() {
    const debugGlobeFolder = gui.addFolder('Globe');
    debugGlobeFolder
      .add(settings, 'visible')
      .onChange((value: boolean) => this.#mesh.visible = value)

    debugGlobeFolder.close();

    this.initGeometryDebug(debugGlobeFolder);
    this.initMaterialDebug(debugGlobeFolder);
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
      .addColor(settings.material, 'specular')
      .onChange((value: string) => (this.#material as unknown as THREE.MeshPhongMaterial).specular = new THREE.Color(value))

    materialFolder
      .add(settings.material, 'bumpScale')
      .min(0)
      .max(0.01)
      .step(0.001)
      .onChange((value: number) => (this.#material as unknown as THREE.MeshPhongMaterial).bumpScale = value )

    materialFolder
      .add(settings.material, 'lightMap')
      .options(['color', 'blackWhite'])
      .onChange((value: keyof typeof lightMaps) => (this.#material as unknown as THREE.MeshPhongMaterial).lightMap = lightMaps[value])

    materialFolder
      .add(settings.material, 'lightMapIntensity')
      .min(0)
      .max(3)
      .step(0.1)
      .onChange((value: number) => (this.#material as unknown as THREE.MeshPhongMaterial).lightMapIntensity = value )

    materialFolder
      .add(settings.material, 'wireframe')
      .onChange((value: boolean) => (this.#material as unknown as THREE.MeshPhongMaterial).wireframe = value )
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
