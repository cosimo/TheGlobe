import * as THREE from "three";

const starTexture = new THREE.TextureLoader().load('/textures/milkyway4k.png');

export default new THREE.MeshBasicMaterial({
  map: starTexture,
  side: THREE.BackSide
});
