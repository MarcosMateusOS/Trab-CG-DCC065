import * as THREE from "three";
import { TextGeometry } from "../build/jsm/geometries/TextGeometry.js";
import { FontLoader } from "../build/jsm/loaders/FontLoader.js";
import { OrbitControls } from "../build/jsm/controls/OrbitControls.js";
import GUI from "../libs/util/dat.gui.module.js";
import cameraInit from "./src/camera.js";

import { CSG } from "../libs/other/CSGMesh.js";

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
// let platformWidth = 0.15 * primaryPlanGeometry.parameters.width;
// let platformHeight = 0.025 * primaryPlanGeometry.parameters.height;
// var platformGeometry = new THREE.PlaneGeometry(platformWidth, platformHeight);
// let platformMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
// let platform = new THREE.Mesh(platformGeometry, platformMaterial);
// platform.castShadow = true;
let yOffset = height * -0.35;
// platform.position.set(0, yOffset, distanciaPlanoPrimarioZ);

// scene.add(platform);
//fim criação rebatedor

//Criação novo rebatedor
let mesh2;
let auxMat = new THREE.Matrix4();

// Base objects
let cubeMesh = new THREE.Mesh(
  new THREE.BoxGeometry(2, 2, 2),
  new THREE.MeshPhongMaterial({ color: "red" })
); // Adicionado material para diferenciação
let cylinderMesh = new THREE.Mesh(
  new THREE.CylinderGeometry(0.85, 0.85, 2, 17),
  new THREE.MeshPhongMaterial({ color: "blue" })
); // Adicionado material para diferenciação

// Posicione e atualize os objetos originais
cubeMesh.position.set(0, 1, 0); // ou qualquer outra posição desejada
cylinderMesh.position.set(1, -0.5, 0.0); // a posição é ajustada para corresponder à operação CSG

// Atualize as matrizes dos objetos
updateObject(cubeMesh);
updateObject(cylinderMesh);

// Adicione os objetos originais à cena
//    scene.add(cubeMesh);
//    scene.add(cylinderMesh);

// CSG holders
let csgObject, cubeCSG, cylinderCSG;

// Prepare os objetos para operações CSG
cubeMesh.position.set(0, 1, 0);
cylinderMesh.position.set(1, -0.5, 0.0);

// Prepare os objetos para operações CSG
cubeCSG = CSG.fromMesh(cubeMesh);
cylinderCSG = CSG.fromMesh(cylinderMesh);

// Object 2 - Cube INTERSECT Cylinder
csgObject = cubeCSG.intersect(cylinderCSG); // Execute intersection
mesh2 = CSG.toMesh(csgObject, auxMat);
mesh2.material = new THREE.MeshLambertMaterial({ color: "green" });

// Aplique transformações ao mesh2
mesh2.position.set(3, 0, 10); // Posição inicial
mesh2.scale.set(0.5, 0.5, 0.5); // Aplicando escala
mesh2.rotation.y = THREE.MathUtils.degToRad(90); // Aplicando rotação em Y
mesh2.rotation.z = THREE.MathUtils.degToRad(270); // Aplicando rotação em Z

// Posição final desejada para o mesh2
mesh2.position.set(0, yOffset, 10);

// Ajuste a escala com base na geometria do plano primário
mesh2.scale.set(
  primaryPlanGeometry.parameters.width / 20,
  primaryPlanGeometry.parameters.width / 20,
  primaryPlanGeometry.parameters.width / 10
);

// Não é necessário chamar updateObject, pois matrixAutoUpdate é true por padrão
mesh2.geometry.computeBoundingBox();
let boundingBox = mesh2.geometry.boundingBox;
let mesh2width = boundingBox.max.x - boundingBox.min.x;
let mesh2height = boundingBox.max.y - boundingBox.min.y;
mesh2width *= mesh2.scale.x; // Ajustando a largura com base na escala do objeto
mesh2height *= mesh2.scale.y; // Ajustando a altura com base na escala do objeto

scene.add(mesh2);

