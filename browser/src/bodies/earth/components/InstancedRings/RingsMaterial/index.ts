import * as THREE from "three";
import ringsVertexShader from "./shaders/vertex.glsl";
import ringsFragmentShader from "./shaders/fragment.glsl";

export default new THREE.ShaderMaterial( {
  uniforms: {
    u_time: { value: 0 },
    u_opacity: { value: 0 },
    u_global_opacity: { value: 0.1 },
    u_frequency: { value: 3 },
    u_stripe_scale: { value: 20 },
    u_high_color: { value: [1, 0.3411, 0.3411] },
    u_low_color: { value: [1, 0.8196, 0.3843] },
    u_scale_factor: { value: 1 },
  },
  vertexShader: ringsVertexShader,
  fragmentShader: ringsFragmentShader,
  blending: THREE.AdditiveBlending,
  side: THREE.DoubleSide,
  transparent: true,
  depthWrite: false,
});
