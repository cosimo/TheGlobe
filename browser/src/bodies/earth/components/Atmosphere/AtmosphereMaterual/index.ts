import * as THREE from "three";
import atmosphereVertexShader from "./shaders/vertex.glsl";
import atmosphereFragmentShader from "./shaders/fragment.glsl";

export default new THREE.ShaderMaterial({
  uniforms: {
    u_intensity_base: {
      value: 1.05
    },
    u_intensity_power: {
      value: 1.7
    },
    u_base_color: {
      value: [0.3, 0.6, 1]
    },
  },
  vertexShader: atmosphereVertexShader,
  fragmentShader: atmosphereFragmentShader,
  blending: THREE.AdditiveBlending,
  side: THREE.FrontSide,
  transparent: true,
  depthWrite: false,
  wireframe: false,
})
