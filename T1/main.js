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
camera = cameraInit(tamanho, largura, position);
// orbit = new OrbitControls(camera, renderer.domElement);



//  Criação plano secundário

var secundaryPlanGeometry = new THREE.PlaneGeometry(largura,tamanho);
let secundaryPlanMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
let secundaryPlan = new THREE.Mesh(secundaryPlanGeometry,secundaryPlanMaterial);
scene.add(secundaryPlan);
//fim criação plano secundário






//Criação plano primário
var primaryPlanGeometry = new THREE.PlaneGeometry(tamanho/2,tamanho);
let primaryPlanMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });
let primaryPlan = new THREE.Mesh(primaryPlanGeometry,primaryPlanMaterial);
// primaryPlan.layers.set(0);
scene.add(primaryPlan);
//fim criação plano primário




//Criação de paredes
const wallMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff }); // Cor branca
var wallTopBottomGeometry = new THREE.PlaneGeometry(tamanho / 2, 0.02*tamanho, 0);
let wallTop = new THREE.Mesh(wallTopBottomGeometry, wallMaterial);
wallTop.position.y = tamanho/2;
scene.add(wallTop);
let wallBottom = new THREE.Mesh(wallTopBottomGeometry, wallMaterial);
wallBottom.position.y = -tamanho / 2;
scene.add(wallBottom);
const wallLeftRigth = new THREE.PlaneGeometry(0.02*tamanho,tamanho, 0);
//Cria as paredes na esquerda e direita
let wallRigth = new THREE.Mesh(wallLeftRigth, wallMaterial);
wallRigth.position.x = tamanho/4;
scene.add(wallRigth);

let wallLeft = new THREE.Mesh(wallLeftRigth, wallMaterial);
wallLeft.position.x = -tamanho / 4;
scene.add(wallLeft);
//fim criação paredes.

// Criação rebatedor
let platformWidth = 0.15 * primaryPlanGeometry.parameters.width;
let platformHeight = 0.025 * primaryPlanGeometry.parameters.height;
var platformGeometry = new THREE.PlaneGeometry(platformWidth,platformHeight)
let platformMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
let platform = new THREE.Mesh(platformGeometry,platformMaterial);
let yOffset =  tamanho * -0.4;
platform.position.set(0,yOffset,0.0)

scene.add(platform);
//fim criação rebatedor


// criação bola
const ball = new THREE.Mesh(
  new THREE.SphereGeometry(10),
  new THREE.MeshBasicMaterial({ color: 0xff0000 })
);
ball.position.set(0, 100, 0);

const ballVelocity = new THREE.Vector3(0, -0.2, 0);
scene.add(ball);
//fim criação bola


// animação bola
function animate() {
  if (isPaused) return;

  ball.position.x += ballVelocity.x;
  ball.position.y += ballVelocity.y;

  checkPlatformCollision(platform, ball, ballVelocity);
  requestAnimationFrame(animate);
}
//fim animação  bola

// Criação Raycaster
let raycaster = new THREE.Raycaster();

window.addEventListener("mousemove", onMouseMove, false);
function onMouseMove(event) {
  let mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  let intersects = raycaster.intersectObjects([primaryPlan,secundaryPlan]);

  if (intersects.length > 0) {
    let point = intersects[0].point; // Pick the point where intersects occurrs

    // Calcula os limites do planoPrimario
   // Calcula os limites do planoPrimario
let leftLimit = wallLeft.position.x + platformWidth / 2 ;  // Ajustado aqui
let rightLimit = wallRigth.position.x - platformWidth / 2 ;  // Ajustado aqui

// Verifica se a posição x da interseção está dentro dos limites
if (
  point.x >= leftLimit &&  // Ajustado aqui
  point.x <= rightLimit  // Ajustado aqui
) {
  // Move o retângulo para a posição x da interseção
  platform.position.x = point.x;
} else if (point.x < leftLimit) {  // Ajustado aqui
  // Coloca o retângulo no limite à esquerda
  platform.position.x = leftLimit;  // Ajustado aqui
} else if (point.x > rightLimit) {  // Ajustado aqui
  // Coloca o retângulo no limite à direita
  platform.position.x = rightLimit;  // Ajustado aqui
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
  // Atualizar tamanho e proporção da janela
  largura = window.innerWidth;
  tamanho = window.innerHeight;
  aspect = largura / tamanho;

  // Atualizar câmera
  camera.left = largura / -2;
  camera.right = largura / 2;
  camera.top = tamanho / 2;
  camera.bottom = tamanho / -2;
  camera.updateProjectionMatrix();

  // Atualizar plano secundário
  secundaryPlanGeometry.dispose();
  secundaryPlanGeometry = new THREE.PlaneGeometry(largura, tamanho);
  secundaryPlan.geometry = secundaryPlanGeometry;
  //fim atualizar plano secundário


  // Atualizar plano primário
  primaryPlanGeometry.dispose();
  primaryPlanGeometry = new THREE.PlaneGeometry(tamanho / 2, tamanho);
  primaryPlan.geometry = primaryPlanGeometry;
  //fim atualizar plano primário
  

  // Atualizar plataforma
  platformWidth = primaryPlanGeometry.parameters.width * 0.225;
  platformHeight = primaryPlanGeometry.parameters.height * 0.025;
  platform.geometry.dispose();
  platformGeometry = new THREE.PlaneGeometry(platformWidth, platformHeight);
  platform.geometry = platformGeometry;
  yOffset = tamanho * -0.4;
  platform.position.set(0, yOffset, 0.0);
  //fim atualizar plataforma

  // Atualizar barras
  wallTop.geometry.dispose();
  wallBottom.geometry.dispose();
  let wallTopBottomGeometry = new THREE.BoxGeometry(primaryPlanGeometry.parameters.width,0.05*tamanho, 0);
  wallTop.geometry = wallTopBottomGeometry;
  wallBottom.geometry = wallTopBottomGeometry;
  wallTop.position.y = tamanho/2
  wallBottom.position.y = -tamanho/2





  wallLeft.geometry.dispose();
  wallRigth.geometry.dispose();
  let wallLeftRigth = new THREE.BoxGeometry(0.025*tamanho,tamanho, 0);
  wallLeft.geometry = wallLeftRigth
  wallRigth.geometry = wallLeftRigth
  wallLeft.position.x = -tamanho/4;
  wallRigth.position.x = tamanho/4;
  //fim atualizar barras 

  // Atualizar bolinha





  //fim atualizar bolinha

  // Atualizar renderer
  renderer.setSize(largura, tamanho);
}

updateDimensions()

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
