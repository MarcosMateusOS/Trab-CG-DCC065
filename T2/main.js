import * as THREE from "three";
import { TextGeometry } from "../build/jsm/geometries/TextGeometry.js";
import { FontLoader } from "../build/jsm/loaders/FontLoader.js";
import { OrbitControls } from "../build/jsm/controls/OrbitControls.js";
import GUI from "../libs/util/dat.gui.module.js";
import cameraInit from "./src/camera.js";

import addPlatform from "./src/platform.js";
import {
  checkPlatformCollision,
  checkBordersCollision,
  checkBrickCollision,
  checkPowerUpCollsion,
  checkPowerUpIsInDestination,
} from "./src/collisions.js";

import KeyboardState from "../libs/util/KeyboardState.js";
import { initRenderer } from "../libs/util/util.js";

import { buildWordPlans, buildWorldWalls } from "./src/buildWorld.js";
import { buildBricks } from "./src/bricks.js";
import {
  Material,
  PCFShadowMap,
  SphereGeometry,
  TextureLoader,
  Vector3,
} from "../build/three.module.js";

var count = { score: 0 };
var currentLevel = 1;

let scene, renderer, camera;
scene = new THREE.Scene();
scene.background = new THREE.Color("black"); //0xf0f0f0);
renderer = initRenderer();

let distanciaPlanoPrimarioZ = 10;

let height = window.innerHeight;
let width = window.innerWidth;
let aspect = width / height;
console.log(
  "aspecto" +
    aspect +
    "width:" +
    width +
    "height:" +
    height +
    "e:" +
    height / aspect
);
let position = new THREE.Vector3(5, 5, height / 2);
camera = cameraInit(height, width, position);

const { primary, second } = buildWordPlans(scene, width, height);

//Criação plano primário
var primaryPlanGeometry = new THREE.BoxGeometry(height / 2, height, 5);
let primaryPlanMaterial = new THREE.MeshLambertMaterial({ color: "#24188c" });
let primaryPlan = new THREE.Mesh(primaryPlanGeometry, primaryPlanMaterial);
// primaryPlan.layers.set(0);
scene.add(primaryPlan);
//fim criação plano primário

let secundaryPlanGeometry = second.secundaryPlanGeometry;
let secundaryPlan = second.secundaryPlan;

//Criação de paredes
const { walls, geometry } = buildWorldWalls(
  scene,
  height,
  distanciaPlanoPrimarioZ
);

let wallTopBottomGeometry = geometry.topBottom;
let wallLeftRigthGeometry = geometry.leftRigth;

let wallTop = walls.wallTop;
scene.add(wallTop);
let wallBottom = walls.wallBottom;
scene.add(wallBottom);
//Cria as paredes na esquerda e direita
let wallRigth = walls.wallRigth;
let wallLeft = walls.wallLeft;

// Criação rebatedor
let platformWidth = 0.15 * primaryPlanGeometry.parameters.width;
let platformHeight = 0.025 * primaryPlanGeometry.parameters.height;
var platformGeometry = new THREE.PlaneGeometry(platformWidth, platformHeight);
let platformMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
let platform = new THREE.Mesh(platformGeometry, platformMaterial);
platform.castShadow = true;
let yOffset = height * -0.4;
platform.position.set(0, yOffset, distanciaPlanoPrimarioZ);

scene.add(platform);
//fim criação rebatedor

// criação bola

let newBallRadius = 0.02 * primaryPlanGeometry.parameters.width;
console.log(newBallRadius);
const ball = new THREE.Mesh(
  new THREE.SphereGeometry(newBallRadius),
  new THREE.MeshPhongMaterial({ color: 0xff0000 })
);
// let initialBallPosition = -0.3 * primaryPlan.geometry.parameters.height;
// let ballOffset = - yOffset - platform.geometry.parameters.height;
// ball.position.set(0, -ballOffset, 30);
scene.add(ball);
let ballOffset = -yOffset - platform.geometry.parameters.height;
ball.position.set(0, -ballOffset, distanciaPlanoPrimarioZ);
let start = false;

let initialBallVelocity = 0.0035 * height;
const ballVelocity = new THREE.Vector3(0, -initialBallVelocity, 0);
let newBallVelocity = 0.003 * height;
ballVelocity.normalize();
ballVelocity.multiplyScalar(newBallVelocity);
//fim criação bola

