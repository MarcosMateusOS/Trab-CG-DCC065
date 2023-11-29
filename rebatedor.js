import * as THREE from "three";
import Stats from "./build/jsm/libs/stats.module.js";
import GUI from "./libs/util/dat.gui.module.js";
import { TrackballControls } from "./build/jsm/controls/TrackballControls.js";
import {
  initRenderer,
  initCamera,
  initDefaultBasicLight,
  createGroundPlane,
  onWindowResize,
} from "./libs/util/util.js";

import { CSG } from "./libs/other/CSGMesh.js";

var scene = new THREE.Scene();
var stats = new Stats();

var renderer = initRenderer();
renderer.setClearColor("rgb(30, 30, 40)");
var camera = initCamera(new THREE.Vector3(4, -8, 8));
camera.up.set(0, 0, 1);

window.addEventListener(
  "resize",
  function () {
    onWindowResize(camera, renderer);
  },
  false
);
initDefaultBasicLight(scene, true, new THREE.Vector3(12, -15, 20), 28, 1024);

var groundPlane = createGroundPlane(20, 20);
scene.add(groundPlane);

var axesHelper = new THREE.AxesHelper(12);
scene.add(axesHelper);

var trackballControls = new TrackballControls(camera, renderer.domElement);

let mesh1, mesh2, mesh3;

buildInterface();
buildObjects();
render();
function buildObjects() {
  //Criação novo rebatedor
  let mesh2;
  let auxMat = new THREE.Matrix4();
  let texture = new THREE.TextureLoader().load('./utils/cdm.png');
  let cubeMesh = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshPhongMaterial({ color: "red" })
  );
  let cylinderMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.85, 0.85, 2, 17),
    new THREE.MeshPhongMaterial({ color: "blue" })
  );

  cubeMesh.position.set(0, 1, 0);
  cylinderMesh.position.set(1, -0.5, 0.0);

  updateObject(cubeMesh);
  updateObject(cylinderMesh);

  let csgObject, cubeCSG, cylinderCSG;

  cubeMesh.position.set(0, 1, 0);
  cylinderMesh.position.set(1, -0.5, 0.0);

  cubeCSG = CSG.fromMesh(cubeMesh);
  cylinderCSG = CSG.fromMesh(cylinderMesh);

  csgObject = cubeCSG.intersect(cylinderCSG);
  mesh2 = CSG.toMesh(csgObject, auxMat);
  setUVCoordinates(mesh2.geometry);
  mesh2.material = new THREE.MeshPhongMaterial({ map: texture });

    
  mesh2.position.set(3, 0, 10);
  mesh2.scale.set(0.5, 0.5, 0.5);
  mesh2.rotation.y = THREE.MathUtils.degToRad(90);
  mesh2.rotation.z = THREE.MathUtils.degToRad(270);

  mesh2.position.set(0, 0, 5);

  mesh2.scale.set(2.5, 2.5, 5);
     
  // Não é necessário chamar updateObject, pois matrixAutoUpdate é true por padrão
  mesh2.geometry.computeBoundingBox();
  let boundingBox = mesh2.geometry.boundingBox;
  let mesh2width = boundingBox.max.x - boundingBox.min.x;
  let mesh2height = boundingBox.max.y - boundingBox.min.y;
  mesh2width *= mesh2.scale.x; // Ajustando a largura com base na escala do objeto
  mesh2height *= mesh2.scale.y; // Ajustando a altura com base na escala do objeto

  scene.add(mesh2);
}

function setUVCoordinates(geometry) {
  const uv = [];
  const vertices = geometry.attributes.position.array;
  const numVertices = vertices.length / 3;

  for (let i = 0; i < numVertices; i++) {
    const x = vertices[i * 3];
    const y = vertices[i * 3 + 1];
    const z = vertices[i * 3 + 2];

    // Calcular coordenadas polares
    const radius = Math.sqrt(x * x + y * y);
    const angle = Math.atan2(y, x);

    // Mapeamento UV baseado na posição dos vértices
    // Assegurar que as coordenadas UV estejam no primeiro quadrante
    const u = ((angle / (2 * Math.PI)) + 0.5) / 1.5; // Normaliza o ângulo para o intervalo [0, 0.5]
    const v = radius / 1.25; // Normaliza o raio para o intervalo [0, 0.5]

    uv.push(u, v);
  }

  geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uv), 2));
}







function updateObject(mesh) {
  mesh.matrixAutoUpdate = false;
  mesh.updateMatrix();
}

function render() {
  stats.update();
  trackballControls.update();
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}

function buildInterface() {
  var controls = new (function () {
    this.wire = false;

    this.onWireframeMode = function () {
      mesh1.material.wireframe = this.wire;
      mesh2.material.wireframe = this.wire;
      mesh3.material.wireframe = this.wire;
    };
  })();

  var gui = new GUI();
  gui
    .add(controls, "wire", false)
    .name("Wireframe")
    .onChange(function (e) {
      controls.onWireframeMode();
    });
}
import { ArrowHelper, Vector3, BufferAttribute } from "three";
function addNormalArrowsWithinXRange(mesh) {
  // Verifique se a geometria é do tipo BufferGeometry e tem os atributos necessários
  if (
    !mesh.geometry.isBufferGeometry ||
    !mesh.geometry.attributes.position ||
    !mesh.geometry.attributes.normal
  ) {
    console.error(
      "A geometria não é do tipo BufferGeometry ou não possui atributos de posição/normal."
    );
    return;
  }

  const positions = mesh.geometry.attributes.position.array;
  const normals = mesh.geometry.attributes.normal.array;
  const numVertices = positions.length / 3;

  // Parâmetros para o intervalo de 'x' e a aparência das setas
  const lowerBoundX = 0.13;
  const upperBoundX = 0.18;
  const arrowLength = 0.5; // Ajuste conforme necessário
  const arrowColor = 0xff0000; // Cor vermelha para a seta

  for (let i = 0; i < numVertices; i++) {
    const x = positions[i * 3];
    const y = positions[i * 3 + 1];
    const z = positions[i * 3 + 2];

    // Se 'x' estiver dentro do intervalo especificado, adicione uma seta de normal
    if (x >= lowerBoundX && x <= upperBoundX) {
      // Obtenha a normal para este vértice
      const normalIndex = i * 3;
      const normalVector = new THREE.Vector3(
        normals[normalIndex], // componente x da normal
        normals[normalIndex + 1], // componente y da normal
        normals[normalIndex + 2] // componente z da normal
      );

      // Obtenha a posição deste vértice
      const vertexPosition = new THREE.Vector3(x, y, z);

      // Ajuste a escala e posição da seta
      const arrowDirection = normalVector.clone().normalize();

      // Crie e adicione a seta à cena
      const arrowHelper = new THREE.ArrowHelper(
        arrowDirection,
        vertexPosition,
        arrowLength,
        arrowColor
      );
      mesh.add(arrowHelper);
      mesh.updateMatrix(); // Adicionando a seta como um child do mesh garante que ela se mova com o mesh
    }
  }
}