function updateObject(mesh) {
  mesh.matrixAutoUpdate = false;
  mesh.updateMatrix();
}
//fim criação novo rebatedor

// criação bola
let newBallRadius = 0.02 * primaryPlanGeometry.parameters.width;
const ball = new THREE.Mesh(
  new THREE.SphereGeometry(newBallRadius),
  new THREE.MeshPhongMaterial({ color: 0xff0000 })
);
// let initialBallPosition = -0.3 * primaryPlan.geometry.parameters.height;
// let ballOffset = - yOffset - platform.geometry.parameters.height;
// ball.position.set(0, -ballOffset, 30);
scene.add(ball);
let ballOffset = -yOffset - mesh2height / 2 + 0.025 * yOffset;
ball.position.set(0, -ballOffset, distanciaPlanoPrimarioZ);
let start = false;

let initialBallVelocity = 0.0035 * height;
const ballVelocity = new THREE.Vector3(0, +initialBallVelocity, 0);
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
textVelocityMesh.position.set(
  wallRigth.position.x - 145,
  wallTop.position.y - 60,
  30
);
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
textScoreMesh.position.set(
  wallLeft.position.x + 35,
  wallTop.position.y - 60,
  30
);
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

let size = 0.025 * primaryPlan.geometry.parameters.height;
let heightPowerUp = size * 0.5;
const geometryPowerUp = new THREE.BoxGeometry(1, 1, heightPowerUp * 1);
const materialPowerUp = new THREE.MeshLambertMaterial({ map: texture });
const powerUp = new THREE.Mesh(geometryPowerUp, materialPowerUp);
const randX = Math.floor(
  Math.random() *
    (Math.floor(wallRigth.position.x) - Math.floor(wallLeft.position.x)) +
    Math.floor(wallLeft.position.x)
);

powerUp.position.set(randX, yOffset + 400, distanciaPlanoPrimarioZ);
powerUp.scale.set(size, size * 0.5, 1);
powerUp.castShadow = true;
powerUp.visible = false;
scene.add(powerUp);

const lerpConfig = {
  destination: new THREE.Vector3(
    powerUp.position.x,
    wallBottom.position.y,
    distanciaPlanoPrimarioZ
  ),
  alpha: 0.01,
  move: false,
};

function resetPowerUp() {
  powerUp.visible = false;
  const randX = Math.floor(
    Math.random() *
      (Math.floor(wallRigth.position.x) - Math.floor(wallLeft.position.x)) +
      Math.floor(wallLeft.position.x)
  );

  powerUp.position.set(randX, yOffset + 400, distanciaPlanoPrimarioZ);
  lerpConfig.move = false;
  isActivePowerUp = true;
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
  clonedBall.visible = true;

  clonedBallVelocity = new THREE.Vector3();
  clonedBallVelocity.copy(ballVelocity);
  clonedBallVelocity.normalize();
  clonedBallVelocity.multiplyScalar(newBallVelocity);

  clonedBall.position.z = distanciaPlanoPrimarioZ;
  clonedBall.position.x += clonedBallVelocity.x;
  clonedBall.position.y += clonedBallVelocity.y;
  isActivePowerUp = false;
}

function removeClonedBall() {
  if (clonedBall) {
    const object = scene.getObjectByProperty("uuid", clonedBall.uuid); // getting object by property uuid and x is uuid of an object that we want to delete and clicked on before

    if (object) {
      object.material.dispose();
      object.geometry.dispose();
      scene.remove(object);
      isActivePowerUp = true;
      clonedBall = null;
    }
  }
}

let countPowerUp = 0;
let isActivePowerUp = true;
function showPowerUp() {
  powerUp.visible = true;
  isActivePowerUp = false;
  lerpConfig.move = true;
}

function putPowerUp() {
  powerUp.visible = false;
  const randX = Math.floor(
    Math.random() *
      (Math.floor(wallRigth.position.x) - Math.floor(wallLeft.position.x)) +
      Math.floor(wallLeft.position.x)
  );

  powerUp.position.set(randX, yOffset + 400, distanciaPlanoPrimarioZ);
  lerpConfig.move = false;
  isActivePowerUp = true;

  duplicateBall();
}

