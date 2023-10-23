import * as THREE from "three";

export default function addBrick(size, position, color) {
  const width = size;
  const height = 0.5 * size;

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshPhongMaterial({ color: color });
  const brick = new THREE.Mesh(geometry, material);

  brick.position.set(position.x, position.y, 30);
  brick.scale.set(width, height, 1);
  brick.castShadow = true;

  if (color === "#BCBBBC") brick.hitCount = 1;
  else brick.hitCount = 0;

  return brick;
}

export function handleBrick(brick, count) {
  console.log("handleBrick ativado. ", brick.hitCount);

  if (brick.hitCount > 0) {
    console.log("esse aq hita mttt: ", brick.hitCount);
    brick.material.color = new THREE.Color("#888888");
    brick.hitCount--;
  } else {
    console.log("esse aq hita nddd: ", brick.hitCount);
    // Mover o tijolo para fora da cena e torná-lo invisível
    brick.position.set(1000, 1000, 1000);
    brick.visible = false;

    count.score++;
    console.log("iscore: ", count);
  }
}

export function buildBricks(plan, currentLevel) {
  const level1 = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];

  const level2 = [
    [1, 4, 6, 5, 0, 4, 6, 3, 1],
    [3, 6, 4, 2, 0, 6, 4, 1, 3],
    [6, 5, 2, 4, 0, 3, 1, 4, 6],
    [4, 2, 5, 6, 0, 1, 3, 6, 4],
    [2, 4, 6, 3, 0, 4, 6, 5, 2],
    [5, 6, 4, 1, 0, 6, 4, 2, 5],
    [6, 3, 1, 4, 0, 5, 2, 4, 6],
    [4, 1, 3, 6, 0, 2, 5, 6, 4],
    [1, 4, 6, 5, 0, 4, 6, 3, 1],
    [3, 6, 4, 2, 0, 6, 4, 1, 3],
    [6, 5, 2, 4, 0, 3, 1, 4, 6],
    [4, 2, 5, 6, 0, 1, 3, 6, 4],
    [2, 4, 6, 3, 0, 4, 6, 5, 2],
    [5, 6, 4, 1, 0, 6, 4, 2, 5],
  ];

  const colors = [
    //         // vazio     - 0
    "#BCBBBC", // cinza     - 1
    "#C71E0F", // vermelho  - 2
    "#006FEA", // azul      - 3
    "#Fb9737", // laranja   - 4
    "#FC74B4", // rosa      - 5
    "#80D010", // verde     - 6
  ];

  const bricks = [];
  let planeWidth = plan.geometry.parameters.width;
  let planeHeight = plan.geometry.parameters.height;
  let size = 20;
  let startPositionX = -planeWidth / 2 + 0.11 * planeWidth;
  let startPositionY = 270;
  // let spacing = 0.3 * size; // Defina o espaço entre os tijolos aqui

  if (currentLevel === 1) {
    level1.forEach((row, indexRow) => {
      row.forEach((brick, indexBrick) => {
        if (brick === 1) {
          let position = {
            x: startPositionX + indexBrick * (size + 5), // Adicione o espaço aqui
            y: startPositionY + indexRow * -(0.5 * (size + 5)),
            z: 30, // Adicione o espaço aqui
          };

          let color = colors[indexRow];

          bricks.push(addBrick(size, position, color));
        }
      });
    });
  } else if (currentLevel === 2) {
    level2.forEach((row, indexRow) => {
      row.forEach((brick, indexBrick) => {
        if (brick !== 0) {
          let position = {
            x: 25 + startPositionX + indexBrick * (size + 5),
            y: startPositionY + indexRow * -(0.5 * (size + 5)),
            z: 30,
          };

          let color = colors[brick - 1];

          bricks.push(addBrick(size, position, color));
        }
      });
    });
  }

  return bricks;
}
