import * as THREE from "three";
import { TextGeometry } from "../build/jsm/geometries/TextGeometry.js";
import { FontLoader } from "../build/jsm/loaders/FontLoader.js";
import { OrbitControls } from "../build/jsm/controls/OrbitControls.js";
import { GLTFLoader } from '../build/jsm/loaders/GLTFLoader.js';
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
  CubeTextureLoader,
  Vector3,
} from "../build/three.module.js";

var count = { score: 0 };
var currentLevel = 1;

let scene, renderer, camera, orbit;

scene = new THREE.Scene();

const buildSkyBox = async () => {
  const pathArr = [
    "./utils/skybox/rt.png",
    "./utils/skybox/lf.png",
    "./utils/skybox/up.png",
    "./utils/skybox/dn.png",
    "./utils/skybox/ft.png",
    "./utils/skybox/bk.png",
  ];
  const loader = new CubeTextureLoader();
  let texture = await loader.loadAsync(pathArr);

  return texture;
};


var textureLoaderRebatedor = new THREE.TextureLoader();
var textureRebatedor = textureLoaderRebatedor.load('./utils/zebra.jpg'); // Substitua pelo caminho da sua textura

// Criar o Material com a Textura
var texturedMaterialRebatedor = new THREE.MeshPhongMaterial({ map: textureRebatedor });


scene.background = await buildSkyBox();

//scene.background = new THREE.Color("red"); //0xf0f0f0);
renderer = initRenderer();

let distanciaPlanoPrimarioZ = 10;

let height = window.innerHeight;
let width = window.innerWidth;
let aspect = width / height;

let position = new THREE.Vector3(5, -81, height / 2);
camera = cameraInit(height, width, position);
orbit = new OrbitControls(camera, renderer.domElement);
const { primary, second } = await buildWordPlans(scene, width, height);

//Criação plano primário
var primaryPlanGeometry = new THREE.BoxGeometry(height / 2, height, 5);
let primaryPlanMaterial = new THREE.MeshLambertMaterial({
  color: new THREE.Color(0, 0, 0),
  opacity: 0,
  transparent: true,
});
let primaryPlan = new THREE.Mesh(primaryPlanGeometry, primaryPlanMaterial);
scene.add(primaryPlan);
//fim criação plano primário

let secundaryPlanGeometry = second.secundaryPlanGeometry;
let secundaryPlan = second.secundaryPlan;

//Criação de paredes
const { walls, geometry } = await buildWorldWalls(
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

let yOffset = height * -0.27;

//fim criação rebatedor

//Criação novo rebatedor
let mesh2;
let auxMat = new THREE.Matrix4();

// Objetos
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

// Atualiza as matrizes dos objetos
updateObject(cubeMesh);
updateObject(cylinderMesh);

let csgObject, cubeCSG, cylinderCSG;

cubeMesh.position.set(0, 1, 0);
cylinderMesh.position.set(1, -0.5, 0.0);

cubeCSG = CSG.fromMesh(cubeMesh);
cylinderCSG = CSG.fromMesh(cylinderMesh);

csgObject = cubeCSG.intersect(cylinderCSG);
mesh2 = CSG.toMesh(csgObject, auxMat);
mesh2.material = texturedMaterialRebatedor;

// Aplica transformações ao mesh2 (plataforma)
mesh2.position.set(3, 0, 10); // Posição inicial
mesh2.scale.set(0.5, 0.5, 0.5); // Aplicando escala
mesh2.rotation.y = THREE.MathUtils.degToRad(90); // Aplicando rotação em Y
mesh2.rotation.z = THREE.MathUtils.degToRad(270); // Aplicando rotação em Z

// Posição final desejada para o mesh2
mesh2.position.set(0, yOffset, 10);

// Ajusta a escala com base na geometria do plano primário
mesh2.scale.set(
  primaryPlanGeometry.parameters.width / 20,
  primaryPlanGeometry.parameters.width / 20,
  primaryPlanGeometry.parameters.width / 10
);

mesh2.geometry.computeBoundingBox();
let boundingBox = mesh2.geometry.boundingBox;
let mesh2width = boundingBox.max.x - boundingBox.min.x;
let mesh2height = boundingBox.max.y - boundingBox.min.y;
mesh2width *= mesh2.scale.x;
mesh2height *= mesh2.scale.y;

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
  new THREE.MeshPhongMaterial({
    color: 0xff0000, // Cor da bolinha
    specular: 0xffffff, // Cor do brilho especular, geralmente branco
    shininess: 30 // Intensidade do brilho, ajuste conforme necessário
  })
);

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
    const object = scene.getObjectByProperty("uuid", brick.uuid);
    object.geometry.dispose();
    object.material.dispose();
    scene.remove(object);
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
    (Math.floor(wallRigth.position.x - 10) -
      Math.floor(wallLeft.position.x + 10)) +
    Math.floor(wallLeft.position.x + 10)
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
      (Math.floor(wallRigth.position.x - 10) -
        Math.floor(wallLeft.position.x + 10)) +
      Math.floor(wallLeft.position.x + 10)
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
    new THREE.MeshPhongMaterial(
      {
        color:  0x808080, // Cor da bolinha
        specular: 0xffffff, // Cor do brilho especular, geralmente branco
        shininess: 30 // Intensidade do brilho, ajuste conforme necessário
      })
  );
  clonedBall.castShadow = true;
  scene.add(clonedBall);
  clonedBall.visible = true;

  clonedBallVelocity = new THREE.Vector3();
  clonedBallVelocity.copy(ballVelocity);
  clonedBallVelocity.normalize();
  clonedBallVelocity.multiplyScalar(newBallVelocity);

  clonedBall.position.z = ball.position.z;
  clonedBall.position.x += clonedBallVelocity.x;
  clonedBall.position.y += clonedBallVelocity.y;
  isActivePowerUp = false;
}