//updateDimensions();
let bricks;
function buildBricksPlan() {
  bricks = buildBricks(primaryPlan, currentLevel);

  bricks.forEach((brick) => {
    scene.add(brick);
    let edges = new THREE.EdgesGeometry(brick.geometry);
    let line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: "black" })
    );
    brick.add(line);
  });
}

function removeBricks() {
  bricks.forEach((brick) => {
    const object = scene.getObjectByProperty("uuid", brick.uuid); // getting object by property uuid and x is uuid of an object that we want to delete and clicked on before
    object.geometry.dispose();
    object.material.dispose();
    console.log(object);
    scene.remove(object); // disposing and deleting mesh from scene
  });
}

buildBricksPlan();

let ballEnergyMesh;

const font = await new FontLoader().loadAsync("./utils/font/gamefont.json");

let textVelocity = `Speed: ${newBallVelocity.toFixed(2)}`;
const textVelocityGeometry = new TextGeometry(textVelocity, {
  font: font,
  size: 15,
  height: 1,
});
const textVelocityMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });
const textVelocityMesh = new THREE.Mesh(
  textVelocityGeometry,
  textVelocityMaterial
);
textVelocityMesh.position.set(75, yOffset + 720, 30);
textVelocityMesh.name = "textVelocity";
scene.add(textVelocityMesh);

let textScore = `Score: ${count.score}`;
const textScoreGeometry = new TextGeometry(textScore, {
  font: font,
  size: 15,
  height: 1,
});
const textScoreMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });
const textScoreMesh = new THREE.Mesh(textScoreGeometry, textScoreMaterial);
textScoreMesh.position.set(wallLeft.position.x + 35, yOffset + 720, 30);
textScoreMesh.name = "textScore";
scene.add(textScoreMesh);

function updateInfos() {
  textVelocity = `Speed: ${newBallVelocity.toFixed(2)}`;
  const textoMesh = scene.getObjectByName("textVelocity");
  textoMesh.geometry.dispose();
  textoMesh.geometry = new TextGeometry(textVelocity, {
    font: font,
    size: 15,
    height: 1,
  });

  textScore = `Score: ${count.score}`;
  const textoScoreMesh = scene.getObjectByName("textScore");
  textoScoreMesh.geometry.dispose();
  textoScoreMesh.geometry = new TextGeometry(textScore, {
    font: font,
    size: 15,
    height: 1,
  });
}

const textureLoader = new TextureLoader();
const texture = await textureLoader.loadAsync("./utils/energy.jpg");

const lerpConfig = {
  destination: new THREE.Vector3(
    wallBottom.position.x,
    wallBottom.position.y,
    distanciaPlanoPrimarioZ
  ),
  alpha: 0.03,
  angle: 0.0,
  move: false,
};

let size = 0.025 * primaryPlan.geometry.parameters.height;
let heightPowerUp = size * 0.5;
const geometryPowerUp = new THREE.BoxGeometry(1, 1, heightPowerUp * 1);
const materialPowerUp = new THREE.MeshLambertMaterial({ map: texture });
const powerUp = new THREE.Mesh(geometryPowerUp, materialPowerUp);

powerUp.position.set(0, yOffset + 400, distanciaPlanoPrimarioZ);
powerUp.scale.set(size, size * 0.5, 1);
powerUp.castShadow = true;
powerUp.visible = false;
scene.add(powerUp);

function removePowerUp() {
  const object = scene.getObjectByProperty("uuid", powerUp.uuid); // getting object by property uuid and x is uuid of an object that we want to delete and clicked on before

  scene.remove(object);
}

let countPowerUp = 0;
function showPowerUp() {
  powerUp.visible = true;
  lerpConfig.move = true;
  powerUp.position.lerp(lerpConfig.destination, lerpConfig.alpha);
}

function putPowerUp() {
  powerUp.visible = false;
  powerUp.position.set(
    wallBottom.position.x,
    wallBottom.position.y,
    distanciaPlanoPrimarioZ
  );
  lerpConfig.move = false;

  duplicateBall();
}

