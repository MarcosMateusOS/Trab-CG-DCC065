import * as THREE from "three";
import { OrbitControls } from "../build/jsm/controls/OrbitControls.js";
import GUI from "../libs/util/dat.gui.module.js";
import cameraInit from "./camera.js";
import planoInit from "./plano.js";
import addPlatform from "./platform.js";
import {
  checkPlatformCollision,
  checkBordersCollision,
  checkBrickCollision,
} from "./collisions.js";

import KeyboardState from "../libs/util/KeyboardState.js";
import {
  initRenderer,
  initCamera,
  initDefaultBasicLight,
  SecondaryBox,
  onWindowResize,
  lightFollowingCamera,
} from "../libs/util/util.js";

import { buildWordPlans, buildWorldWalls } from "./src/buildWorld.js";
import { buildBricks } from "./src/bricks.js";

var count = { score: 0 };

let scene, renderer, camera, light, orbit;
scene = new THREE.Scene();
scene.background = new THREE.Color("black"); //0xf0f0f0);
renderer = initRenderer();

let height = window.innerHeight;
let width = window.innerWidth;
let aspect = width / height;
let position = new THREE.Vector3(0, 0, 90);
camera = cameraInit(height, width, position);

const { primary, second } = buildWordPlans(scene, width, height);

//Criação plano primário
var primaryPlanGeometry = new THREE.PlaneGeometry(tamanho/2,tamanho);
let primaryPlanMaterial = new THREE.MeshBasicMaterial({ color: 0x00afaf });
let primaryPlan = new THREE.Mesh(primaryPlanGeometry,primaryPlanMaterial);
// primaryPlan.layers.set(0);
scene.add(primaryPlan);
//fim criação plano primário

let secundaryPlanGeometry = second.secundaryPlanGeometry;
let secundaryPlan = second.secundaryPlan;

//Criação de paredes
const { walls, geometry } = buildWorldWalls(scene, height);

let wallTopBottomGeometry = geometry.topBottom;
let wallLeftRigthGeometry = geometry.leftRigth;

let wallTop = walls.wallTop;
let wallBottom = walls.wallBottom;
//Cria as paredes na esquerda e direita
let wallRigth = walls.wallRigth;
let wallLeft = walls.wallLeft;

// Criação rebatedor
let platformWidth = 0.15 * primaryPlanGeometry.parameters.width;
let platformHeight = 0.025 * primaryPlanGeometry.parameters.height;
var platformGeometry = new THREE.PlaneGeometry(platformWidth, platformHeight);
let platformMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
let platform = new THREE.Mesh(platformGeometry, platformMaterial);
let yOffset = height * -0.4;
platform.position.set(0, yOffset, 0.0);

scene.add(platform);
//fim criação rebatedor

// criação bola
let initialBallRadius = 0.01 * primaryPlanGeometry.parameters.width;
const ball = new THREE.Mesh(
  new THREE.SphereGeometry(initialBallRadius),
  new THREE.MeshBasicMaterial({ color: 0xff0000 })
);
let initialBallPosition = 0.1 * primaryPlan.geometry.parameters.height;
let initialBallPosition = 0.4 * height;
ball.position.set(0, initialBallPosition, 0);

let initialBallVelocity = 0.005 * height;
const ballVelocity = new THREE.Vector3(0, -initialBallVelocity, 0);
scene.add(ball);
//fim criação bola

//updateDimensions();
let bricks;
function buildBricksPlan() {
  bricks = buildBricks();

  bricks.forEach((brick) => {
    scene.add(brick);
  });
}

function removeBricks() {
  console.log("removeBricks");
  bricks.forEach((brick) => {
    const object = scene.getObjectByProperty("uuid", brick.uuid); // getting object by property uuid and x is uuid of an object that we want to delete and clicked on before
    object.geometry.dispose();
    object.material.dispose();
    console.log(object);
    scene.remove(object); // disposing and deleting mesh from scene
  });
}

buildBricksPlan();

