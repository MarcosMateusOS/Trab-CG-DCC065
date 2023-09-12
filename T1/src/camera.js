import * as THREE from "three";
export default function cameraInit(tamanho, largura, position) {
  var camera = new THREE.OrthographicCamera(
    largura / -2,
    largura / 2,
    tamanho / 2,
    tamanho / -2,
    0.1,
    1000
  );
  camera.position.copy(position);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  return camera;
}
