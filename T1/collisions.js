import * as THREE from "three";

// Função para verificar colisão da bola com a platforma
export function checkPlatformCollision(platform, ball, ballVelocity) {
  const paddleBox = new THREE.Box3().setFromObject(platform);
  const ballBox = new THREE.Box3().setFromObject(ball);

  if (paddleBox.intersectsBox(ballBox)) {
    // Calcule a posição relativa da colisão na platforma (-1 a 1, onde -1 é à esquerda e 1 é à direita)

    const collisionPoint = new THREE.Vector3().copy(ball.position);
    platform.worldToLocal(collisionPoint);
    const collisionX =
      collisionPoint.x / (platform.geometry.parameters.width / 2);

    // Calcule o ângulo de saída com base na posição da colisão
    const maxAngle = Math.PI / 4; // Ângulo máximo de saída
    const angle = maxAngle * collisionX;

    // Mantenha a magnitude (comprimento) da velocidade constante após a colisão
    const currentSpeed = ballVelocity.length();
    const newVelocity = new THREE.Vector3(
      Math.sin(angle) * currentSpeed,
      Math.cos(angle) * Math.abs(currentSpeed), // Garante o eixo Y positivo
      0
    );

    // Atribua a nova velocidade à bola
    ballVelocity.copy(newVelocity);
  }
}

// Função para verificar colisão da bola com a platforma
export function checkPlanCollision(leftLimit, rightLimit, ball, ballVelocity) {}
