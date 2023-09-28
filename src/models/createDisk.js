import * as THREE from "three";

export default function createDisk(platform, x, speed) {
  const textureLoader = new THREE.TextureLoader();

  const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
  const material = new THREE.MeshStandardMaterial();
  const diskTexture = textureLoader.load("/brickNormalMap.jpeg");
  material.normalMap = diskTexture;
  const disk = new THREE.Mesh(geometry, material);
  disk.scale.set(0.035, 0.035, 0.035);

  // Set the initial position of the disk above the platform
  disk.position.copy(platform.position.clone().add(new THREE.Vector3(0, 5, 0)));

  // Set the initial distance along the platform
  let distanceAlongPlatform = -7;

  // Function to update the disk's position along the platform
  function updatePosition() {
    // Calculate the new position based on the distance along the platform
    const newPosition = platform.localToWorld(
      new THREE.Vector3(x, 0.2, distanceAlongPlatform)
    );

    // Set the disk's position to the new position
    disk.position.copy(newPosition);
  }

  disk.rotation.x = 2;

  // Function to move the disk along the platform
  function moveAlongPlatform(delta, scene) {

    distanceAlongPlatform += speed * delta;

    if (distanceAlongPlatform >= 6) {
      scene.remove(disk);
    }

    // Update the disk's position
    updatePosition();
    this.distanceAlongPlatform = distanceAlongPlatform;
  }

  return { disk, moveAlongPlatform, distanceAlongPlatform };
}
