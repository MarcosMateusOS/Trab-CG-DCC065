import * as THREE from "three";

export default function addBrick(position, color) {
  const width = 45;
  const height = 20;

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: color });
  const brick = new THREE.Mesh(geometry, material);
  brick.position.set(position.x, position.y, 0);
  brick.scale.set(width, height, 1);

  return brick;
}

export function buildBricks() {
  const level = [
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
  ];

  const colors = ["#00af27", "#efef00", "#df0000"];

  const bricks = [];

  console.log("level: ", level);

  level.forEach((row, indexRow) => {
    row.forEach((brick, indexBrick) => {
      // console.log("first brick number ", indexBrick, " from row ", indexRow);
      if (brick === 1) {
        console.log("is a 1!");

        let position = {
          x: indexBrick * 57.5 - 115,
          y: indexRow * 25 + 35 + 40,
        };

        // console.log("his position will be: ", position);

        let color = colors[indexRow];

        // console.log("and his color, in hex, is ", color);

        bricks.push(addBrick(position, color));
      }
    });
  });

  return bricks;
}
