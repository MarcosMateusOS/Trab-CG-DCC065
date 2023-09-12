import addBrick from "./brick.js";

const level = [
  [1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1],
];

export function buildBricks(plan) {
    const colors = ["#00af12", "#efef00", "#df0000"];
  
    const bricks = [];
    let planeWidth = plan.geometry.parameters.width;
    let planeHeight = plan.geometry.parameters.height; 
    let size = 0.15 * planeWidth;
    let startPositionX = -planeWidth/2 + 0.11*planeWidth;
    let startPositionY = planeHeight/2 + -0.05*planeHeight;
    let spacing = 0.3 * size; // Defina o espaço entre os tijolos aqui
  
    level.forEach((row, indexRow) => {
      row.forEach((brick, indexBrick) => {
        if (brick === 1) {
          let position = {
            x: startPositionX + indexBrick * (size + spacing), // Adicione o espaço aqui
            y: startPositionY + indexRow * -(0.5* (size + spacing)),  // Adicione o espaço aqui
          };
  
          let color = colors[indexRow];
  
          bricks.push(addBrick(size, position, color));
        }
      });
    });
  
    return bricks;
  }
  