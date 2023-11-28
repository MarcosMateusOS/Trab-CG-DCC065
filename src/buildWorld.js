import * as THREE from "three";

const buildSkyBox = async (scene) => {
  const pathArr = [
    "./utils/skybox/ft.png",
    "./utils/skybox/bk.png",
    "./utils/skybox/up.png",
    "./utils/skybox/dn.png",
    "./utils/skybox/rt.png",
    "./utils/skybox/lf.png",
  ];

  const materialArr = [];
  for (const img of pathArr) {
    const loader = new THREE.CubeTextureLoader();
    let texture = await loader.loadAsync(img);

    // const mesh = new THREE.MeshBasicMaterial({
    //   map: texture,
    //   side: THREE.BackSide,
    // });
    // console.log(img);
    materialArr.push(texture);
  }
  scene.background = materialArr;
  return materialArr;
};

export async function buildWordPlans(scene, width, height) {
  let primaryPlanGeometry = new THREE.PlaneGeometry(height / 2, height);
  let primaryPlanMaterial = new THREE.MeshLambertMaterial({
    color: new THREE.Color(0, 0, 0),
    opacity: 0,
    transparent: true,
  });
  let primaryPlan = new THREE.Mesh(primaryPlanGeometry, primaryPlanMaterial);

  scene.add(primaryPlan);

  let secundaryPlanGeometry = new THREE.PlaneGeometry(
    window.innerWidth * 0.5,
    window.innerHeight * 0.5
  );
  let secundaryPlanMaterial = new THREE.MeshBasicMaterial({ color: "red" });
  let secundaryPlan = new THREE.Mesh(
    secundaryPlanGeometry,
    secundaryPlanMaterial
  );

  //const material = await buildSkyBox(scene);
  // let secundaryPlan = new THREE.Mesh(secundaryPlanGeometry, material);
  // scene.add(secundaryPlan);

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

export async function buildWorldWalls(scene, height, distanciaPlanoPrimarioZ) {
  const textureLoader = new THREE.TextureLoader();
  const texture = await textureLoader.loadAsync("./utils/sun.jpg");

  let wallMaterial = new THREE.MeshPhongMaterial({ map: texture });
  let wallTopBottomGeometry = new THREE.BoxGeometry(
    height / 2 + 10,
    0.0175 * height
  );

  let wallLeftRigthGeometry = new THREE.BoxGeometry(0.0175 * height, height, 2);

  let wallTop = new THREE.Mesh(wallTopBottomGeometry, wallMaterial);
  wallTop.position.y = height / 2;
  wallTop.position.z = distanciaPlanoPrimarioZ;
  wallTop.castShadow = true;

  scene.add(wallTop);
  let wallBottom = new THREE.Mesh(wallTopBottomGeometry, wallMaterial);
  wallBottom.position.y = -height / 2;
  wallBottom.position.z = distanciaPlanoPrimarioZ;
  wallBottom.castShadow = true;
  scene.add(wallBottom);

  //Cria as paredes na esquerda e direita
  let wallRigth = new THREE.Mesh(wallLeftRigthGeometry, wallMaterial);
  wallRigth.position.x = height / 4;
  wallRigth.position.z = distanciaPlanoPrimarioZ;
  wallRigth.castShadow = true;
  scene.add(wallRigth);

  let wallLeft = new THREE.Mesh(wallLeftRigthGeometry, wallMaterial);
  wallLeft.position.x = -height / 4;
  wallLeft.position.z = distanciaPlanoPrimarioZ;
  wallLeft.castShadow = true;
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
