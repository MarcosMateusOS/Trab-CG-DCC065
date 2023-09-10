import addBrick from "./brick.js";

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

  //   console.log("bricks: ", bricks);

  return bricks;
}
