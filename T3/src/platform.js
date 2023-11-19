import * as THREE from "three";

export default function addPlatform(x, y, w, h, color) {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color });
  const plataform = new THREE.Mesh(geometry, material);
  plataform.position.set(x, y, 0);
  plataform.scale.set(w, h, 1);

  return plataform;
}
