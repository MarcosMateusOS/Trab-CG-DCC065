import * as THREE from "three";

export default function cameraInit(tamanho, largura, position) {
  // Parâmetros para a câmera perspectiva.
  var campoDeVisao = 90;
  var aspecto = largura / tamanho;
  var planoProximo = 0.1;
  var planoDistante = 1000;

  // Criação da câmera perspectiva.
  var camera = new THREE.PerspectiveCamera(
    campoDeVisao,
    aspecto,
    planoProximo,
    planoDistante
  );

  // Posicionando a câmera
  camera.position.copy(position);

  return camera;
}
