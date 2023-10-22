import * as THREE from "three";

// Função para verificar colisão da bola com a platforma
export function checkPlatformCollision(platform, ball, ballVelocity) {
  // Primeiro, criamos um 'bounding box' para a plataforma. Como a plataforma agora tem uma forma irregular,
  // o 'bounding box' pode não corresponder perfeitamente aos seus limites.
  const platformBox = new THREE.Box3().setFromObject(platform);

  // Em seguida, criamos uma esfera de colisão para a bola.
  const ballSphere = new THREE.Sphere(ball.position, ball.geometry.parameters.radius);

  // Verificamos se o 'bounding box' da plataforma intersecta a esfera da bola.
  if (platformBox.intersectsSphere(ballSphere)) {
    // Se houver interseção, precisamos determinar o comportamento da bola.
    // Por simplicidade, vamos apenas inverter a direção da bola, mas você pode implementar
    // comportamentos mais complexos dependendo das necessidades do seu jogo.

    // Se a bola estiver acima da plataforma, tratamos como uma colisão normal.
    if (ballSphere.center.y > platformBox.max.y) {
      // Calcular a posição relativa da colisão na plataforma.
      const collisionPoint = new THREE.Vector3().copy(ball.position);
      platform.worldToLocal(collisionPoint);

      const relativeCollisionPoint = collisionPoint.x - platformBox.min.x;
      const platformWidth = platformBox.max.x - platformBox.min.x;
      const collisionX = (2 * relativeCollisionPoint - platformWidth) / platformWidth;

      // Calcule o ângulo de saída com base na posição da colisão.
      const maxAngle = Math.PI / 4; // Ângulo máximo de saída.
      const angle = maxAngle * collisionX;

      // Mantenha a magnitude (comprimento) da velocidade constante após a colisão.
      const currentSpeed = ballVelocity.length();
      const newVelocity = new THREE.Vector3(
        Math.sin(angle) * currentSpeed,
        Math.cos(angle) * Math.abs(currentSpeed), // Garante que o eixo Y seja positivo.
        0
      );

      ballVelocity.copy(newVelocity);
    } else {
      // Se a bola não estiver acima, pode ter atingido os lados ou a parte inferior da plataforma.
      // Nesse caso, simplesmente invertemos a direção x da bola.
      ballVelocity.x = -ballVelocity.x;
    }
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
  const ballSphere = new THREE.Sphere(ball.position,ball.geometry.parameters.radius);

  if (brickBox.intersectsSphere(ballSphere)) {
    const ballPos = ballSphere.center;
    let brickMax = brickBox.max;
    let brickMin = brickBox.min;

    // Verificar colisão na parte superior do tijolo
    if (ballPos.y  > brickMax.y) {
      console.log("Colisão na parte de cima do tijolo");
      ballVelocity.y = -ballVelocity.y;
    }
    // Verificar colisão na parte inferior do tijolo
    else if (brickMin.y > ballPos.y) {
      console.log("Colisão na parte de baixo do tijolo");
      ballVelocity.y = -ballVelocity.y;
    }
    // Verificar colisão na parte esquerda do tijolo
    else if (brickMin.x > ballPos.x) {
      console.log("Colisão na parte esquerda do tijolo");
      ballVelocity.x = -ballVelocity.x;
    }
    // Verificar colisão na parte direita do tijolo
    else if (brickMax.x > ballPos.x) {
      console.log("Colisão na parte direita do tijolo");
      ballVelocity.x = -ballVelocity.x;
    } 

    // Mover o tijolo para fora da cena e torná-lo invisível
    brick.position.set(1000, 1000, 1000);
    brick.visible = false;
    
    count.score++;
    console.log("iscore: ", count);
  }
}
