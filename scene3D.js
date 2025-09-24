import * as THREE from 'three';
import * as STAR from './starPointCloud3D';
import * as CLOUD from './volumetricCloud';

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
camera.lookAt(0, 0, 0);

let mouse = { x: 0, y: 0 };

// Creates an axes helper with an axis length of 4.
//const axesHelper = new THREE.AxesHelper(4);
//scene.add(axesHelper);

// Create lights
const ambient = new THREE.AmbientLight(0x555555, 0.1);
scene.add(ambient);

// Add fog
//scene.fog = new THREE.FogExp2(0x000000, 0.005);
//renderer.setClearColor(scene.fog.color);

// Generate clouds
let clouds = [];
const cloudsAmount = 3;
for (let i = 0; i < cloudsAmount; i++)
{
    const geometryScale = 4;
    const cloud = new CLOUD.VolumeCloud(geometryScale, 20, 0.13, 0.05, 0.01, 20);
    scene.add(cloud.mesh);
    clouds.push(cloud);
}

// Generate stars
const stars = new STAR.StarPointCloud3D(5000, 700, 3);
scene.add(stars.points);




const tick = 0.5; // units per frame
function animate()
{
    // Handle stars animation
    stars.update(tick);

    for (let i = 0; i < clouds.length; i++)
    {
        clouds[i].update(tick);
    }

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