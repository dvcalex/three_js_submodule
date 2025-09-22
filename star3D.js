import * as THREE from 'three';

export function genStars(amount, spread, )
{
    // star field using shader material
    const starGeometry = new THREE.BufferGeometry();
    const starCount = amount;
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i++)
    {
        positions[i] = (Math.random() - 0.5) * spread; // spread stars far
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 1.5 });
    return {
        geometry: starGeometry,
        points: (new THREE.Points(starGeometry, starMaterial))
    };
}
