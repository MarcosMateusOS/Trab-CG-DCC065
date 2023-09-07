import * as THREE from "three";
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

let scene, renderer, camera, light;
scene = new THREE.Scene();
scene.background = new THREE.Color("black"); //0xf0f0f0);
renderer = initRenderer();

let tamanho = window.innerHeight;
let largura = window.innerWidth;
let aspect = largura / tamanho;
let position = new THREE.Vector3(0, 0, 90);
camera = cameraInit(tamanho, largura, position);

// criando plano secundário(atrás)
var secundaryPlaneGeometry = new THREE.PlaneGeometry(largura, tamanho);
let materialPlanoSecundario = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
let planoSecundario = new THREE.Mesh(
  secundaryPlaneGeometry,
  materialPlanoSecundario
);
planoSecundario.position.set(0, 0, 0);
scene.add(planoSecundario);
// fim criação plano secundário

// criação plano primário

var primaryPlaneGeometry = new THREE.PlaneGeometry(tamanho / 2, tamanho);
let materialPlanoPrimario = new THREE.MeshBasicMaterial({ color: 0xffff00 });
let planoPrimario = new THREE.Mesh(primaryPlaneGeometry, materialPlanoPrimario);
planoPrimario.position.set(0, 0, 0);

scene.add(planoPrimario);

// fim criação plano primário

// criar rebatedor
let rectangleWidth = 0.05 * largura;
let rectangleHeight = 0.05 * tamanho;

// Criar a geometria e o material para o retângulo
var rectangleGeometry = new THREE.PlaneGeometry(
  rectangleWidth,
  rectangleHeight
);
let rectangleMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });

let rectangle = new THREE.Mesh(rectangleGeometry, rectangleMaterial);

let yOffset = tamanho * -0.4;

planoPrimario.add(rectangle);

let intersectionCube;

function addPlataform(x, y, w, h) {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  intersectionCube = new THREE.Mesh(geometry, material);
  intersectionCube.position.set(x, y, 0);
  intersectionCube.scale.set(w, h, 1);

  scene.add(intersectionCube);
}

// let platform;
// function init() {
//   platform = addPlataform(0, -200, largura / 15, 15);
// }

window.addEventListener(
  "resize",
  function () {
    updateDimensions();
  },
  false
);

// -- Create raycaster
let raycaster = new THREE.Raycaster();
window.addEventListener("mousemove", onMouseMove, false);

function onMouseMove(event) {
  let mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Atualizar o raycaster com a nova posição do mouse
  raycaster.setFromCamera(mouse, camera);

  // Encontrar objetos que intersectam o raio
  let intersects = raycaster.intersectObjects([planoPrimario, planoSecundario]);

  if (intersects.length > 0) {
    // Obter a posição da interseção
    let point = intersects[0].point;

    // Calcular os limites do planoPrimario
    let leftLimit =
      planoPrimario.position.x - primaryPlaneGeometry.parameters.width / 2;
    let rightLimit =
      planoPrimario.position.x + primaryPlaneGeometry.parameters.width / 2;

    // Verificar se a posição x da interseção está dentro dos limites
    if (
      point.x >= leftLimit + rectangleWidth / 2 &&
      point.x <= rightLimit - rectangleWidth / 2
    ) {
      // Mover o retângulo para a posição x da interseção
      rectangle.position.x = point.x;
    } else if (point.x < leftLimit + rectangleWidth / 2) {
      // Colocar o retângulo no limite à esquerda
      rectangle.position.x = leftLimit + rectangleWidth / 2;
    } else if (point.x > rightLimit - rectangleWidth / 2) {
      // Colocar o retângulo no limite à direita
      rectangle.position.x = rightLimit - rectangleWidth / 2;
    }
  }

  // intersectionCube.visible = false;

  // let pointer = new THREE.Vector2();
  // pointer.x = (event.clientX / window.innerWidth) * 2 - 1;

  // // update the picking ray with the camera and pointer position
  // raycaster.setFromCamera(pointer, camera);
  // // calculate objects intersecting the picking ray
  // let interception = raycaster.intersectObject(planoFundo);

  // if (interception.length > 0) {
  //   let point = interception[0].point; // Pick the point where interception occurrs
  //   intersectionCube.visible = true;
  //   intersectionCube.position.set(point.x, point.y, point.z);
  // }
}

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
  secundaryPlaneGeometry.dispose();
  secundaryPlaneGeometry = new THREE.PlaneGeometry(largura, tamanho);
  planoSecundario.geometry = secundaryPlaneGeometry;

  // Atualizar plano primário
  primaryPlaneGeometry.dispose();
  primaryPlaneGeometry = new THREE.PlaneGeometry(tamanho / 2, tamanho);
  planoPrimario.geometry = primaryPlaneGeometry;

  // Atualizar retângulo
  // rectangleWidth = 0.05 * largura;
  // rectangleHeight = 0.05 * tamanho;
  // rectangleGeometry.dispose();
  // rectangleGeometry = new THREE.PlaneGeometry(rectangleWidth, rectangleHeight);
  // rectangle.geometry = rectangleGeometry;

  // Atualizar posição do retângulo (se necessário)
  yOffset = tamanho * -0.4;
  rectangle.position.set(0, yOffset, 0.0);

  // Atualizar renderer
  renderer.setSize(largura, tamanho);
}

updateDimensions();

// init();

render();
function render() {
  requestAnimationFrame(render);
  renderer.render(scene, camera); // Render scene
}
