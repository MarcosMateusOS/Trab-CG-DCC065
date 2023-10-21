import * as THREE from "three";
// export default function cameraInit(tamanho, largura, position) {
//   var camera = new THREE.OrthographicCamera(
//     largura / -2,
//     largura / 2,
//     tamanho / 2,
//     tamanho / -2,
//     0.1,
//     1000
//   );
//   camera.position.copy(position);
//   camera.lookAt(new THREE.Vector3(0, 0, 0));

//   return camera;
// }


export default function cameraInit(tamanho, largura, position) {
  // Parâmetros para a câmera perspectiva.
  var campoDeVisao = 90; // Este é um valor comum para o campo de visão
  var aspecto = largura / tamanho; // O aspecto geralmente é calculado como a largura dividida pela altura
  var planoProximo = 0.1; // Valores comuns para renderização de cena 3D
  var planoDistante = 1000; // Valores comuns para renderização de cena 3D

  // Criação da câmera perspectiva.
  var camera = new THREE.PerspectiveCamera(campoDeVisao, aspecto, planoProximo, planoDistante);

  // Posicionando a câmera
  camera.position.copy(position);

  // Definindo o ponto para onde a câmera deve olhar.
  // camera.lookAt(new THREE.Vector3(2, -4, -5));

  return camera;
}