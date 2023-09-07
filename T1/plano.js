import * as THREE from "three";

export default function planoInit(largura, tamanho, cor) {
  const planoGeo = new THREE.PlaneGeometry(largura, tamanho);
  let materialPlano = new THREE.MeshBasicMaterial({
    color: cor,
  });
  let plano = new THREE.Mesh(planoGeo, materialPlano);
  plano.position.set(0, 0, 0);

  return plano;
}
