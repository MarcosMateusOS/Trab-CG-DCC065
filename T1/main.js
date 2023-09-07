import * as THREE from "three";
import { OrbitControls } from "../build/jsm/controls/OrbitControls.js";
import GUI from "../libs/util/dat.gui.module.js";
import cameraInit from "./camera.js";
import planoInit from "./plano.js";
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

let intersectionCube;
function addPlataform(x, y, w, h) {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  intersectionCube = new THREE.Mesh(geometry, material);
  intersectionCube.position.set(x, y, 0);
  intersectionCube.scale.set(w, h, 1);

  scene.add(intersectionCube);
}

let platform;
function init() {
  platform = addPlataform(0, -200, largura / 15, 15);
}

window.addEventListener("mousemove", onMouseMove, false);
function onMouseMove(event) {
  intersectionCube.visible = false;

  let pointer = new THREE.Vector2();
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;

  // update the picking ray with the camera and pointer position
  raycaster.setFromCamera(pointer, camera);
  // calculate objects intersecting the picking ray
  let interception = raycaster.intersectObject(planoFundo);

  if (interception.length > 0) {
    let point = interception[0].point; // Pick the point where interception occurrs
    intersectionCube.visible = true;
    intersectionCube.position.set(point.x, point.y, point.z);
  }
}

init();

render();
function render() {
  requestAnimationFrame(render);
  renderer.render(scene, camera); // Render scene
}