function resetPowerUp() {
  powerUp.visible = false;
  powerUp.position.set(
    wallBottom.position.x,
    wallBottom.position.y,
    distanciaPlanoPrimarioZ
  );
  lerpConfig.move = false;
}

let clonedBall;
let clonedBallVelocity;
function duplicateBall() {
  clonedBall = new THREE.Mesh(
    new THREE.SphereGeometry(newBallRadius),
    new THREE.MeshPhongMaterial({ color: 0x808080 })
  );
  clonedBall.castShadow = true;
  scene.add(clonedBall);

  clonedBallVelocity = new THREE.Vector3();
  clonedBallVelocity.copy(ballVelocity);
  clonedBallVelocity.normalize();
  clonedBallVelocity.multiplyScalar(newBallVelocity);

  clonedBall.position.z = distanciaPlanoPrimarioZ;
  clonedBall.position.x += clonedBallVelocity.x;
  clonedBall.position.y += clonedBallVelocity.y;
}

function removeClonedBall() {
  if (clonedBall) {
    const object = scene.getObjectByProperty("uuid", clonedBall.uuid); // getting object by property uuid and x is uuid of an object that we want to delete and clicked on before

    scene.remove(object);
  }
}
// animação bola
let checkTime = 0;
function animate() {
  if (isPaused) return;
  updateInfos();
  if (start) {
    countPowerUp = count.score;
    checkTime += 1 / 60;

    if (checkTime <= 15) {
      newBallVelocity = initialBallVelocity;
      newBallVelocity = newBallVelocity + (checkTime / 15) * newBallVelocity;
      console.log("new ball velocity", newBallVelocity);
      ballVelocity.normalize();
      ballVelocity.multiplyScalar(newBallVelocity);
    }

    if (clonedBall) {
      checkPlatformCollision(platform, clonedBall, clonedBallVelocity);

      clonedBall.position.x += clonedBallVelocity.x;
      clonedBall.position.y += clonedBallVelocity.y;

      const isLose = checkBordersCollision(
        wallLeft,
        wallRigth,
        wallBottom,
        wallTop,
        clonedBall,
        clonedBallVelocity
      );

      if (isLose) {
        removeClonedBall();
      }
    }

    ball.position.x += ballVelocity.x;
    ball.position.y += ballVelocity.y;

    checkPlatformCollision(platform, ball, ballVelocity);

    const isLose = checkBordersCollision(
      wallLeft,
      wallRigth,
      wallBottom,
      wallTop,
      ball,
      ballVelocity
    );

    if (isLose) {
      currentLevel = 1;
      resetGame();
    }
    bricks.forEach((brick) => {
      checkBrickCollision(brick, ball, ballVelocity, count);
      if (clonedBall) {
        checkBrickCollision(brick, clonedBall, clonedBallVelocity, count);
      }
    });

    if (count.score % 10 == 0 && count.score != 0) {
      showPowerUp();
    }

    if (checkPowerUpCollsion(platform, powerUp) && !clonedBall) {
      putPowerUp();
    }

    if (lerpConfig.move && checkPowerUpIsInDestination(wallBottom, powerUp)) {
      resetPowerUp();
    }

    // if (count.score === 15) {
    //   count.score = 0;
    //   pause();
    // }
  }
}
//fim animação  bola

// Criação Raycaster
let raycaster = new THREE.Raycaster();

window.addEventListener("mousemove", onMouseMove, false);
function onMouseMove(event) {
  if (!isPaused) {
    let mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    let intersects = raycaster.intersectObjects([primaryPlan, secundaryPlan]);

    if (intersects.length > 0) {
      let point = intersects[0].point; // Pick the point where intersects occurrs

      // Calcula os limites do planoPrimario
      let borderLeftSize = wallLeft.geometry.parameters.width;
      let borderRightSize = wallRigth.geometry.parameters.width;

      let leftLimit =
        wallLeft.position.x + platformWidth / 2 + borderLeftSize / 2; // Ajustado aqui
      let rightLimit =
        wallRigth.position.x - platformWidth / 2 - borderRightSize / 2; // Ajustado aqui

      // Verifica se a posição x da interseção está dentro dos limites
      if (
        point.x >= leftLimit && // Ajustado aqui
        point.x <= rightLimit // Ajustado aqui
      ) {
        // Move o retângulo para a posição x da interseção
        platform.position.x = point.x;

        if (!start) {
          ball.position.x = point.x;
        }
      } else if (point.x < leftLimit) {
        // Ajustado aqui
        // Coloca o retângulo no limite à esquerda
        platform.position.x = leftLimit; // Ajustado aqui
        if (!start) {
          ball.position.x = leftLimit;
        }
      } else if (point.x > rightLimit) {
        // Ajustado aqui
        // Coloca o retângulo no limite à direita
        platform.position.x = rightLimit; // Ajustado aqui
        if (!start) {
          ball.position.x = rightLimit; // Ajustado aqui
        }
      }
    }
  }
}

