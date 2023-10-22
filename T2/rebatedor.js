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
//    mesh2.rotateY(THREE.MathUtils.degToRad(90));
   mesh2.scale.x = 0.5;
   mesh2.updateMatrix();
   mesh2.position.set(2,0,2)
   updateObject(mesh2);
   mesh2.updateMatrix();
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
function addNormalArrowsWithinXRange(mesh) {
    // Verifique se a geometria é do tipo BufferGeometry e tem os atributos necessários
    if (!mesh.geometry.isBufferGeometry || !mesh.geometry.attributes.position || !mesh.geometry.attributes.normal) {
        console.error("A geometria não é do tipo BufferGeometry ou não possui atributos de posição/normal.");
        return;
    }

    const positions = mesh.geometry.attributes.position.array;
    const normals = mesh.geometry.attributes.normal.array;
    const numVertices = positions.length / 3;

    // Parâmetros para o intervalo de 'x' e a aparência das setas
    const lowerBoundX = 0.13;
    const upperBoundX = 0.18;
    const arrowLength = 0.5;  // Ajuste conforme necessário
    const arrowColor = 0xff0000;  // Cor vermelha para a seta

    for (let i = 0; i < numVertices; i++) {
        const x = positions[i * 3];
        const y = positions[i * 3 + 1];
        const z = positions[i * 3 + 2];

        // Se 'x' estiver dentro do intervalo especificado, adicione uma seta de normal
        if (x >= lowerBoundX && x <= upperBoundX) {
            // Obtenha a normal para este vértice
            const normalIndex = i * 3;
            const normalVector = new THREE.Vector3(
                normals[normalIndex],     // componente x da normal
                normals[normalIndex + 1], // componente y da normal
                normals[normalIndex + 2]  // componente z da normal
            );

            // Obtenha a posição deste vértice
            const vertexPosition = new THREE.Vector3(x, y, z);

            // Ajuste a escala e posição da seta
            const arrowDirection = normalVector.clone().normalize();

            // Crie e adicione a seta à cena
            const arrowHelper = new THREE.ArrowHelper(arrowDirection, vertexPosition, arrowLength, arrowColor);
            mesh.add(arrowHelper);
            mesh.rotateY(THREE.MathUtils.degToRad(90));
            mesh.updateMatrix();// Adicionando a seta como um child do mesh garante que ela se mova com o mesh
        }
    }
}

// Uso:
addNormalArrowsWithinXRange(mesh2);