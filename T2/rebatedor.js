/*
Return a new CSG solid representing space in either this solid or in the
solid `csg`. Neither this solid nor the solid `csg` are modified.

    A.union(B)

    +-------+            +-------+
    |       |            |       |
    |   A   |            |       |
    |    +--+----+   =   |       +----+
    +----+--+    |       +----+       |
         |   B   |            |       |
         |       |            |       |
         +-------+            +-------+

Return a new CSG solid representing space in this solid but not in the
solid `csg`. Neither this solid nor the solid `csg` are modified.

    A.subtract(B)

    +-------+            +-------+
    |       |            |       |
    |   A   |            |       |
    |    +--+----+   =   |    +--+
    +----+--+    |       +----+
         |   B   |
         |       |
         +-------+

Return a new CSG solid representing space both this solid and in the
solid `csg`. Neither this solid nor the solid `csg` are modified.

    A.intersect(B)

    +-------+
    |       |
    |   A   |
    |    +--+----+   =   +--+
    +----+--+    |       +--+
         |   B   |
         |       |
         +-------+
*/

import * as THREE from  'three';
import Stats from '../build/jsm/libs/stats.module.js';
import GUI from '../libs/util/dat.gui.module.js'
import {TrackballControls} from '../build/jsm/controls/TrackballControls.js';
import {initRenderer,
        initCamera, 
        initDefaultBasicLight,
        createGroundPlane,
        onWindowResize} from "../libs/util/util.js";

import { CSG } from '../libs/other/CSGMesh.js'        

var scene = new THREE.Scene();    // Create main scene
var stats = new Stats();          // To show FPS information

var renderer = initRenderer();    // View function in util/utils
renderer.setClearColor("rgb(30, 30, 40)");
var camera = initCamera(new THREE.Vector3(4, -8, 8)); // Init camera in this position
   camera.up.set( 0, 0, 1 );

window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );
initDefaultBasicLight(scene, true, new THREE.Vector3(12, -15, 20), 28, 1024) ;	

var groundPlane = createGroundPlane(20, 20); // width and height (x, y)
scene.add(groundPlane);

// Show axes (parameter is size of each axis)
var axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

var trackballControls = new TrackballControls( camera, renderer.domElement );

// To be used in the interface
let mesh1, mesh2, mesh3;

buildInterface();
buildObjects();
render();

function buildObjects()
{
   let auxMat = new THREE.Matrix4();
   
   // Base objects
   let cubeMesh = new THREE.Mesh(new THREE.BoxGeometry(2,2, 2));
   let cylinderMesh = new THREE.Mesh( new THREE.CylinderGeometry(0.85, 0.85, 2, 17));
   
   // CSG holders
   let csgObject, cubeCSG, cylinderCSG

   // Object 2 - Cube INTERSECT Cylinder
   cylinderMesh.position.set(1, -0.5, 0.0)
   updateObject(cylinderMesh)
   cylinderCSG = CSG.fromMesh(cylinderMesh)
   cubeCSG = CSG.fromMesh(cubeMesh)   
   csgObject = cubeCSG.intersect(cylinderCSG) // Execute intersection
   mesh2 = CSG.toMesh(csgObject, auxMat)
   mesh2.material = new THREE.MeshPhongMaterial({color: 'lightgreen'})
   mesh2.position.set(3, 0, 1)
   mesh2.rotateY(THREE.MathUtils.degToRad(90));
   mesh2.scale.x = 0.5;
   mesh2.updateMatrix();
   mesh2.position.set(2,0,2)
   updateObject(mesh2);
   scene.add(mesh2)
}

function updateObject(mesh)
{
   mesh.matrixAutoUpdate = false;
   mesh.updateMatrix();
}


function render()
{
  stats.update(); // Update FPS
  trackballControls.update();
  requestAnimationFrame(render); // Show events
  renderer.render(scene, camera) // Render scene
}


function buildInterface()
{
  var controls = new function ()
  {
    this.wire = false;
    
    this.onWireframeMode = function(){
       mesh1.material.wireframe = this.wire;
       mesh2.material.wireframe = this.wire;       
       mesh3.material.wireframe = this.wire;              
    };
  };

  // GUI interface
  var gui = new GUI();
  gui.add(controls, 'wire', false)
    .name("Wireframe")
    .onChange(function(e) { controls.onWireframeMode() });
}
import { ArrowHelper, Vector3, BufferAttribute } from 'three';
function addNormalForcesToTopFace(mesh, numberOfArrows) {
    let geometry = mesh.geometry;
  
    // Certifique-se de que temos normais
    if (!geometry.attributes.normal) {
      geometry.computeVertexNormals();
    }
  
    const positions = geometry.attributes.position.array;
    const normals = geometry.attributes.normal.array;
  
    // Verifique se temos posições e normais suficientes
    if (positions.length > 0 && normals.length > 0) {
      let addedArrows = 0; // Contador para o número de setas adicionadas
      for (let i = 0; i < positions.length / 3; i++) { // Percorrendo todos os vértices
        // Obtenha a posição e a normal
        const vertex = new Vector3(positions[3 * i], positions[3 * i + 1], positions[3 * i + 2]);
        const normal = new Vector3(normals[3 * i], normals[3 * i + 1], normals[3 * i + 2]);
  
        // Verifique se a normal está apontando aproximadamente para cima
        if (normal.z > 0.1) { // Este valor pode precisar de ajustes baseado na sua geometria específica
          // Ajuste a escala e posição da seta
          const arrowDirection = normal.clone().normalize();
          const arrowLength = 1;  // Ajuste conforme necessário
          const arrowColor = 0xff0000;
  
          // Transforme a posição do vértice para coordenadas do mundo, pois a posição do mesh influencia isso
          vertex.applyMatrix4(mesh.matrixWorld);
  
          // Crie e adicione a seta à cena
          const arrowHelper = new ArrowHelper(arrowDirection, vertex, arrowLength, arrowColor);
          scene.add(arrowHelper);
  
          // Incrementa o contador de setas
          addedArrows++;
  
          // Se adicionamos o número desejado de setas, saímos do loop
          if (addedArrows >= numberOfArrows) {
            break;
          }
        }
      }
      if (addedArrows === 0) {
        console.warn("Nenhuma seta foi adicionada. Ajuste os critérios de seleção da normal.");
      }
    } else {
      console.warn("A geometria não possui vértices ou normais suficientes para calcular as forças normais.");
    }
}

// Uso:
addNormalForcesToTopFace(mesh2, 1900);