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

    // Aplique a velocidade com base no ângulo de saída
    const speed = ballVelocity.length(); // Mantém a velocidade original
    ballVelocity.x = Math.sin(angle) * speed;
    ballVelocity.y = Math.cos(angle) * speed;
  }
}
