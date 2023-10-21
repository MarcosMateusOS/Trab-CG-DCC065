import * as THREE from "three";

export default function addBrick(size, position, color) {
  const width = size;
  const height = 0.5 * size;

  const geometry = new THREE.BoxGeometry(1, 1, height*1);
  const material = new THREE.MeshLambertMaterial({ color: color });
  const brick = new THREE.Mesh(geometry, material);

  brick.position.set(position.x, position.y,position.z);
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

  const colors = ["#800080", "#FF0000", "#AD0FF6", "#FFA500", "#0F40CB", "#006400"];

  const bricks = [];
  let planeWidth = plan.geometry.parameters.width;
  let planeHeight = plan.geometry.parameters.height;
  console.log("teste tamanho:" + planeHeight);
  let size = 0.038 * planeHeight;
  let startPositionX = -planeWidth / 2 + 0.11 * planeWidth;
  let startPositionY = planeHeight*0.4;
  console.log("começo tijolo:" + startPositionY);
  // let spacing = 0.3 * size; // Defina o espaço entre os tijolos aqui

  level.forEach((row, indexRow) => {
    row.forEach((brick, indexBrick) => {
      if (brick === 1) {
        let position = {
          x: startPositionX + indexBrick * (size), // Adicione o espaço aqui
          y: startPositionY + indexRow * -(0.5 * (size)),
          z: 10 // Adicione o espaço aqui
        };
        console.log("começo tijolo:" + startPositionY + indexRow * -(0.5 * (size + 2)));
        let color = colors[indexRow];

        bricks.push(addBrick(size, position, color));
      }
    });
  }
  );

  return bricks;
}
