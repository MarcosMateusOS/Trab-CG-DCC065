import * as THREE from "three";

import { initRenderer } from "../../libs/util/util.js";

function addBrick(size, position, color) {
    const width = size;
    const height = 0.5 * size;
  
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: color });
    const brick = new THREE.Mesh(geometry, material);
  
    brick.position.set(position.x, position.y, 0);
    brick.scale.set(width, height, 1);
  
    return brick;
  }

let scene, renderer, camera;
scene = new THREE.Scene();
scene.background = new THREE.Color("black"); //0xf0f0f0);
renderer = initRenderer();
camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const level1 = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];

const colors = ["#bcbcbc", "#db2c04", "#0070ec", "#fc9838", "#fc74b4", "#80d010"];

const bricks = [];
let planeWidth = 3;
let planeHeight = 1.5;
let size = 0.15 * planeWidth;
let startPositionX = -planeWidth / 2 + 0.11 * planeWidth;
let startPositionY = planeHeight / 2 + -0.05 * planeHeight;
let spacing = 0.3 * size; // Defina o espaço entre os tijolos aqui

// const geometry = new THREE.BoxGeometry( 1, 1, 1 );
// const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
// const cube = new THREE.Mesh( geometry, material );
// scene.add( cube );

level1.forEach((row, indexRow) => {
    row.forEach((brick, indexBrick) => {
      if (brick === 1) {
        let position = {
          x: startPositionX + indexBrick * (size + spacing), // Adicione o espaço aqui
          y: startPositionY + indexRow * -(0.5 * (size + spacing)), // Adicione o espaço aqui
        };

        let color = colors[indexRow];

        bricks.push(addBrick(size, position, color));
      }
    });
  });

  bricks.forEach((brick) => {
    scene.add(brick);
  });

camera.position.z = 5;

function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
animate();

// #bcbcbc    cinza
// #db2c04    vermelho
// #0070ec    azul
// #fc9838    dourado
// #fc74b4    rosa
// #80d010    verde

console.log("olalala olalala");