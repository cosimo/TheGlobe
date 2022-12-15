import * as THREE from "three";
import beamVertexShader from "./shaders/vertex.glsl";
import beamFragmentShader from "./shaders/fragment.glsl";

export default new THREE.ShaderMaterial( {
  uniforms: {
    u_time: { value: 0 },
    u_opacity: { value: 0 },
    u_high_bottom_color: { value: [1, 0.76, 0.1215] },
    u_high_top_color: { value: [0.855, 0.1215, 0.02] },
    u_low_bottom_color: { value: [1, 0.76, 0.1215] },
    u_low_top_color: { value: [0.855, 0.1215, 0.02] },
    u_frequency: { value: 5 },
    u_scale_factor: { value: 1 },
  },
  vertexShader: beamVertexShader,
  fragmentShader: beamFragmentShader,
  transparent: true,
  depthWrite: false,
});
