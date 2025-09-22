import * as THREE from 'three';
import {genStars} from './stars3D';
import {genCloud} from "./cloud3D";

const renderer = new THREE.WebGLRenderer({antialias: true});
//renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
// z axis points at camera (right-handed coordinate system)
camera.position.set(0, 0, 1);

let mouse = { x: 0, y: 0 };

// Creates an axes helper with an axis length of 4.
const axesHelper = new THREE.AxesHelper(4);
scene.add(axesHelper);

// Create lights
const ambient = new THREE.AmbientLight(0x555555, 0.1);
scene.add(ambient);

// Add fog
scene.fog = new THREE.FogExp2(0x000000, 0.001);
renderer.setClearColor(scene.fog.color);

// Generate stars
const { points: stars, update: updateStars } = genStars(5000, 1500, 5);
scene.add(stars);

// Generate cloud
let clouds = [];
const cloudsAmount = 3;
for (let i = 0; i < cloudsAmount; i++)
{
    const geometryScale = 4;
    const cloudMesh = genCloud(geometryScale, 0.13, 0.05, 0.01, 20)
    scene.add(cloudMesh);
    cloudMesh.position.set(0, 0, -1 * i * geometryScale);
    clouds.push(cloudMesh);
}

const moveSpeed = 0.5; // units per frame
function animate()
{
    // Handle stars animation
    updateStars(0.5);



    // Handle camera movement based on mouse
    camera.position.x += (mouse.x * 5 - camera.position.x) * 0.02;
    camera.position.y += (mouse.y * 5 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
}

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