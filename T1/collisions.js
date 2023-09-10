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
    
    // newVelocity.normalize();

    // // Multiplica pela velocidade original para manter a mesma magnitude
    // newVelocity.multiplyScalar(currentSpeed);

    // Atribua a nova velocidade à bola
    ballVelocity.copy(newVelocity);
  }
}


export function checkBordersCollision(wallLeft,wallRight,wallBottom,wallTop,ball,ballVelocity){
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

 


}








// Função para verificar colisão da bola com a platforma
export function checkPlanCollision(leftLimit, rightLimit, ball, ballVelocity) {}
