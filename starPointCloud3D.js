import * as THREE from 'three';

// Define the class
export class StarPointCloud3D
{
    #amount;

    constructor(amount, spread, size)
    {
        this.#amount = amount || 5000;
        this.spread = spread || 2000;
        size = size || 1.5;

        const positions = new Float32Array(this.#amount * 3);
        const colors = new Float32Array(this.#amount * 3);
        const sizes = new Float32Array(this.#amount);

        const palette = [
            0xffffff, 0xfff8d0, 0xa0d0ff, 0xffd0a0
        ];

        // initial positions
        for (let i = 0; i < this.#amount; i++)
        {
            positions[i * 3] = (Math.random() - 0.5) * this.spread;
            positions[i * 3 + 1] = (Math.random() - 0.5) * this.spread;
            positions[i * 3 + 2] = (Math.random() - 0.5) * this.spread;

            const col = new THREE.Color(palette[Math.floor(Math.random() * palette.length)]);
            colors[i * 3] = col.r;
            colors[i * 3 + 1] = col.g;
            colors[i * 3 + 2] = col.b;

            sizes[i] = size + Math.random() * 1.5;
        }

        // create geometry
        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        this.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        // create material
        this.material = new THREE.PointsMaterial({
            size: size,
            vertexColors: true,
            map: this.#createTexture(),
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        // create point cloud object
        this.points = new THREE.Points(this.geometry, this.material);
    }

    update(delta)
    {
        const pos = this.geometry.attributes.position.array;
        for (let i = 0; i < this.#amount * 3; i += 3)
        {
            pos[i + 2] += delta; // move stars along z

            if (pos[i + 2] > this.spread / 2)
            {
                pos[i + 2] = -1 * this.spread / 2;
            }
        }
        this.geometry.attributes.position.needsUpdate = true;
    }

    #createTexture()
    {
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
        return new THREE.CanvasTexture(canvas);
    }
}