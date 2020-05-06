//Importar libreria de Three.js
import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r110/build/three.module.js';
import { TrackballControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r110/examples/jsm/controls/TrackballControls.js';
import { OrbitControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r110/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r110/examples/jsm/loaders/GLTFLoader.js';
import { DDSLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r110/examples/jsm/loaders/DDSLoader.js';
import { PMREMGenerator } from 'https://threejsfundamentals.org/threejs/resources/threejs/r110/examples/jsm/pmrem/PMREMGenerator.js';
import { PMREMCubeUVPacker } from 'https://threejsfundamentals.org/threejs/resources/threejs/r110/examples/jsm/pmrem/PMREMCubeUVPacker.js';
import { GUI } from 'https://threejsfundamentals.org/threejs/resources/threejs/r110/examples/jsm/libs/dat.gui.module.js';





//Variables
var container, controls;
var camera, scene, renderer;
var hemiLight,directional,ambient,spotLight;
var artifactCanvas = document.getElementById('artifactCanvas');

//Parametros del DEvTools
var params = {
    shadows: true,
    exposure: 0.7,
    hemiIrradiance: 2.1,
    directional: 1,
    ambient:1,
    spotLight: 5,
};


init();
animate();
function init() {

  container = document.createElement('div');
  document.body.appendChild(container);

  //Camara
  camera = new THREE.PerspectiveCamera( 50, innerWidth / innerHeight, 1, 10000 );
  camera.position.set(-230, 200, 400);

  //Escena
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  //Luces

   //==============================================================================================
  //================================LUZ DIRECCIONAL===============================================
 //==============================================================================================

   /* Una luz que se emite en una dirección específica.
      Esta luz se comportará como si estuviera infinitamente lejos y los rayos producidos por ella sean todos paralelos.
      Puede contar con sombras,  DirectionalLightShadow  
      Cara frontal light.position.set(0,0,1);
      Cara frontal y derecha  light.position.set(1,0,1);
      Cara frontal,derecha y arriba  light.position.set(1,1,1); */

    directional = new THREE.DirectionalLight( 0xffffff, 0.4); // Color e intensidad
    directional.position.set(1,1,1);
    scene.add(directional);

   //==============================================================================================
  //==============================LUZ HEMISFERICA=================================================
 //==============================================================================================

   /* Una fuente de luz colocada directamente sobre la escena, con un color que se desvanece 
   del color del cielo al color del suelo.
   Esta luz no se puede usar para proyectar sombras. */

  hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1); //0x0f0e0d
  scene.add(hemiLight);

   //==============================================================================================
  //================================LUZ AMBIENTAL=================================================
 //==============================================================================================

   /*Luz Ambiental => Esta luz ilumina globalmente todos los objetos de la escena por igual.
   Esta luz no se puede usar para proyectar sombras, ya que no tiene una dirección. */

  ambient = new THREE.AmbientLight( 0xffffff ); // soft white light
  scene.add( ambient );

   //==============================================================================================
  //==================================SPOT LIGHT=================================================
 //==============================================================================================

   /*Esta luz se emite desde un único punto en una dirección, a lo largo de un cono que aumenta de tamaño a medida que se aleja de la luz.
   Esta luz puede proyectar sombras,   SpotLightShadow */

  spotLight = new THREE.SpotLight( 0xffffff,5 );
  spotLight.position.set( 0, 200, 100 );
  scene.add( spotLight );





  //Grid
  var grid = new THREE.GridHelper(2000, 20, 0x000000, 0x000000);
  grid.material.opacity = 0.2;
  grid.material.transparent = true;
  scene.add(grid);
  
  //Ambiente Sky
    var cubeMapTexture = new THREE.CubeTextureLoader().setPath('./Test/')
        .load(['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'], function (rgbmCubeMap) {
            rgbmCubeMap.encoding = THREE.RGBM16Encoding;
            rgbmCubeMap.format = THREE.RGBAFormat;
            var pmremGenerator = new PMREMGenerator(rgbmCubeMap);
            pmremGenerator.update(renderer);
            var pmremCubeUVPacker = new PMREMCubeUVPacker(pmremGenerator.cubeLods);
            pmremCubeUVPacker.update(renderer);
            var rgbmCubeRenderTarget = pmremCubeUVPacker.CubeUVRenderTarget;

            rgbmCubeMap.magFilter = THREE.LinearFilter;
            rgbmCubeMap.needsUpdate = true;
            //Ocultar o adicionar a la escena
            scene.background = rgbmCubeMap;
            pmremGenerator.dispose();
            pmremCubeUVPacker.dispose();
        });

  //Exposicion 
    cubeMapTexture.exposure = 1;

    
  //Geometria Cubo

   var cubeGeo = new THREE.BoxGeometry(100,100,100);
   var cubeMaterial = new THREE.MeshStandardMaterial ( { color: 0x1F7695 } );
   var mesh = new THREE.Mesh( cubeGeo, cubeMaterial );
   mesh.position.y = 70;    
   scene.add(mesh);
   
    

  //Utilizar el renderizador WebGL.
    renderer = new THREE.WebGLRenderer({ canvas: artifactCanvas, antialias: true });
  // Renderizador del tamaño de la ventana.
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
  //Añadir el renderizador al elemento DOM body.
    container.appendChild(renderer.domElement);

  //Controles
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 50, 0);
    controls.update();
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.4;
    controls.staticMoving = true;
    controls.update();

  //Intervalos de los parametros DevTools
    var gui = new GUI();
    gui.add(params, 'hemiIrradiance', 1, 5);
    gui.add(params, 'exposure', 0.5, 1);
    gui.add(params, 'directional', 0.5,5);
    gui.add(params, 'ambient', 0,10);
    gui.add(params, 'spotLight', 0,10);
    gui.open();


    window.addEventListener('resize', onWindowResize, false);
    }


  //Evento ventana DevTools
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
        controls.update();

        render();
    }

    function render() {
        renderer.toneMappingExposure = Math.pow(params.exposure, 4.0); // to allow for very bright scenes.
        hemiLight.intensity = params.hemiIrradiance;
        directional.intensity = params.directional;
        ambient.intensity = params.ambient;
        spotLight.intensity = params.spotLight;

        renderer.render(scene, camera);
    }
