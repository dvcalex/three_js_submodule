import * as THREE from 'three';
import {genStars} from './stars3D';
import * as asteroid3D from './asteroid3D';
import {createLighting} from './lightingFactory.js';

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Sets the color of the background.
renderer.setClearColor(0x060612);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
// z axis points at camera (right-handed coordinate system)
camera.position.set(0, 0, 30);

let mouse = { x: 0, y: 0 };

// Creates an axes helper with an axis length of 4.
const axesHelper = new THREE.AxesHelper(4);
scene.add(axesHelper);

// Add fog
scene.fog = new THREE.Fog(0x000000, 50, 1000);

// Create lights
const { ambientLight, directionalLight } = createLighting({
    addSun: true,
    sunIntensity: 1.2,
    sunColor: 0xfff1e0,
    ambientIntensity: 0.4
});
scene.add(ambientLight);
if (directionalLight)
    scene.add(directionalLight);

// Generate stars
const { points: stars, update: updateStars } = genStars(5000, 1500, 5);
scene.add(stars);

const moveSpeed = 0.5; // units per frame
function animate()
{
    // Handle stars animation
    updateStars(0.5);

    // Handle camera movement based on mouse
    //camera.position.x += (mouse.x * 5 - camera.position.x) * 0.02;
    //camera.position.y += (mouse.y * 5 - camera.position.y) * 0.02;
    //camera.lookAt(0, 0, 0);

    camera.rotation.y += 0.0001;

    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('mousemove', (event) => {
    // Normalize mouse coordinates from -1 to 1
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Optional: log values
    // console.log(mouse.x, mouse.y);
});