import * as THREE from "three";
import { OrbitControls } from "../build/jsm/controls/OrbitControls.js";
import GUI from "../libs/util/dat.gui.module.js";
import cameraInit from "./camera.js";
import planoInit from "./plano.js";
import addPlatform from "./platform.js";
import { checkPlatformCollision } from "./collisions.js";
import KeyboardState from "../libs/util/KeyboardState.js";
import {
  initRenderer,
  initCamera,
  initDefaultBasicLight,
  SecondaryBox,
  onWindowResize,
  lightFollowingCamera,
} from "../libs/util/util.js";

let scene, renderer, camera, light, orbit;
scene = new THREE.Scene();
scene.background = new THREE.Color("black"); //0xf0f0f0);
renderer = initRenderer();

let tamanho = window.innerHeight;
let largura = window.innerWidth;
let aspect = largura / tamanho;
let position = new THREE.Vector3(0, 0, 90);
let yOffset = tamanho * -0.4;
camera = cameraInit(tamanho, largura, position);
orbit = new OrbitControls(camera, renderer.domElement);

let createdPlan = planoInit(tamanho / 2, tamanho, "black");
let plan = createdPlan.plan;
let planGeo = createdPlan.planGeo;
plan.layers.set(0);
scene.add(plan);

// Crie uma barreira branca ao redor do plano
const wallMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff }); // Cor branca
const wallTopBottom = new THREE.BoxGeometry(tamanho / 2, 10, 0);

//Cria as paredes em cima e baixo
let wallTop = new THREE.Mesh(wallTopBottom, wallMaterial);
wallTop.position.y = tamanho / 2 + 0.5;
scene.add(wallTop);

let wallBottom = new THREE.Mesh(wallTopBottom, wallMaterial);
wallBottom.position.y = -tamanho / 2 + 0.5;
scene.add(wallBottom);

const wallLeftRigth = new THREE.BoxGeometry(10, tamanho, 0);

//Cria as paredes na esquerda e direita
let wallRigth = new THREE.Mesh(wallLeftRigth, wallMaterial);
wallRigth.position.x = tamanho / 4 + 0.5;
scene.add(wallRigth);

let wallLeft = new THREE.Mesh(wallLeftRigth, wallMaterial);
wallLeft.position.x = -tamanho / 4 + 0.5;
scene.add(wallLeft);

// -- Create raycaster
let raycaster = new THREE.Raycaster();

let platformWidth = 100;
let platformHeight = 10;
let platform = addPlatform(0, -200, platformWidth, platformHeight, 0x0000ff);
scene.add(platform);

const ball = new THREE.Mesh(
  new THREE.SphereGeometry(15, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0xff0000 })
);
ball.position.set(0, 100, 0);

const ballVelocity = new THREE.Vector3(0, -0.2, 0);
scene.add(ball);

function animate() {
  if (isPaused) return;

  ball.position.x += ballVelocity.x;
  ball.position.y += ballVelocity.y;

  checkPlatformCollision(platform, ball, ballVelocity);
  requestAnimationFrame(animate);
}

window.addEventListener("mousemove", onMouseMove, false);
function onMouseMove(event) {
  let pointer = new THREE.Vector2();
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;

  raycaster.setFromCamera(pointer, camera);

  let interception = raycaster.intersectObjects([plan]);

  if (interception.length > 0) {
    let point = interception[0].point; // Pick the point where interception occurrs

    // Calcula os limites do planoPrimario
    let leftLimit = wallLeft.position.x + platformWidth / 4 + 0.5;
    let rightLimit = wallRigth.position.x - platformWidth / 4 + 0.5;

    // Verifica se a posição x da interseção está dentro dos limites
    if (
      point.x >= leftLimit + platformWidth / 4 &&
      point.x <= rightLimit - platformWidth / 4
    ) {
      // Move o retângulo para a posição x da interseção
      platform.position.x = point.x;
    } else if (point.x < leftLimit + platformWidth / 4) {
      // Coloca o retângulo no limite à esquerda
      platform.position.x = leftLimit + platformWidth / 4 + 1;
    } else if (point.x > rightLimit - platformWidth / 4) {
      // Coloca o retângulo no limite à direita
      platform.position.x = rightLimit - platformWidth / 4 + 1;
    }
  }
}
window.addEventListener(
  "resize",
  function () {
    updateDimensions();
  },
  false
);

// function updateDimensions() {
//   // Atualizar tamanho e proporção da janela
//   largura = window.innerWidth;
//   tamanho = window.innerHeight;
//   aspect = largura / tamanho;

//   // Atualizar câmera
//   camera.left = largura / -2;
//   camera.right = largura / 2;
//   camera.top = tamanho / 2;
//   camera.bottom = tamanho / -2;
//   camera.updateProjectionMatrix();

//   // Atualizar plano secundário
//   planGeo.dispose();
//   planGeo = new THREE.PlaneGeometry(largura, tamanho);
//   planGeo.geometry = planGeo;

//   yOffset = tamanho * -0.4;
//   platform.position.set(0, yOffset, 0.0);

//   // Atualizar renderer
//   renderer.setSize(largura, tamanho);
// }

let isPaused = false;

function pause() {
  isPaused = true;
}

function resume() {
  isPaused = false;
  animate();
}

function resetGame() {
  ball.position.set(0, 100, 0);
  platform.position.set(0, -200, 0);

  ballVelocity.set(0, 0, 0);
  const defaultVelocity = new THREE.Vector3(0, -0.2, 0);
  ballVelocity.copy(defaultVelocity);
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
  requestAnimationFrame(render);
  renderer.render(scene, camera); // Render scene
  animate();
}