//fim criação Raycaster

window.addEventListener(
  "resize",
  function () {
    updateDimensions();
  },
  false
);

function updateDimensions() {
  // Atualizar height e proporção da janela
  width = window.innerWidth;
  height = window.innerHeight;
  aspect = width / height;
  //fim atualizar height e proporção

  // Atualizar câmera
  // camera.left = width / -2;
  // camera.right = width / 2;
  camera.aspect = aspect;
  // camera.bottom = height / -2;
  // camera.position.set(0,0,height/2)
  camera.updateProjectionMatrix();
  //fim atualizar câmera

  // Atualizar plano secundário
  // secundaryPlanGeometry.dispose();
  // secundaryPlanGeometry = new THREE.PlaneGeometry(width, height);
  // secundaryPlan.geometry = secundaryPlanGeometry;
  //fim atualizar plano secundário

  // Atualizar plano primário
  // let oldWidth = primaryPlanGeometry.parameters.width;
  // let oldHeight = primaryPlanGeometry.parameters.height;

  // primaryPlanGeometry.dispose();
  // primaryPlanGeometry = new THREE.PlaneGeometry(height / 2, height);

  // let newWidth = primaryPlanGeometry.parameters.width;
  // let newHeight = primaryPlanGeometry.parameters.height;

  // primaryPlan.geometry = primaryPlanGeometry;
  // //fim atualizar plano primário

  // // Atualizar plataforma
  // platformWidth = primaryPlanGeometry.parameters.width * 0.225;
  // platformHeight = primaryPlanGeometry.parameters.height * 0.025;
  // platform.geometry.dispose();
  // platformGeometry = new THREE.PlaneGeometry(platformWidth, platformHeight);
  // platform.geometry = platformGeometry;
  // yOffset = height * -0.4;
  // platform.position.set(0, yOffset, 30);
  //fim atualizar plataforma

  // Atualizar barras
  // wallTop.geometry.dispose();
  // wallBottom.geometry.dispose();
  // wallTopBottomGeometry = new THREE.BoxGeometry(
  //   primaryPlanGeometry.parameters.width,
  //   0.05 * height,
  //   0
  // );
  // wallTop.geometry = wallTopBottomGeometry;
  // wallBottom.geometry = wallTopBottomGeometry;
  // wallTop.position.y = height / 2;
  // wallBottom.position.y = -height / 2;
  // wallTop.position.z = 30;
  // wallBottom.position.z = 30;

  // wallLeft.geometry.dispose();
  // wallRigth.geometry.dispose();
  // wallLeftRigthGeometry = new THREE.BoxGeometry(0.025 * height, height, 0);
  // wallLeft.geometry = wallLeftRigthGeometry;
  // wallRigth.geometry = wallLeftRigthGeometry;
  // wallLeft.position.x = -height / 4;
  // wallLeft.position.z = 30;
  // wallRigth.position.x = height / 4;
  // wallRigth.position.z = 30;
  //fim atualizar barras

  // // Atualizar bolinha
  // let proporcaoheight = newWidth / oldWidth;
  // let proporcaowidth = newHeight / oldHeight;
  // ball.position.x *= proporcaowidth;
  // ball.position.y *= proporcaoheight;
  // ball.position.z = 30;

  // scene.add(ball);
  // resize nos tijolos
  // if (bricks) {
  //   let planeWidth = primaryPlanGeometry.parameters.width;
  //   let planeHeight = primaryPlanGeometry.parameters.height;
  //   let newSize = 0.15 * planeWidth;
  //   let newStartPositionX = -planeWidth / 2 + 0.11 * planeWidth;
  //   let newStartPositionY = planeHeight / 2 + -0.05 * planeHeight;
  //   let newSpacing = 0.3 * newSize;

  //   bricks.forEach((brick, index) => {
  //     if (brick.position.z === 0) {
  //       // Atualizar tamanho
  //       brick.scale.set(newSize, 0.5 * newSize, 1);

  //       // Atualizar posição
  //       let rowIndex = Math.floor(index / 5); // Supondo que cada linha tenha 5 tijolos
  //       let colIndex = index % 5;
  //       brick.position.x = newStartPositionX + colIndex * (newSize + newSpacing);
  //       brick.position.y = newStartPositionY + rowIndex * -(0.5 * (newSize + newSpacing));
  //     }
  //   });
  // }

  //fim resize tijolos

  renderer.setSize(width, height);
}

