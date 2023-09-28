import * as THREE from "three";

const mainCamera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

mainCamera.position.z = 5;

export default mainCamera;