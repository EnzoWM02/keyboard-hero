import * as THREE from "three";

const textureLoader = new THREE.TextureLoader();

const platformGeometry = new THREE.BoxGeometry(4, 0.1, 20);
const platformMaterial = new THREE.MeshStandardMaterial();
const platformTexture = textureLoader.load("/brickNormalMap.jpeg");
platformMaterial.normalMap = platformTexture;
platformTexture.wrapS = THREE.RepeatWrapping;
platformTexture.wrapT = THREE.RepeatWrapping;
platformTexture.repeat.set(4, 20); // Adjust the repeat values as needed

const platform = new THREE.Mesh(platformGeometry, platformMaterial);

platform.rotation.x = 0.4;

export default platform;
