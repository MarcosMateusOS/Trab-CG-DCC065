import * as THREE from "three";

export function buildWordPlans(scene, width, height) {
  let primaryPlanGeometry = new THREE.PlaneGeometry(height / 2, height);
  let primaryPlanMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  let primaryPlan = new THREE.Mesh(primaryPlanGeometry, primaryPlanMaterial);

  scene.add(primaryPlan);

  let secundaryPlanGeometry = new THREE.PlaneGeometry(width, height);
  let secundaryPlanMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  let secundaryPlan = new THREE.Mesh(
    secundaryPlanGeometry,
    secundaryPlanMaterial
  );
  scene.add(secundaryPlan);

  return {
    primary: {
      primaryPlan,
      primaryPlanGeometry,
    },
    second: {
      secundaryPlan,
      secundaryPlanGeometry,
    },
  };
}

export function buildWorldWalls(scene, height) {
  let wallMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  let wallTopBottomGeometry = new THREE.PlaneGeometry(
    height / 2,
    0.02 * height,
    0
  );

  let wallLeftRigthGeometry = new THREE.PlaneGeometry(0.02 * height, height, 0);

  let wallTop = new THREE.Mesh(wallTopBottomGeometry, wallMaterial);
  wallTop.position.y = height / 2;
  scene.add(wallTop);
  let wallBottom = new THREE.Mesh(wallTopBottomGeometry, wallMaterial);
  wallBottom.position.y = -height / 2;
  scene.add(wallBottom);

  //Cria as paredes na esquerda e direita
  let wallRigth = new THREE.Mesh(wallLeftRigthGeometry, wallMaterial);
  wallRigth.position.x = height / 4;
  scene.add(wallRigth);

  let wallLeft = new THREE.Mesh(wallLeftRigthGeometry, wallMaterial);
  wallLeft.position.x = -height / 4;
  scene.add(wallLeft);

  return {
    walls: {
      wallTop,
      wallBottom,
      wallLeft,
      wallRigth,
    },
    geometry: {
      topBottom: wallTopBottomGeometry,
      leftRigth: wallLeftRigthGeometry,
    },
  };
}
