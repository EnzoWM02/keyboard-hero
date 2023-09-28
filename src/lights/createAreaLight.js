import * as THREE from "three";

export default function createAreaLight(position) {
  const width = 10;
  const height = 4;
  const intensity = 1;
  const rectLight = new THREE.RectAreaLight(0xffffff, intensity, width, height);
  rectLight.position.set(...position);
  rectLight.lookAt(0, 5.7, -11.8);

  return rectLight;
}
