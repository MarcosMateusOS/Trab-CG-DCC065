import * as THREE from "three";
import { OrbitControls } from "../build/jsm/controls/OrbitControls.js";
import {
  initRenderer,
  initCamera,
  initDefaultBasicLight,
  setDefaultMaterial,
  InfoBox,
  onWindowResize,
  createGroundPlaneXZ,
} from "../libs/util/util.js";
import { OrthographicCamera } from "../build/three.module.js";

let scene, renderer, material, light, orbit; // Initial variables
scene = new THREE.Scene(); // Create main scene
renderer = initRenderer();

// INÍCIO camera inicialização
let orthoSize = 20; // Estimated size for orthographic projection
let tamanho = window.innerHeight;
let largura = window.innerWidth;
let aspect = largura / tamanho;
let near = 0.1;
let far = 1000;
let fov = 40;
let position = new THREE.Vector3(0, 0, 90);
let lookat = new THREE.Vector3(0, 0, 0);
let up = new THREE.Vector3(0, 1, 0);

var camera = new THREE.OrthographicCamera(
  largura / -2,
  largura / 2,
  tamanho / 2,
  tamanho / -2,
  0.1,
  1000
);
camera.position.copy(position);
camera.lookAt(new THREE.Vector3(0, 0, 0));

// FIM CAMERA INICIALIZAÇAO

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
rectangle.position.set(0, yOffset, 0.0);

planoPrimario.add(rectangle);

// fim da criação do rebatedor

// fazer resize de camera, plano secundario e plano primário.

// fim do resize da camera, do plano secundário e do plano primário.

// movimentar rebatedor usando raycaster
let raycaster = new THREE.Raycaster();
window.addEventListener("mousemove", onMouseMove, false);

// Função para lidar com o movimento do mouse
function onMouseMove(event) {
  // Calcular a posição do mouse em coordenadas normalizadas (-1 a +1)
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
}
// fim movimentação

// Init a basic renderer
// let camera = new THREE.OrthographicCamera(-orthoSize * aspect / 2, orthoSize * aspect / 2, // left, right
// orthoSize / 2, -orthoSize / 2,                  // top, bottom
// near, far);
// // Init camera in this position
// camera.position.set(position);
// camera.up.copy(up);
// camera.lookAt(lookat);

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

material = setDefaultMaterial(); // create a basic material
light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
// orbit = new OrbitControls( camera, renderer.domElement ); // Enable mouse rotation, pan, zoom etc.

// Listen window size changes
window.addEventListener(
  "resize",
  function () {
    updateDimensions();
  },
  false
);

render();
function render() {
  requestAnimationFrame(render);
  renderer.render(scene, camera); // Render scene
}
