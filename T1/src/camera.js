import * as THREE from "three";
export default function cameraInit(width, heigth,position) {
  var camera = new THREE.PerspectiveCamera(45, width / heigth * 2 , 0.1, 1000);

  camera.position.copy(position);
  camera.lookAt(0, 0, 0);
  return camera;
}
 