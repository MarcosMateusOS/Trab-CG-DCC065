import * as THREE from "three";

import { handleBrick } from "./bricks.js";
let lastCollisionTimePlatform = 0;
const collisionCooldownPlatform = 100;
// Função para verificar colisão da bola com a platforma
export function checkPlatformCollision(platform, ball, ballVelocity, scene) {
  // Atualize o 'bounding box' da plataforma com base na geometria atual e na escala do objeto.
  platform.geometry.computeBoundingBox();
  let boundingBox = platform.geometry.boundingBox.clone(); // Clone o bounding box para evitar alterações no original.

  // Ajuste o 'bounding box' com base na escala do objeto.
  boundingBox.max.multiply(platform.scale);
  boundingBox.min.multiply(platform.scale);

  // Ajuste o 'bounding box' com base na posição do objeto.
  boundingBox.translate(platform.position);
  let currentSpeed = ballVelocity.length();
  const previousVelocity = ballVelocity.clone();
  // Crie o 'bounding box' da bola.
  let bbBall = new THREE.Box3().setFromObject(ball);

  // Crie o 'bounding box' do rebatedor (platform).
  let bbRebatedor = new THREE.Box3().setFromObject(platform);

  // Verifique se o 'bounding box' da plataforma intersecta o 'bounding box' da bola.
  if (bbBall.intersectsBox(bbRebatedor)) {
    const currentTime = performance.now(); // Obtenha o tempo atual em milissegundos.

    // Verifique se o tempo atual é maior que o 'lastCollisionTimePlatform' mais o período de 'collisionCooldownPlatform'.
    if (currentTime < lastCollisionTimePlatform + collisionCooldownPlatform) {
      // Se ainda estamos no período de cooldown, simplesmente retorne e ignore esta colisão.
      return;
    }

    lastCollisionTimePlatform = currentTime;
    // Obtenha o ponto de colisão no espaço mundial.
    const collisionPointWorld = new THREE.Vector3().copy(ball.position);

    // Calcule o ponto médio da parte inferior do rebatedor.
    const bottomMiddlePoint = new THREE.Vector3(
      (bbRebatedor.min.x + bbRebatedor.max.x) / 2,
      bbRebatedor.min.y - 100,
      10
    );

    console.log("altura:" + (bbRebatedor.max.y - bbRebatedor.min.y));

    let directionVector = new THREE.Vector3().subVectors(
      collisionPointWorld,
      bottomMiddlePoint
    );
    directionVector.normalize();

    let previousVector = ballVelocity.clone();
    previousVector.normalize();

    let newVector = previousVector.reflect(directionVector);
    newVector.normalize();
    newVector.multiplyScalar(currentSpeed);
    ballVelocity.copy(newVector);
  }
}

export function checkBordersCollision(
  wallLeft,
  wallRight,
  wallBottom,
  wallTop,
  ball,
  ballVelocity
) {
  const wallLeftBox = new THREE.Box3().setFromObject(wallLeft);
  const ballBox = new THREE.Box3().setFromObject(ball);
  const wallRightBox = new THREE.Box3().setFromObject(wallRight);
  const wallTopBox = new THREE.Box3().setFromObject(wallTop);
  const wallBottomBox = new THREE.Box3().setFromObject(wallBottom);

  // Verifique se a bola colide com a parede esquerda
  if (wallLeftBox.intersectsBox(ballBox)) {
    // O vetor normal à parede esquerda é no sentido positivo do eixo X
    // Portanto, inverta a componente x da velocidade da bola
    ballVelocity.x = -ballVelocity.x;
  }

  if (wallRightBox.intersectsBox(ballBox)) {
    // O vetor normal à parede esquerda é no sentido positivo do eixo X
    // Portanto, inverta a componente x da velocidade da bola
    ballVelocity.x = -ballVelocity.x;
  }

  if (wallTopBox.intersectsBox(ballBox)) {
    // O vetor normal à parede esquerda é no sentido positivo do eixo X
    // Portanto, inverta a componente x da velocidade da bola
    ballVelocity.y = -ballVelocity.y;
  }

  if (wallBottomBox.intersectsBox(ballBox)) {
    return true;
  }

  return false;
}
// Variável para armazenar o tempo da última colisão
let lastCollisionTime = 0;
const collisionCooldown = 10; // Tempo de cooldown em milissegundos (ajuste conforme necessário)

export function checkBrickCollision(brick, ball, ballVelocity, count) {
  // Obter o tempo atual
  const currentTime = new Date().getTime();

  // Se não passou tempo suficiente desde a última colisão, simplesmente retorne
  if (currentTime - lastCollisionTime < collisionCooldown) {
    return;
  }

  const brickBox = new THREE.Box3().setFromObject(brick);
  const ballSphere = new THREE.Sphere(
    ball.position,
    ball.geometry.parameters.radius
  );

  if (brickBox.intersectsSphere(ballSphere)) {
    lastCollisionTime = currentTime;

    const ballPos = ballSphere.center;
    let brickMax = brickBox.max;
    let brickMin = brickBox.min;

    if (ballPos.y > brickMax.y) {
      ballVelocity.y = -ballVelocity.y;
    }
    // Verificar colisão na parte inferior do tijolo
    else if (brickMin.y > ballPos.y) {
      ballVelocity.y = -ballVelocity.y;
    }
    // Verificar colisão na parte esquerda do tijolo
    else if (brickMin.x > ballPos.x) {
      ballVelocity.x = -ballVelocity.x;
    }
    // Verificar colisão na parte direita do tijolo
    else if (brickMax.x > ballPos.x) {
      ballVelocity.x = -ballVelocity.x;
    }

    handleBrick(brick, count);
  }
}

function createBBHelper(bb, color, scene) {
  // Create a bounding box helper
  let helper = new THREE.Box3Helper(bb, color);
  scene.add(helper);
  return helper;
}

// Função para verificar colisão da plataforma com o powerUp
export function checkPowerUpCollsion(platform, powerUp) {
  const paddleBox = new THREE.Box3().setFromObject(platform);
  const powerUpBox = new THREE.Box3().setFromObject(powerUp);

  if (paddleBox.intersectsBox(powerUpBox)) {
    return true;
  }

  return false;
}

// Função para verificar se o powerUp chegou ao destination
export function checkPowerUpIsInDestination(wallBottom, powerUp) {
  const powerUpBox = new THREE.Box3().setFromObject(powerUp);
  const wallBottomBox = new THREE.Box3().setFromObject(wallBottom);

  if (wallBottomBox.intersectsBox(powerUpBox)) {
    return true;
  }

  return false;
}
