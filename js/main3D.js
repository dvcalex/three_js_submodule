import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer';

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Sets the color of the background.
renderer.setClearColor(0xFEFEFE);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 1, 8);

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();

// ----------------------------------- RENDER BELOW -----------------------------------

const dLight = new THREE.DirectionalLight(0xffffff, 1);
dLight.position.set(-3, 10, 0);
scene.add(dLight);

const light = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(light);

const sphereGeometry = new THREE.SphereGeometry(1.9, 50, 50);
const sphereMaterial = new THREE.MeshPhongMaterial({ color: 'lime' });
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);
sphere.position.y = -0.5;

// ----------------------------------- RENDER ABOVE -----------------------------------

// CSS2D container
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(labelRenderer.domElement);

// styling
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.pointerEvents = 'none';



function animate()
{
    labelRenderer.render(scene, camera);
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function ()
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    labelRenderer.setSize(window.innerWidth, window.innerHeight);

    renderer.setSize(window.innerWidth, window.innerHeight);
});