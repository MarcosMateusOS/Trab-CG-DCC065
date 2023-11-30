import * as THREE from "three";

const textureLoader = new THREE.TextureLoader();

export default function addBrick(size, position, color, isTextured = false) {
  const width = size;
  const height = 0.5 * size;

  const geometry = new THREE.BoxGeometry(1, 1, height * 1);
  let material;

  if (isTextured) {
    const texture = textureLoader.load("./utils/tijolo.jpg");
    material = new THREE.MeshPhongMaterial({ map: texture });
  } else {
    material = new THREE.MeshPhongMaterial({ color: color });
  }

  const brick = new THREE.Mesh(geometry, material);

  brick.position.set(position.x, position.y, position.z);
  brick.scale.set(width, height, 1);
  brick.castShadow = true;
  brick.isTextured = isTextured;

  if (color === "#BCBBBC") {
    brick.hitCount = 1;
  } else if (color === "#E8B63A") {
    brick.hitCount = 2;
  } else {
    brick.hitCount = 0;
  }

  return brick;
}

export function handleBrick(brick, count) {
  if (brick.hitCount === 1) {
    new Audio("../assets/sounds/bloco2.mp3").play();
    if (brick.isTextured) {
      brick.material = new THREE.MeshPhongMaterial({ color: "#664a49" });
    } else {
      brick.material.color = new THREE.Color("#888888");
    }
    brick.hitCount--;
    count.score++;
  } else {
    new Audio("../assets/sounds/bloco1.mp3").play();

    if (brick.hitCount === 0) {
      console.log(brick.hitCount);
      brick.position.set(1000, 1000, 1000);
      brick.visible = false;
      count.score++;
    }
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

  const level3 = [
    [3, 0, 2, 0, 6, 0, 6, 0, 2, 0, 3],
    [3, 0, 2, 0, 6, 0, 6, 0, 2, 0, 3],
    [3, 0, 2, 0, 6, 0, 6, 0, 2, 0, 3],
    [3, 0, 7, 5, 7, 5, 7, 5, 7, 0, 3],
    [3, 0, 2, 0, 6, 0, 6, 0, 2, 0, 3],
    [3, 0, 2, 0, 6, 0, 6, 0, 2, 0, 3],
    [3, 0, 2, 0, 6, 0, 6, 0, 2, 0, 3],
    [3, 0, 2, 0, 6, 0, 6, 0, 2, 0, 3],
    [3, 0, 2, 0, 6, 0, 6, 0, 2, 0, 3],
    [5, 0, 7, 0, 7, 0, 7, 0, 7, 0, 5],
    [3, 0, 2, 0, 6, 0, 6, 0, 2, 0, 3],
  ];

  const colors = [
    //         // vazio     - 0
    "#BCBBBC", // cinza     - 1
    "#C71E0F", // vermelho  - 2
    "#006FEA", // azul      - 3
    "#FB9737", // laranja   - 4
    "#FC74B4", // rosa      - 5
    "#80D010", // verde     - 6
    "#E8B63A", // dourado   - 7
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
            x: 5 + startPositionX + indexBrick * size,
            y: startPositionY + indexRow * -(0.5 * size),
            z: 10,
          };

          let color = colors[indexRow];
          let isTextured = color === "#BCBBBC";

          bricks.push(addBrick(size, position, color, isTextured));
        }
      });
    });
  } else if (currentLevel === 2 || currentLevel === 3) {
    (currentLevel === 2 ? level2 : level3).forEach((row, indexRow) => {
      row.forEach((brick, indexBrick) => {
        if (brick !== 0) {
          let position = {
            x:
              (currentLevel === 2 ? 26 : 5) +
              startPositionX +
              indexBrick * size,
            y: startPositionY + indexRow * -(0.5 * size),
            z: 10,
          };

          let color = colors[brick - 1];
          let isTextured = color === "#BCBBBC";

          bricks.push(addBrick(size, position, color, isTextured));
        }
      });
    });
  }

  return bricks;
}
