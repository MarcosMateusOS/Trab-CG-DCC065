import { checkBrickCollision } from "./collisions.js"; // missing

import * as THREE from "three";

export default function addBrick(size,position,color) {
  const width = size;
  const height = 0.5*size;

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({color: color});
  const brick = new THREE.Mesh(geometry, material);
  
  brick.position.set(position.x, position.y, 0); 
  brick.scale.set(width, height, 1);

  return brick;
} 