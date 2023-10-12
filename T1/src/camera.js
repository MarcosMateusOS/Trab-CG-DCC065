import * as THREE from "three";
export default function cameraInit(width, heigth,position) {
  var camera = new THREE.PerspectiveCamera(60, width / (heigth*2) , 0.1, 1200);
  camera.rotation.set(Math.PI / 2, 0, 0)
  camera.position.copy(position);
  camera.lookAt(0, 0, 0);
  return camera;
}
 