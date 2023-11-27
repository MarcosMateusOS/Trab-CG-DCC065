import * as THREE from "three";

export default function planoInit(largura, tamanho, cor) {
  let planGeo = new THREE.PlaneGeometry(largura, tamanho);
  let materialPlan = new THREE.MeshBasicMaterial({
    color: cor,
  });
  let plan = new THREE.Mesh(planGeo, materialPlan);
  plan.position.set(0, 0, 0);

  return { plan, planGeo };
}