updateDimensions();

let isPaused = false;
let isResume = true;

function pause() {
  isPaused = true;
  isResume = console.log(isPaused);
}

function resume() {
  isPaused = false;
  console.log(isPaused);
  animate();
}

function resetGame() {
  start = false;
  count.score = 0;
  platform.position.set(0, yOffset, distanciaPlanoPrimarioZ);
  ballVelocity.copy(new THREE.Vector3(0, initialBallVelocity, 0));
  ball.position.set(
    0,
    yOffset + platform.geometry.parameters.height,
    distanciaPlanoPrimarioZ
  );
  removeBricks();
  removeClonedBall();
  bricks = [];
  buildBricksPlan();
  if (isPaused) {
    resume();
  }
}

var keyboard = new KeyboardState();
let isFullScreen = false;
function fullScreen() {
  let element = document.documentElement;
  if (!isFullScreen) {
    element.requestFullscreen();
    isFullScreen = true;
  } else {
    document.exitFullscreen();
    isFullScreen = false;
  }
}

function keyboardUpdate() {
  keyboard.update();

  if (keyboard.down("R")) {
    currentLevel = 1;
    resetGame();
  }

  if (keyboard.down("G")) {
    currentLevel = 2;
    resetGame();
  }

  if (keyboard.down("space")) {
    if (!isPaused) {
      pause();
    } else {
      resume();
    }
  }

  if (keyboard.down("enter")) fullScreen();
  // if (keyboard.down("Q")) start = true;
  // if (keyboard.down("enter")) resume();
}

let initialTime;
document.addEventListener("click", function () {
  start = true;
  initialTime = Date.now() / 1000;
});

//updateDimensions();

// Adicionando luz
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
let lightColor = "rgb(255,255,255)";
let dirLight = new THREE.DirectionalLight(lightColor);
var lightPos = new THREE.Vector3(100, 200, 210);
setDirectionalLighting(lightPos);
renderer.shadowMap.radius = 0;
renderer.shadowIntensity = 0;
scene.add(new THREE.AmbientLight(0xffffff, 0.7));

primaryPlan.receiveShadow = true;

ball.castShadow = true;

platform.castShadow = true;

function setDirectionalLighting(position) {
  dirLight.position.copy(position);

  // Shadow settings
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.near = 10;
  dirLight.shadow.camera.far = 1000;
  dirLight.shadow.camera.left = -window.innerHeight / 2;
  dirLight.shadow.camera.right = window.innerHeight / 2;
  dirLight.shadow.camera.top = window.innerHeight;
  dirLight.shadow.camera.bottom = -window.innerHeight;
  dirLight.name = "Direction Light";
  dirLight.shadow.radius = 3;
  scene.add(dirLight);
}

console.log(window.innerHeight);
console.log(window.innerWidth);
// let objColor = "rgb(255,20,20)"; // Define the color of the object
// let objShininess = 200;          // Define the shininess of the object

// let geometryT = new SphereGeometry(50);
// let material = new THREE.MeshPhongMaterial({color: objColor, shininess: objShininess});

// let t = new THREE.Mesh(geometryT,material);
// t.castShadow = true;
// t.position.set(30,0,40);

// scene.add(t);
// primaryPlan.rotation.y = -0.1;

render();
function render() {
  keyboardUpdate();
  animate();
  requestAnimationFrame(render);
  renderer.render(scene, camera); // Render scene
}
