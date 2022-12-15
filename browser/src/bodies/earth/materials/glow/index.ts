import * as THREE from "three";
import glowVertexShader from "./shaders/vertex.glsl";
import glowFragmentShader from "./shaders/fragment.glsl";

export default new THREE.ShaderMaterial({
  vertexShader: glowVertexShader,
  fragmentShader: glowFragmentShader,
  blending: THREE.AdditiveBlending,
  side: THREE.BackSide,
  transparent: true,
  depthWrite: false,
})
