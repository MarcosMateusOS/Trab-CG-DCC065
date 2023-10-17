import * as THREE from "three";

export default function addBrick(size, position, color) {
  const width = size;
  const height = 0.5 * size;

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: color });
  const brick = new THREE.Mesh(geometry, material);

  brick.position.set(position.x, position.y,30);
  brick.scale.set(width, height, 1);
  brick.castShadow = true;
  return brick;
}
export function buildBricks(plan) {
  const level = [
    [1, 1, 1, 1, 1,1,1,1,1,1,1],
    [1, 1, 1, 1, 1,1,1,1,1,1,1],
    [1, 1, 1, 1, 1,1,1,1,1,1,1],
    [1, 1, 1, 1, 1,1,1,1,1,1,1],
    [1, 1, 1, 1, 1,1,1,1,1,1,1],
    [1, 1, 1, 1, 1,1,1,1,1,1,1],
  ];

  const colors = ["#800080", "#FF0000", "#ADD8E6", "#FFA500", "#FFC0CB", "#006400"];

  const bricks = [];
  let planeWidth = plan.geometry.parameters.width;
  let planeHeight = plan.geometry.parameters.height;
  let size = 20;
  let startPositionX = -planeWidth / 2 + 0.11 * planeWidth;
  let startPositionY = 270;
  // let spacing = 0.3 * size; // Defina o espaço entre os tijolos aqui

  level.forEach((row, indexRow) => {
    row.forEach((brick, indexBrick) => {
      if (brick === 1) {
        let position = {
          x: startPositionX + indexBrick * (size + 5), // Adicione o espaço aqui
          y: startPositionY + indexRow * -(0.5 * (size + 5)),
          z: 30 // Adicione o espaço aqui
        };

        let color = colors[indexRow];

        bricks.push(addBrick(size, position, color));
      }
    });
  });

  return bricks;
}
