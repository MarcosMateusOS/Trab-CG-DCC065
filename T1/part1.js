import * as THREE from "three";
import GUI from "../libs/util/dat.gui.module.js";
import { OrbitControls } from "../build/jsm/controls/OrbitControls.js";
import {
  initRenderer,
  setDefaultMaterial,
  SecondaryBox,
  initDefaultBasicLight,
  onWindowResize,
  lightFollowingCamera,
} from "../libs/util/util.js";

let scene, renderer, light; // Initial variables
scene = new THREE.Scene(); // Create main scene
scene.background = new THREE.Color(0xa30000);
let cameraOrtho = new THREE.OrthographicCamera();
renderer = initRenderer(); // View function in util/utils
renderer.setSize(window.innerWidth, window.innerHeight); // redimensionar o renderer
document.body.appendChild(renderer.domElement);
light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene

createSceneObjects();

//-----------------------------------------------------------
//-- Create cameras -----------------------------------------
//-----------------------------------------------------------

// let orthoSize = 20; // Estimated size for orthographic projection

let aspect = 1 / 2;
var w = 10; // Largura da área visível
var h = w * aspect; // Altura da área visível
var halfWidth = w / 2;
var halfHeight = h / 2;

cameraOrtho.left = -halfWidth;
cameraOrtho.right = halfWidth;
cameraOrtho.top = halfHeight;
cameraOrtho.bottom = -halfHeight;
cameraOrtho.near = 0.1;
cameraOrtho.far = 1000;

cameraOrtho.position.set(0, 0, 10);
cameraOrtho.lookAt(0, 0, 0);
cameraOrtho.updateProjectionMatrix();

// Set perspective camera as default, and sets its position and lookat
// let camera = cameraOrtho;
// camera.position.copy(position);
// camera.up.copy(up);
// camera.lookAt(lookat); // or camera.lookAt(0, 0, 0);

// window.addEventListener(
//   "resize",
//   function () {
//     onWindowResize(camera, renderer, orthoSize);
//   },
//   false
// );

var cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
var cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
scene.add(cube);

// evento para manter a razão de aspecto
// window.addEventListener("resize", function () {
//   var newWidth = window.innerWidth;
//   var newHeight = window.innerHeight;

//   // Mantenha a área visível centralizada
//   var newHalfWidth = halfWidth * (newHeight / h);
//   var newHalfHeight = halfHeight;

//   // Atualize a câmera e o renderizador
//   cameraOrtho.left = -newHalfWidth;
//   cameraOrtho.right = newHalfWidth;
//   cameraOrtho.top = newHalfHeight;
//   cameraOrtho.bottom = -newHalfHeight;
//   cameraOrtho.updateProjectionMatrix();

//   renderer.setSize(newWidth, newHeight);
// });

function animate() {
  requestAnimationFrame(animate);

  // Rotação simples do cubo para animação
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  renderer.render(scene, cameraOrtho);
}

animate();

// Set one orbit control per camera
// orbitO;
// orbitO = new OrbitControls(cameraOrtho, renderer.domElement); // Enable mouse rotation, pan, zoom etc.
// Zoom and pan are disabled because each camera type works differently

render();

function render() {
  lightFollowingCamera(light, cameraOrtho); // Makes light follow the camera
  requestAnimationFrame(render); // Show events
  renderer.render(scene, cameraOrtho); // Render scene
}

//-----------------------------------------------------------
//-- Auxiliary functions ------------------------------------
//-----------------------------------------------------------

function createSceneObjects() {
  // create the inner cube
  //   scene.add(
  //     new THREE.Mesh(
  //       new THREE.BoxGeometry(5, 5, 5),
  //       setDefaultMaterial("rgb(70,70,70)")
  //     )
  //   );

  scene.add(new THREE.AxesHelper(12));
}
