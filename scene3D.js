import * as THREE from 'three';
import * as star3D from './star3D';
import * as asteroid3D from './asteroid3D';

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

// Creates an axes helper with an axis length of 4.
const axesHelper = new THREE.AxesHelper(4);
scene.add(axesHelper);

const starCount = 5000
const stars = star3D.genStars(starCount, 2000)
scene.add(stars.points);

const speed = 1; // units per frame

function animate()
{
    const positions = stars.geometry.attributes.position.array;
    for (let i = 0; i < starCount * 3; i += 3)
    {
        const z = i + 2;
        // if z pos is 10 units behind camera
        if (camera.position.z - positions[z] < 10)
        {
            positions[z] -= 2000; // wrap the star far back
        }
        positions[z] += speed
    }
    stars.geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});