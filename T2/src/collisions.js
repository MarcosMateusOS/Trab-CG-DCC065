import * as THREE from "three";

import { handleBrick } from "./bricks.js";
let lastCollisionTimePlatform = 0;
const collisionCooldownPlatform = 100;
// Função para verificar colisão da bola com a platforma
export function checkPlatformCollision(platform, ball, ballVelocity, scene) {
  platform.geometry.computeBoundingBox();
  let boundingBox = platform.geometry.boundingBox.clone(); 
  boundingBox.max.multiply(platform.scale);
  boundingBox.min.multiply(platform.scale);

  boundingBox.translate(platform.position);
  let currentSpeed = ballVelocity.length();
  const previousVelocity = ballVelocity.clone();
  
  let bbBall = new THREE.Box3().setFromObject(ball);

  let bbRebatedor = new THREE.Box3().setFromObject(platform);

  if (bbBall.intersectsBox(bbRebatedor)) {
    const currentTime = performance.now();

    // Verifique se o tempo atual é maior que o 'lastCollisionTimePlatform' mais o período de 'collisionCooldownPlatform'.
    if (currentTime < lastCollisionTimePlatform + collisionCooldownPlatform) {
      // Se ainda estamos no período de cooldown, simplesmente retorne e ignore esta colisão.
      return;
    }

    lastCollisionTimePlatform = currentTime;
    
    const collisionPointWorld = new THREE.Vector3().copy(ball.position);

    const bottomMiddlePoint = new THREE.Vector3(
      (bbRebatedor.min.x + bbRebatedor.max.x) / 2,
      bbRebatedor.min.y - 100,
      10
    );

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
    ballVelocity.x = -ballVelocity.x;
  }

  if (wallRightBox.intersectsBox(ballBox)) {
    ballVelocity.x = -ballVelocity.x;
  }

  if (wallTopBox.intersectsBox(ballBox)) {
    ballVelocity.y = -ballVelocity.y;
  }

  if (wallBottomBox.intersectsBox(ballBox)) {
    return true;
  }

  return false;
}
// Variável para armazenar o tempo da última colisão
let lastCollisionTime = 0;
const collisionCooldown = 10; // Tempo de cooldown em milissegundos

export function checkBrickCollision(brick, ball, ballVelocity, count) {
  const currentTime = new Date().getTime();

  // Se não passou tempo suficiente desde a última colisão, retorna
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
