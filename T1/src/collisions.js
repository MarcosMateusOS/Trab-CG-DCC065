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
    // var collisionY = collisionPoint.y
    // console.log(collisionY)
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

    ballVelocity.copy(newVelocity);
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

// Função para verificar colisão da bola com os tijolos
export function checkBrickCollision(brick, ball, ballVelocity, count) {
  const brickBox = new THREE.Box3().setFromObject(brick);
  const ballBox = new THREE.Box3().setFromObject(ball);

  if (brickBox.intersectsBox(ballBox)) {
    const brickMin = brickBox.min;
    const brickMax = brickBox.max;
    const ballMin = ballBox.min;
    const ballMax = ballBox.max;

    const topCollision = Math.abs(brickMax.y - ballMin.y) < 3;
    const bottomCollision = Math.abs(brickMin.y - ballMax.y) < 3;
    const leftCollision = Math.abs(brickMin.x - ballMax.x) < 3;
    const rightCollision = Math.abs(brickMax.x - ballMin.x) < 3;

    if (topCollision) {
      console.log("Colisão na parte de cima do tijolo");
      ballVelocity.y = -ballVelocity.y;
    } else if (bottomCollision) {
      console.log("Colisão na parte de baixo do tijolo");
      // Atualize a velocidade da bola conforme necessário
      ballVelocity.y = -ballVelocity.y;
    } else if (leftCollision) {
      console.log("Colisão na parte esquerda do tijolo");
      // Atualize a velocidade da bola conforme necessário
      ballVelocity.x = -ballVelocity.x;
    } else if (rightCollision) {
      // Corrigido para 'else if'
      console.log("Colisão na parte direita do tijolo");
      // Atualize a velocidade da bola conforme necessário
      ballVelocity.x = -ballVelocity.x;
    }

    brick.position.set(1000, 1000, 1000);

    brick.visible = false;

    count.score++;
    console.log("iscore: ", count);
  }
}