// animação bola
function animate() {
  if (isPaused) return;

  ball.position.x += ballVelocity.x;
  ball.position.y += ballVelocity.y;

  checkPlatformCollision(platform, ball, ballVelocity);
  checkBordersCollision(wallLeft,wallRigth,wallBottom,wallTop,ball, ballVelocity);
  bricks.forEach((brick) => checkBrickCollision(brick,ball,ballVelocity, count));

  console.log("score: ", count.score)

  if(count.score === 15) {count.score = 0; resetGame()};
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
      } else if (point.x < leftLimit) {
        // Ajustado aqui
        // Coloca o retângulo no limite à esquerda
        platform.position.x = leftLimit; // Ajustado aqui
      } else if (point.x > rightLimit) {
        // Ajustado aqui
        // Coloca o retângulo no limite à direita
        platform.position.x = rightLimit; // Ajustado aqui
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
  camera.left = width / -2;
  camera.right = width / 2;
  camera.top = height / 2;
  camera.bottom = height / -2;
  camera.updateProjectionMatrix();
  //fim atualizar câmera

  // Atualizar plano secundário
  secundaryPlanGeometry.dispose();
  secundaryPlanGeometry = new THREE.PlaneGeometry(width, height);
  secundaryPlan.geometry = secundaryPlanGeometry;
  //fim atualizar plano secundário

  // Atualizar plano primário
  let oldWidth = primaryPlanGeometry.parameters.width;
  let oldHeight = primaryPlanGeometry.parameters.height;

  primaryPlanGeometry.dispose();
  primaryPlanGeometry = new THREE.PlaneGeometry(height / 2, height);

  let newWidth = primaryPlanGeometry.parameters.width;
  let newHeight = primaryPlanGeometry.parameters.height;

  primaryPlan.geometry = primaryPlanGeometry;
  //fim atualizar plano primário

  // Atualizar plataforma
  platformWidth = primaryPlanGeometry.parameters.width * 0.225;
  platformHeight = primaryPlanGeometry.parameters.height * 0.025;
  platform.geometry.dispose();
  platformGeometry = new THREE.PlaneGeometry(platformWidth, platformHeight);
  platform.geometry = platformGeometry;
  yOffset = height * -0.4;
  platform.position.set(0, yOffset, 0.0);
  //fim atualizar plataforma

  // Atualizar barras
  wallTop.geometry.dispose();
  wallBottom.geometry.dispose();
  wallTopBottomGeometry = new THREE.BoxGeometry(
    primaryPlanGeometry.parameters.width,
    0.05 * height,
    0
  );
  wallTop.geometry = wallTopBottomGeometry;
  wallBottom.geometry = wallTopBottomGeometry;
  wallTop.position.y = height / 2;
  wallBottom.position.y = -height / 2;

  wallLeft.geometry.dispose();
  wallRigth.geometry.dispose();
  wallLeftRigthGeometry = new THREE.BoxGeometry(0.025 * height, height, 0);
  wallLeft.geometry = wallLeftRigthGeometry;
  wallRigth.geometry = wallLeftRigthGeometry;
  wallLeft.position.x = -height / 4;
  wallRigth.position.x = height / 4;
  //fim atualizar barras

  // Atualizar bolinha
  let newBallRadius = 0.03 * primaryPlanGeometry.parameters.width;
  ball.geometry.dispose();
  let ballGeometry = new THREE.SphereGeometry(newBallRadius);
  ball.geometry = ballGeometry;
  let newBallVelocity = 0.005 * height;
  ballVelocity.normalize();
  ballVelocity.multiplyScalar(newBallVelocity);
  let proporcaoheight = newWidth / oldWidth;
  let proporcaowidth = newHeight / oldHeight;
  ball.position.x *= proporcaowidth;
  ball.position.y *= proporcaoheight;

  scene.add(ball);
  //fim atualizar bolinha

  // Atualizar tijolos

  //fim atualizar tijolos

  // Atualizar renderer
  renderer.setSize(width, height);
}

updateDimensions();

let isPaused = false;

function pause() {
  isPaused = true;
}

function resume() {
  isPaused = false;
  animate();
}

function resetGame() {
  platform.position.set(0, yOffset, 0.0);
  ballVelocity.copy(new THREE.Vector3(0, initialBallVelocity, 0));
  ball.position.set(0, initialBallPosition, 0);
  removeBricks();
  bricks = [];
  buildBricksPlan();
}

var keyboard = new KeyboardState();

function keyboardUpdate() {
  keyboard.update();

  if (keyboard.down("R")) resetGame();
  if (keyboard.down("space")) pause();
  if (keyboard.down("enter")) resume();
}

//updateDimensions();


render();
function render() {
  keyboardUpdate();
  animate();
  requestAnimationFrame(render);
  renderer.render(scene, camera); // Render scene
}
