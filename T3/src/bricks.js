import * as THREE from "three";

export default function addBrick(size, position, color) {
  const width = size;
  const height = 0.5 * size;

  const geometry = new THREE.BoxGeometry(1, 1, height * 1);
  const material = new THREE.MeshPhongMaterial({ color: color });
  const brick = new THREE.Mesh(geometry, material);

  brick.position.set(position.x, position.y, position.z);
  brick.scale.set(width, height, 1);
  brick.castShadow = true;

  if (color === "#BCBBBC") brick.hitCount = 1;
  else brick.hitCount = 0;

  return brick;
}

export function handleBrick(brick, count) {
  if (brick.hitCount > 0) {
    new Audio('../assets/sounds/bloco2.mp3').play();
    brick.material.color = new THREE.Color("#888888");
    brick.hitCount--;
  } else {
    // Move o tijolo para fora da cena e o torna invisível
    new Audio('../assets/sounds/bloco1.mp3').play();
    brick.position.set(1000, 1000, 1000);
    brick.visible = false;

    count.score++;
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
    "#FB9737", // laranja   - 4
    "#FC74B4", // rosa      - 5
    "#80D010", // verde     - 6
  ];

  const bricks = [];
  let planeWidth = plan.geometry.parameters.width;
  let planeHeight = plan.geometry.parameters.height;
  let size = 0.038 * planeHeight;
  let startPositionX = -planeWidth / 2 + 0.11 * planeWidth;
  let startPositionY = planeHeight * 0.4;

  if (currentLevel === 1) {
    level1.forEach((row, indexRow) => {
      row.forEach((brick, indexBrick) => {
        if (brick === 1) {
          let position = {
            x: 10 + startPositionX + indexBrick * size,
            y: startPositionY + indexRow * -(0.5 * size),
            z: 10,
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
            x: 42 + startPositionX + indexBrick * size,
            y: startPositionY + indexRow * -(0.5 * size),
            z: 10,
          };

          let color = colors[brick - 1];

          bricks.push(addBrick(size, position, color));
        }
      });
    });
  }

  return bricks;
}