function removeClonedBall() {
  if (clonedBall) {
    const object = scene.getObjectByProperty("uuid", clonedBall.uuid);

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
      (Math.floor(wallRigth.position.x - 10) -
        Math.floor(wallLeft.position.x + 10)) +
      Math.floor(wallLeft.position.x + 10)
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

    if (count.score === 66 && currentLevel === 1) {
      count.score = 0;
      currentLevel = 2;
      resetGame();
    }

    if (count.score === 224 && currentLevel === 2) {
      count.score = 0;
      currentLevel = 1;
      resetGame();
    }

    if (lerpConfig.move) {
      powerUp.position.lerp(lerpConfig.destination, lerpConfig.alpha);
    }
  }
}
//fim animação bola

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
      let point = intersects[0].point;

      // Calcula os limites do planoPrimario
      let borderLeftSize = wallLeft.geometry.parameters.width;
      let borderRightSize = wallRigth.geometry.parameters.width;

      let leftLimit =
        wallLeft.position.x +
        mesh2width * 2 +
        borderLeftSize / 2 +
        borderLeftSize / 5;
      let rightLimit =
        wallRigth.position.x -
        mesh2width * 2 -
        borderRightSize / 2 -
        borderLeftSize / 5;

      // Verifica se a posição x da interseção está dentro dos limites
      if (point.x >= leftLimit && point.x <= rightLimit) {
        // Move o retângulo para a posição x da interseção
        mesh2.position.x = point.x;

        if (!start) {
          ball.position.x = point.x;
        }
      } else if (point.x < leftLimit) {
        // Coloca o retângulo no limite à esquerda
        mesh2.position.x = leftLimit;
        if (!start) {
          ball.position.x = leftLimit;
        }
      } else if (point.x > rightLimit) {
        // Coloca o retângulo no limite à direita
        mesh2.position.x = rightLimit;

        if (!start) {
          ball.position.x = rightLimit;
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
  // fim atualizar height e proporção

  camera.aspect = aspect;

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
  animate();
}

function resetGame() {
  start = false;
  count.score = 0;
  checkTime = 0;

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
      (Math.floor(wallRigth.position.x - 10) -
        Math.floor(wallLeft.position.x + 10)) +
      Math.floor(wallLeft.position.x + 10)
  );
  powerUp.position.set(randX, yOffset + 400, distanciaPlanoPrimarioZ);
  powerUp.visible = false;

  if (isPaused) {
    resume();
  }
}

var keyboard = new KeyboardState();
let isFullScreen = false;
let enableOrbit = false;
orbit.enabled = false;
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

  if (keyboard.down("O")) {
    if (!enableOrbit) {
      orbit.enabled = true;
      enableOrbit = true;
    } else {
      orbit.enabled = false;
      enableOrbit = false;
    }
  }

  if (keyboard.down("enter")) fullScreen();
}

let initialTime;
document.addEventListener("click", function () {
  start = true;
  initialTime = Date.now() / 1000;
});

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

function positionSpaceshipOnPaddle() {
  if (spaceship && mesh2) {
      
      spaceship.position.x = mesh2.position.x;
      spaceship.position.y = mesh2.position.y - 90;
      spaceship.position.z = mesh2.position.z;
  }
}


let spaceship;

const loadSpaceship = async () => {
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync('./utils/nave.glb');
  spaceship = gltf.scene;

  
  const grayColor = new THREE.Color(0x808080); 

  
  spaceship.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshPhongMaterial({
          color: grayColor,
          shininess: 100 
        });
      }
  });

  

  
  spaceship.scale.set(7, 7, 7); 

  
  positionSpaceshipOnPaddle();
  spaceship.rotation.y = 270 * (Math.PI / 180);
  spaceship.rotation.z = 270 * (Math.PI / 180);
  
 
  scene.add(spaceship);
};

loadSpaceship();





render();
function render() {
  keyboardUpdate();
  animate();
  positionSpaceshipOnPaddle();
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}
