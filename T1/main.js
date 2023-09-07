import * as THREE from "three";
import { OrbitControls } from "../build/jsm/controls/OrbitControls.js";
import GUI from "../libs/util/dat.gui.module.js";
import cameraInit from "./camera.js";
import planoInit from "./plano.js";
import addPlatform from "./platform.js";
import { checkPlatformCollision } from "./collisions.js";
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
let position = new THREE.Vector3(0, 0, 90);
camera = cameraInit(tamanho, largura, position);
orbit = new OrbitControls(camera, renderer.domElement);

const planoFundo = planoInit(tamanho, largura, 0x0000ff);
planoFundo.layers.set(0);
scene.add(planoFundo);

// -- Create raycaster
let raycaster = new THREE.Raycaster();

let platformWidth = 100;
let platformHeight = 2.55;
let platform = addPlatform(0, -100, platformWidth, platformHeight, 0x00ff00);
scene.add(platform);

const ball = new THREE.Mesh(
  new THREE.SphereGeometry(15, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0xff0000 })
);
ball.position.set(0, 100, 0);
const ballVelocity = new THREE.Vector3(0, -0.3, 0);
scene.add(ball);

function animate() {
  requestAnimationFrame(animate);

  ball.position.x += ballVelocity.x;
  ball.position.y += ballVelocity.y;

  checkPlatformCollision(platform, ball, ballVelocity);
}

window.addEventListener("mousemove", onMouseMove, false);
function onMouseMove(event) {
  platform.visible = false;

  let pointer = new THREE.Vector2();
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;

  // update the picking ray with the camera and pointer position
  raycaster.setFromCamera(pointer, camera);
  // calculate objects intersecting the picking ray
  let interception = raycaster.intersectObject(planoFundo);

  if (interception.length > 0) {
    let point = interception[0].point; // Pick the point where interception occurrs
    platform.visible = true;
    platform.position.x = point.x;
  }
}

render();
function render() {
  requestAnimationFrame(render);
  renderer.render(scene, camera); // Render scene
  animate();
}
