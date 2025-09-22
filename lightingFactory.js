import * as THREE from 'three';

export function createLighting({
                                   addSun = true,
                                   sunIntensity = 1,
                                   sunColor = 0xffffff,
                                   ambientIntensity = 0.3,
                                   ambientColor = 0xffffff
} = {}) {
    // Ambient light (soft light for shadows and base illumination)
    const ambientLight = new THREE.AmbientLight(ambientColor, ambientIntensity);

    let directionalLight = null;
    if (addSun) {
        // Directional light simulating sunlight
        directionalLight = new THREE.DirectionalLight(sunColor, sunIntensity);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;

        // Optional shadow settings
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
    }

    return {
        ambientLight,
        directionalLight
    };
}