let lastScore = 0;
function checkScore() {
  if (count.score < 10) {
    return false;
  }

  if (lastScore % 10 == 0 || count.score % 10 == 0) {
    return true;
  }

  return false;
}
// animação bola
let checkTime = 0;

function animate() {
  if (isPaused) return;
  updateInfos();
  if (start) {
    countPowerUp = count.score;
    lastScore = count.score - 1;
    checkTime += 1 / 60;

    if (checkTime <= 15) {
      newBallVelocity = initialBallVelocity;
      newBallVelocity = newBallVelocity + (checkTime / 15) * newBallVelocity;
      // console.log("new ball velocity", newBallVelocity);
      ballVelocity.normalize();
      ballVelocity.multiplyScalar(newBallVelocity);
    }

    if (clonedBall) {
      checkPlatformCollision(mesh2, clonedBall, clonedBallVelocity);

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
    checkPlatformCollision(mesh2, ball, ballVelocity, scene);
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

    if (checkScore() && isActivePowerUp) {
      showPowerUp();
    }

    if (checkPowerUpCollsion(mesh2, powerUp)) {
      putPowerUp();
    }

    if (checkPowerUpIsInDestination(wallBottom, powerUp)) {
      resetPowerUp();
    }

    if (count.score === 66) {
      count.score = 0;
      currentLevel = 2;
      resetGame();
    }

    if (lerpConfig.move) {
      powerUp.position.lerp(lerpConfig.destination, lerpConfig.alpha);
    }
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
        wallLeft.position.x +
        mesh2width * 2 +
        borderLeftSize / 2 +
        borderLeftSize / 5; // Ajustado aqui
      let rightLimit =
        wallRigth.position.x -
        mesh2width * 2 -
        borderRightSize / 2 -
        borderLeftSize / 5; // Ajustado aqui

      // Verifica se a posição x da interseção está dentro dos limites
      if (
        point.x >= leftLimit && // Ajustado aqui
        point.x <= rightLimit // Ajustado aqui
      ) {
        // Move o retângulo para a posição x da interseção
        mesh2.position.x = point.x;
        // updateObject(mesh2);

        if (!start) {
          ball.position.x = point.x;
        }
      } else if (point.x < leftLimit) {
        // Ajustado aqui
        // Coloca o retângulo no limite à esquerda
        mesh2.position.x = leftLimit;
        // updateObject(mesh2); // Ajustado aqui
        if (!start) {
          ball.position.x = leftLimit;
        }
      } else if (point.x > rightLimit) {
        // Ajustado aqui
        // Coloca o retângulo no limite à direita
        mesh2.position.x = rightLimit;
        // updateObject(mesh2); // Ajustado aqui
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
  checkTime = 0;
  // platform.position.set(0, yOffset, distanciaPlanoPrimarioZ);
  ballVelocity.copy(new THREE.Vector3(0, initialBallVelocity, 0));
  newBallVelocity = 0.003 * height;
  ballVelocity.normalize();
  ballVelocity.multiplyScalar(newBallVelocity);

  ball.position.set(
    0,
    yOffset + mesh2height / 2 - 0.025 * yOffset,
    distanciaPlanoPrimarioZ
  );
  removeBricks();
  removeClonedBall();
  bricks = [];
  buildBricksPlan();

  lerpConfig.move = false;
  isActivePowerUp = true;
  const randX = Math.floor(
    Math.random() *
      (Math.floor(wallRigth.position.x) - Math.floor(wallLeft.position.x)) +
      Math.floor(wallLeft.position.x)
  );
  powerUp.position.set(randX, yOffset + 400, distanciaPlanoPrimarioZ);
  powerUp.visible = false;

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
var lightPos = new THREE.Vector3(100, 270, 210);
setDirectionalLighting(lightPos);
renderer.shadowMap.radius = 0;
renderer.shadowIntensity = 0;
scene.add(new THREE.AmbientLight(0xffffff, 0.7));

primaryPlan.receiveShadow = true;

ball.castShadow = true;

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
