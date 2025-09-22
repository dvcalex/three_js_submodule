import * as THREE from 'three';

/**
 * Generates a star field.
 * @param {number} amount - Number of stars
 * @param {number} spread - Distance spread of stars
 * @param {number} size - Base size of stars
 * @returns {Object} { points, update } - THREE.Points object and update function
 */
export function genStars(amount = 1000, spread = 1000, size = 1.5) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(amount * 3);
    const colors = new Float32Array(amount * 3);
    const sizes = new Float32Array(amount);

    const palette = [
        0xffffff, 0xfff8d0, 0xa0d0ff, 0xffd0a0
    ];

    for (let i = 0; i < amount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * spread;
        positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
        positions[i * 3 + 2] = (Math.random() - 0.5) * spread;

        const col = new THREE.Color(palette[Math.floor(Math.random() * palette.length)]);
        colors[i * 3] = col.r;
        colors[i * 3 + 1] = col.g;
        colors[i * 3 + 2] = col.b;

        sizes[i] = size + Math.random() * 1.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Create circular star texture
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'white');
    gradient.addColorStop(0.2, 'white');
    gradient.addColorStop(0.4, 'rgba(255,255,255,0.5)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    const starTexture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
        size: size,
        vertexColors: true,
        map: starTexture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const points = new THREE.Points(geometry, material);

    // Update function for trails
    function update(delta) {
        const pos = geometry.attributes.position.array;
        for (let i = 0; i < amount * 3; i += 3) {
            pos[i + 2] += delta; // move stars along z
            if (pos[i + 2] > spread / 2) pos[i + 2] = -spread / 2;
        }
        geometry.attributes.position.needsUpdate = true;
    }

    return { points, update };
}
