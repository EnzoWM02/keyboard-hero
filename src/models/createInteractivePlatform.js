import * as THREE from "three";

export default function createInteractivePlatform(position, platformTexture) {

  const platformGeometry = new THREE.BoxGeometry(0.8, 0.05, 0.8);
  const platformMaterial = new THREE.MeshStandardMaterial();

  platformMaterial.normalMap = platformTexture;

  const platform = new THREE.Mesh(platformGeometry, platformMaterial);

  platform.rotation.x = 0.4;
  platform.position.set(...position);

  return {
    mesh: platform,
    material: platformMaterial,
  };
}
