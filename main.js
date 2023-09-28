import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

import platform from "./src/models/platform";
import mainCamera from "./src/cameras/mainCamera";
import createDisk from "./src/models/createDisk";
import createLightBulb from "./src/lights/createLightBulb";
import createAreaLight from "./src/lights/createAreaLight";
import createInteractivePlatform from "./src/models/createInteractivePlatform";

//Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

//Loaders
const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
const textureLoader = new THREE.TextureLoader();
dracoLoader.setDecoderPath("/path/to/draco/decoder/");
gltfLoader.setDRACOLoader(dracoLoader);

//Promises to load textures and models
const backgroundPlatformPromise = new Promise((resolve, reject) => {
  gltfLoader.load(
    "/backgroundPlatform.gltf",
    (backgroundPlatformGltf) => {
      resolve(backgroundPlatformGltf);
    },
    undefined,
    reject
  );
});

const interactivePlatformTexturePromise = new Promise((resolve, reject) => {
  textureLoader.load(
    "/interactivePlatformMap.jpg",
    (interactivePlatformTexture) => {
      resolve(interactivePlatformTexture);
    },
    undefined,
    reject
  );
});

const duckModelPromise = new Promise((resolve, reject) => {
  gltfLoader.load(
    "./src/models/duck/duck.gltf",
    (duckGltf) => {
      resolve(duckGltf);
    },
    undefined,
    reject
  );
});

