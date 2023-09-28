import * as THREE from "three";

export default function createLightBulb(position, color) {
  const lightBulb = new THREE.PointLight(color, 2, 100);
  lightBulb.position.set(...position);

  return lightBulb;
}
