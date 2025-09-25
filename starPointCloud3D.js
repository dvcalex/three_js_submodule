import * as THREE from 'three';

// Define the class
export class StarPointCloud3D {
    #amount;
    #trailLength = 15; // How many trail particles per star
    #nextTrailSlot = 0; // Tracks the next available trail particle to spawn

    constructor(amount, spread, size) {
        this.#amount = amount || 5000;
        this.spread = spread || 2000;
        const baseSize = size || 1.5;

        // Total particles = stars + (stars * trail length)
        const totalParticles = this.#amount * (1 + this.#trailLength);

        const positions = new Float32Array(totalParticles * 3);
        const colors = new Float32Array(totalParticles * 3);
        const sizes = new Float32Array(totalParticles);

        // NEW: Attributes for managing state and fading
        const alphas = new Float32Array(totalParticles);
        const lifespans = new Float32Array(totalParticles); // Lifespan in seconds

        const palette = [
            0xFFFFFF, // Pure White
            0xF0F8FF, // Cool Tint (AliceBlue)
            0xFFF8DC, // Warm Tint (Cornsilk)
            0xF5F5F5  // Neutral Off-White (WhiteSmoke)
        ];

        for (let i = 0; i < totalParticles; i++) {
            // Check if the current particle is a main "star"
            const isStar = i < this.#amount;

            if (isStar) {
                // Initialize stars with random positions
                positions[i * 3] = (Math.random() - 0.5) * this.spread;
                positions[i * 3 + 1] = (Math.random() - 0.5) * this.spread;
                positions[i * 3 + 2] = (Math.random() - 0.5) * this.spread;

                const col = new THREE.Color(palette[Math.floor(Math.random() * palette.length)]);
                colors[i * 3] = col.r;
                colors[i * 3 + 1] = col.g;
                colors[i * 3 + 2] = col.b;

                sizes[i] = baseSize + Math.random() * 1.5;
                alphas[i] = 1.0; // Stars are fully visible
                lifespans[i] = 99999.0; // Stars have a very long life
            } else {
                // Initialize trail particles as "dead" (zero size and lifespan)
                sizes[i] = 0.0;
                alphas[i] = 0.0;
                lifespans[i] = 0.0;
            }
        }

        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        this.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        this.geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
        this.geometry.setAttribute('lifespan', new THREE.BufferAttribute(lifespans, 1));

        // Create a custom shader material to handle per-particle alpha
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                pointTexture: { value: this.#createTexture() },
                fogColor: { value: new THREE.Color() },
                fogNear: { value: 0 },
                fogFar: { value: 1 }
            },
            vertexShader: `
                attribute float size;
                attribute float alpha;
                varying vec3 vColor;
                varying float vAlpha;
                varying float vFogDepth; // <--- ADD THIS
            
                void main() {
                    vColor = color;
                    vAlpha = alpha;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    
                    vFogDepth = -mvPosition.z; // <--- ADD THIS
            
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform sampler2D pointTexture;
                uniform vec3 fogColor;   // <--- ADD THIS
                uniform float fogNear;   // <--- ADD THIS
                uniform float fogFar;    // <--- ADD THIS
            
                varying vec3 vColor;
                varying float vAlpha;
                varying float vFogDepth; // <--- ADD THIS
            
                void main() {
                    gl_FragColor = texture2D(pointTexture, gl_PointCoord);
                    gl_FragColor.rgb *= vColor;
                    gl_FragColor.a *= vAlpha;
            
                    // --- ADD THESE TWO LINES AT THE END ---
                    float fogFactor = smoothstep(fogNear, fogFar, vFogDepth);
                    gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, fogFactor);
                }
            `,
            vertexColors: true,
            transparent: true,
            blending: THREE.NormalBlending,
            depthWrite: false,
            fog: true
        });

        this.points = new THREE.Points(this.geometry, this.material);
    }

    update(delta, speed) {
        const pos = this.geometry.attributes.position.array;
        const sizes = this.geometry.attributes.size.array;
        const alphas = this.geometry.attributes.alpha.array;
        const lifespans = this.geometry.attributes.lifespan.array;

        // Update all particles
        for (let i = 0; i < pos.length / 3; i++) {
            // Decrease lifespan for all active particles
            if (lifespans[i] > 0.0) {
                lifespans[i] -= delta;
            }

            const isStar = i < this.#amount;

            if (isStar) {
                // This is a star, move it
                pos[i * 3 + 2] += delta * speed; // Move stars along z
                if (pos[i * 3 + 2] > this.spread / 2)
                {
                    pos[i * 3 + 2] = -this.spread / 2;
                }

                // --- SPAWN TRAIL ---
                // Every so often, spawn a new trail particle
                if (Math.random() > 0.2) { // Adjust this value to change trail density
                    // Find the next available trail slot to recycle
                    const trailIndex = this.#amount + this.#nextTrailSlot;
                    const colors = this.geometry.attributes.color.array; // Get access to the color buffer

                    // Activate it at the star's current position
                    pos[trailIndex * 3] = pos[i * 3];
                    pos[trailIndex * 3 + 1] = pos[i * 3 + 1];
                    pos[trailIndex * 3 + 2] = pos[i * 3 + 2];

                    colors[trailIndex * 3] = colors[i * 3];       // Copy Red
                    colors[trailIndex * 3 + 1] = colors[i * 3 + 1]; // Copy Green
                    colors[trailIndex * 3 + 2] = colors[i * 3 + 2]; // Copy Blue

                    // Give it an initial state
                    lifespans[trailIndex] = 1.0 + Math.random();
                    sizes[trailIndex] = sizes[i] * 0.8;
                    alphas[trailIndex] = 1.0;

                    // Move to the next slot, wrapping around if necessary
                    this.#nextTrailSlot = (this.#nextTrailSlot + 1) % (this.#amount * this.#trailLength);
                }

            } else {
                // This is a trail particle
                if (lifespans[i] > 0.0) {
                    // Update alpha and size based on remaining life to create the taper
                    alphas[i] = lifespans[i] / 2.0; // Fade over 2 seconds;
                    sizes[i] *= 0.98; // Shrink size over time
                } else {
                    // Deactivate dead particles
                    alphas[i] = 0.0;
                    sizes[i] = 0.0;
                }
            }
        }

        // Tell Three.js to update the buffers on the GPU
        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.size.needsUpdate = true;
        this.geometry.attributes.alpha.needsUpdate = true;
        this.geometry.attributes.lifespan.needsUpdate = true;
        this.geometry.attributes.color.needsUpdate = true;
    }

    // This function remains the same
    #createTexture() {
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