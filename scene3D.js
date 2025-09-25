import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import * as STAR from './starPointCloud3D';
import * as CLOUD from './volumetricCloud';

const renderer = new THREE.WebGLRenderer({antialias: true});
//renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
renderer.domElement.id = 'three-canvas-background';
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const origin = new THREE.Vector3(0, 0, 150);

// z axis points at camera (right-handed coordinate system)
camera.position.set(origin.x, origin.y, origin.z);
camera.lookAt(0, 0, 0);

// Sets orbit control to move the camera around.
//const orbit = new OrbitControls(camera, renderer.domElement);
//orbit.target.set(origin.x, origin.y, origin.z);
//camera.position.add(new THREE.Vector3(0, 0, 10));
//orbit.update(); // Has to be done everytime we update the camera position.


//let mouse = { x: 0, y: 0 };

// Creates an axes helper with an axis length of 4.
//const axesHelper = new THREE.AxesHelper(4);
//axesHelper.position.set(origin.x, origin.y, origin.z);
//scene.add(axesHelper);

// Create lights
const ambient = new THREE.AmbientLight(0x555555, 0.1);
scene.add(ambient);

// Add fog
scene.fog = new THREE.Fog(0x000000, 0.1, 400);
scene.background = new THREE.Color(scene.fog.color); // Sets background to fog color

// Generate clouds
let clouds = [];
const cloudsAmount = 5;
for (let i = 0; i < cloudsAmount; i++)
{
    const cloud = new CLOUD.VolumeCloud(
        150,
        200,
        0.45,
        0.45,
        0.33,
        20);
    scene.add(cloud.mesh);
    clouds.push(cloud);
}

// padding for camera
const spreadPadding = 50;
// Generate stars
const stars = new STAR.StarPointCloud3D(
    1000,
    2 * (origin.z + spreadPadding),
    3);
scene.add(stars.points);


const clock = new THREE.Clock();
const animSpeed = 25;
const cloudColorShiftSpeed = 4;
function animate()
{
    const delta = Math.min(clock.getDelta(), 1 / 30);

    // Handle stars animation
    stars.update(
        delta,
        animSpeed,
        camera.position
    );

    for (let i = 0; i < clouds.length; i++)
    {
        clouds[i].update(
            delta,
            animSpeed,
            cloudColorShiftSpeed,
            camera.position
        );
    }

    renderer.render(scene, camera);
}

window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// window.addEventListener('mousemove', (event) => {
//     // Normalize mouse coordinates from -1 to 1
//     mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//     mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
// });