Promise.all([
  backgroundPlatformPromise,
  interactivePlatformTexturePromise,
  duckModelPromise,
])
  .then(([backgroundPlatformGltf, interactivePlatformTexture, duckGltf]) => {
    const scene = new THREE.Scene();

    //Camera
    const camera = mainCamera;
    const controls = new OrbitControls(camera, renderer.domElement);

    //Audio
    const listener = new THREE.AudioListener();
    camera.add(listener);

    const sound = new THREE.Audio(listener);

    const audioLoader = new THREE.AudioLoader();
    audioLoader.load("./music/dgforcemsc.mp3", function (buffer) {
      sound.setBuffer(buffer);
      sound.setLoop(true);
      sound.setVolume(0.5);
      sound.play();
    });

    //Objects

    const backgroundPlatform = backgroundPlatformGltf.scene;

    scene.add(backgroundPlatform);
    backgroundPlatform.scale.set(0.3, 0.3, 0.3);
    backgroundPlatform.rotation.y = 1.6;
    backgroundPlatform.rotation.z = 0.5;
    backgroundPlatform.position.set(0, 3.7, -10);

    const duck = duckGltf.scene;
    const duckAnimations = duckGltf.animations;
    scene.add(duck);
    duck.position.set(0, 5.7, -11.8);
    duck.rotation.y = 4.7;
    duck.rotation.z = -0.5;

    const duckMixer = new THREE.AnimationMixer(duck);

    duckAnimations.forEach((clip) => {
      duckMixer.clipAction(clip).play();
    });

    const interactivePlatform1 = createInteractivePlatform(
      [-1.2, -1.2, 3],
      interactivePlatformTexture
    );
    const interactivePlatform2 = createInteractivePlatform(
      [0, -1.2, 3],
      interactivePlatformTexture
    );
    const interactivePlatform3 = createInteractivePlatform(
      [1.2, -1.2, 3],
      interactivePlatformTexture
    );
    scene.add(interactivePlatform1.mesh);
    scene.add(interactivePlatform2.mesh);
    scene.add(interactivePlatform3.mesh);

    scene.add(platform);

    //Lights

    const lightBulbs = [
      createLightBulb([-3, 0, 1], 0x00ffff),
      createLightBulb([-3, 1.5, -2], 0xff00ff),
      createLightBulb([-3, 3, -4], 0xffff00),
      createLightBulb([3, 0, 1], 0x0000ff),
      createLightBulb([3, 1.5, -2], 0xff0000),
      createLightBulb([3, 3, -4], 0x00ff00),
    ];

    const colors = [0x00ffff, 0xff00ff, 0xffff00, 0x0000ff, 0xff0000, 0x00ff00];

    const platformLight = createAreaLight([0, 8.3, -11]);

    const randomifyLightBulbs = () => {
      let shuffledColorArr = colors
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);

      lightBulbs.forEach((light, index) => {
        light.color.set(shuffledColorArr[index]);
      });
    };

    /* Light Helpers::
    const sphereSize = 1;
    const pointLightHelper = new THREE.PointLightHelper(lightBulb1, sphereSize);
    const pointLightHelper2 = new THREE.PointLightHelper(
      lightBulb2,
      sphereSize
    );
    const pointLightHelper3 = new THREE.PointLightHelper(
      lightBulb3,
      sphereSize
    );
    const pointLightHelper4 = new THREE.PointLightHelper(
      lightBulb4,
      sphereSize
    );
    const pointLightHelper5 = new THREE.PointLightHelper(
      lightBulb5,
      sphereSize
    );
    const pointLightHelper6 = new THREE.PointLightHelper(
      lightBulb6,
      sphereSize
    );
    const platformLightHelper = new THREE.PointLightHelper(
      platformLight,
      sphereSize
    );
    */

    lightBulbs.forEach((lightBulb) => {
      scene.add(lightBulb);
    });

    scene.add(platformLight);
    /*
    scene.add(pointLightHelper);
    scene.add(pointLightHelper2);
    scene.add(pointLightHelper3);
    scene.add(pointLightHelper4);
    scene.add(pointLightHelper5);
    scene.add(pointLightHelper6);
    scene.add(platformLightHelper);
   */

    //Inputs
    const keys = {
      a: false,
      s: false,
      d: false,
    };

    document.addEventListener("keydown", (event) => {
      if (event.key in keys) {
        keys[event.key] = true;
      }
    });

    const clock = new THREE.Clock();
    const disks = [];
    let score = 0;
    let combo = 0;

    const comboPhrases = [
      "Perfect!",
      "You're getting good at this!",
      "Go for it!!",
      "Smooth as butter!",
    ];
    let comboPhraseInd = 1;

    const minDistanceToScore = 2.75;
    const maxDistanceToScore = 3.35;
    const interactivePlatformTactileTime = 20;

    const resetCombo = () => {
      comboPhraseInd = 1;
      missedMessage();
      combo = 0;
    };

    const missedMessage = () => {
      if (combo >= 1) {
        const comboIndicator = document.getElementById("comboIndicator");
        comboIndicator.textContent = "Missed!";
        setTimeout(() => {
          comboIndicator.textContent = "";
        }, 750);
      }
    };

    // Animations
    function animate() {
      requestAnimationFrame(animate);
      controls.update();

      duckMixer.update(0.01);

      if (keys.a) {
        interactivePlatform1.material.color.set(0x000000);
        const filteredDisks = disks.filter(
          (disk) => disk.disk.position.x === -1.2
        );
        if (
          filteredDisks.some(
            (disk) =>
              disk.distanceAlongPlatform >= minDistanceToScore &&
              disk.distanceAlongPlatform <= maxDistanceToScore
          )
        ) {
          score += 1;
          combo += 1;
          randomifyLightBulbs();
        } else {
          resetCombo();
        }
        setTimeout(() => {
          interactivePlatform1.material.color.set(0xffffff);
        }, interactivePlatformTactileTime);
        keys.a = false;
      }

      if (keys.s) {
        interactivePlatform2.material.color.set(0x000000);
        const filteredDisks = disks.filter(
          (disk) => disk.disk.position.x === 0
        );
        if (
          filteredDisks.some(
            (disk) =>
              disk.distanceAlongPlatform >= minDistanceToScore &&
              disk.distanceAlongPlatform <= maxDistanceToScore
          )
        ) {
          score += 1;
          combo += 1;
          randomifyLightBulbs();
        } else {
          resetCombo();
        }
        setTimeout(() => {
          interactivePlatform2.material.color.set(0xffffff);
        }, interactivePlatformTactileTime);
        keys.s = false;
      }

      if (keys.d) {
        interactivePlatform3.material.color.set(0x000000);
        const filteredDisks = disks.filter(
          (disk) => disk.disk.position.x === 1.2
        );
        if (
          filteredDisks.some(
            (disk) =>
              disk.distanceAlongPlatform >= minDistanceToScore &&
              disk.distanceAlongPlatform <= maxDistanceToScore
          )
        ) {
          score += 1;
          combo += 1;
          randomifyLightBulbs();
        } else {
          resetCombo();
        }
        setTimeout(() => {
          interactivePlatform3.material.color.set(0xffffff);
        }, interactivePlatformTactileTime);
        keys.d = false;
      }

      const delta = clock.getDelta();
      // Check if it's time to create a new disk
      if (Math.random() < 0.1) {
        // Generate a random x-coordinate from -1, 0, or 1
        const randomX = [-1.2, 0, 1.2][Math.floor(Math.random() * 3)];
        const diskObject = createDisk(platform, randomX, 5);
        scene.add(diskObject.disk);
        disks.push(diskObject);
      }

      // Update and check the position of each disk
      for (let i = disks.length - 1; i >= 0; i--) {
        const diskObject = disks[i];
        diskObject.moveAlongPlatform(delta, scene);

        // Check if the disk has traveled 6 units and remove it
        if (diskObject.distanceAlongPlatform >= 6) {
          scene.remove(diskObject.disk);
          disks.splice(i, 1);
        }
      }

      if (combo / comboPhraseInd === 5) {
        const comboIndicator = document.getElementById("comboIndicator");
        comboIndicator.textContent = `${comboPhrases[comboPhraseInd - 1]}`;
        comboPhraseInd += 1;
        setTimeout(() => {
          comboIndicator.textContent = "";
        }, 2000);
      }

      document.getElementById("score").textContent = `Score: ${score}`;
      document.getElementById("combo").textContent = `Combo: ${combo}`;
      renderer.render(scene, camera);
    }

    animate();
  })
  .catch((error) => {
    console.error("Error loading resources:", error);
  });

document.body.appendChild(renderer.domElement);
