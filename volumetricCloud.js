// https://github.com/mrdoob/three.js/blob/master/examples/webgl_volume_cloud.html
import * as THREE from 'three';
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js';
import {vec3} from "three/tsl";

export class VolumeCloud
{
    #zSpreadMultiplier = 4;
    #timeElapsed;
    mesh;
    spread;
    geoScale;

    constructor(geoScale, spread, threshold, opacity, range, steps, noiseScale = 0.05)
    {
        this.#timeElapsed = 0;
        this.spread = spread;
        this.geoScale = geoScale;

        const size = 128;
        const data = new Uint8Array( size * size * size );

        let i = 0;
        const perlin = new ImprovedNoise();
        const vector = new THREE.Vector3();

        for ( let z = 0; z < size; z ++ ) {

            for ( let y = 0; y < size; y ++ ) {

                for ( let x = 0; x < size; x ++ ) {

                    const d = 1.0 - vector.set( x, y, z ).subScalar( size / 2 ).divideScalar( size ).length();
                    data[ i ] = ( 128 + 128 * perlin.noise( x * noiseScale / 1.5, y * noiseScale, z * noiseScale / 1.5 ) ) * d * d;
                    i ++;
                }
            }
        }

        const texture = new THREE.Data3DTexture( data, size, size, size );
        texture.format = THREE.RedFormat;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.unpackAlignment = 1;
        texture.needsUpdate = true;

        const geometry = new THREE.BoxGeometry( 1, 1, 1 );
        const material = new THREE.ShaderMaterial({
            glslVersion: THREE.GLSL3,
            uniforms: {
                base: { value: new THREE.Color(0x798aa0) },
                map: { value: texture },
                cameraPos: { value: new THREE.Vector3() },
                threshold: { value: 0.25 },
                opacity: { value: 0.25 },
                range: { value: 0.1 },
                steps: { value: 100 },
                frame: { value: 0 },
                fogColor: { value: new THREE.Color() },
                fogNear: { value: 0 },
                fogFar: { value: 1 },
            },
            vertexShader,
            fragmentShader,
            side: THREE.BackSide,
            blending: THREE.NormalBlending,
            transparent: true,
            depthWrite: false,
            fog: true
        });

        this.mesh = new THREE.Mesh( geometry, material );

        // update mesh
        material.uniforms.threshold.value = threshold;
        material.uniforms.opacity.value = opacity;
        material.uniforms.range.value = range;
        material.uniforms.steps.value = steps;

        this.mesh.scale.set(this.geoScale, this.geoScale, this.geoScale);

        this.#initPosition();
        this.mesh.position.set(
            this.mesh.position.x,
            this.mesh.position.y,
            (Math.random() - 0.5) * this.spread * this.#zSpreadMultiplier
            );
    }

    update(delta, animSpeed, colorShiftSpeed, cameraPos)
    {
        //     cloud.mesh.position.set(0, 0, -1 * i * geometryScale);
        this.mesh.material.uniforms.cameraPos.value.copy(cameraPos);

        this.mesh.position.z += delta * animSpeed;
        if (this.mesh.position.z > this.spread / 2 + this.geoScale)
        {
            this.#initPosition();
            //this.mesh.position.z = -1 * this.spread * this.#zSpreadMultiplier / 2;
        }
        this.mesh.position.needsUpdate = true;

        // color change
        let rgb = VolumeCloud.hsvToRgb([
            0.02 * this.#timeElapsed % 360,
            1,
            1]);
        this.mesh.material.uniforms.base.value.setRGB(rgb[0], rgb[1], rgb[2]);
        this.mesh.material.uniforms.base.needsUpdate = true;

        this.mesh.material.uniforms.frame.value ++;
        this.#timeElapsed += delta * colorShiftSpeed;
    }

    #initPosition()
    {
        const x = (Math.random() - 0.5) * this.spread;
        const y = (Math.random() - 0.5) * this.spread;
        const z = -1 * this.spread * this.#zSpreadMultiplier / 2;

        this.mesh.position.set( x, y, z );
    }

    static hsvToRgb(hsv)
    {
        // https://cs.stackexchange.com/questions/64549/convert-hsv-to-rgb-colors
        let rgb;
        const HP = hsv[0] / 60;
        const C = hsv[1] * hsv[2];
        const X = C * (1 - Math.abs(HP % 2 - 1));
        const m = hsv[2] - C;

        if (HP < 0 || HP > 6)
            rgb = [0, 0, 0];
        else if (HP < 1)
            rgb = [C, X, 0];
        else if (HP < 2)
            rgb = [X, C, 0];
        else if (HP < 3)
            rgb = [0, C, X];
        else if (HP < 4)
            rgb = [0, X, C];
        else if (HP < 5)
            rgb = [X, 0, C];
        else
            rgb = [C, 0, X];

        rgb[0] += m;
        rgb[1] += m;
        rgb[2] += m;

        return rgb;
    }
}

const vertexShader = /* glsl */`
    // These are now provided automatically by ShaderMaterial, so we remove them:
    // in vec3 position;
    // uniform mat4 modelMatrix;
    // uniform mat4 modelViewMatrix;
    // uniform mat4 projectionMatrix;

    // We KEEP cameraPos because it's a custom uniform
    uniform vec3 cameraPos;

    out vec3 vOrigin;
    out vec3 vDirection;
    out float vFogDepth;

    void main() {
        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

        vOrigin = vec3( inverse( modelMatrix ) * vec4( cameraPos, 1.0 ) ).xyz;
        vDirection = position - vOrigin;

        gl_Position = projectionMatrix * mvPosition;

        vFogDepth = -mvPosition.z;
    }
`;

const fragmentShader = /* glsl */`
					precision highp float;
					precision highp sampler3D;

					uniform mat4 modelViewMatrix;
					uniform mat4 projectionMatrix;

					in vec3 vOrigin;
					in vec3 vDirection;
					in float vFogDepth;

					out vec4 color;

					uniform vec3 base;
					uniform sampler3D map;

					uniform float threshold;
					uniform float range;
					uniform float opacity;
					uniform float steps;
					uniform float frame;
					
					// Three.js will automatically provide these when fog is enabled
					uniform vec3 fogColor;
                    uniform float fogNear;
                    uniform float fogFar;

					uint wang_hash(uint seed)
					{
							seed = (seed ^ 61u) ^ (seed >> 16u);
							seed *= 9u;
							seed = seed ^ (seed >> 4u);
							seed *= 0x27d4eb2du;
							seed = seed ^ (seed >> 15u);
							return seed;
					}

					float randomFloat(inout uint seed)
					{
							return float(wang_hash(seed)) / 4294967296.;
					}

					vec2 hitBox( vec3 orig, vec3 dir ) {
						const vec3 box_min = vec3( - 0.5 );
						const vec3 box_max = vec3( 0.5 );
						vec3 inv_dir = 1.0 / dir;
						vec3 tmin_tmp = ( box_min - orig ) * inv_dir;
						vec3 tmax_tmp = ( box_max - orig ) * inv_dir;
						vec3 tmin = min( tmin_tmp, tmax_tmp );
						vec3 tmax = max( tmin_tmp, tmax_tmp );
						float t0 = max( tmin.x, max( tmin.y, tmin.z ) );
						float t1 = min( tmax.x, min( tmax.y, tmax.z ) );
						return vec2( t0, t1 );
					}

					float sample1( vec3 p ) {
						return texture( map, p ).r;
					}

					float shading( vec3 coord ) {
						float step = 0.01;
						return sample1( coord + vec3( - step ) ) - sample1( coord + vec3( step ) );
					}

					vec4 linearToSRGB( in vec4 value ) {
						return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
					}

					void main(){
						vec3 rayDir = normalize( vDirection );
						vec2 bounds = hitBox( vOrigin, rayDir );

						if ( bounds.x > bounds.y ) discard;

						bounds.x = max( bounds.x, 0.0 );

						vec3 p = vOrigin + bounds.x * rayDir;
						vec3 inc = 1.0 / abs( rayDir );
						float delta = min( inc.x, min( inc.y, inc.z ) );
						delta /= steps;

						// Jitter

						// Nice little seed from
						// https://blog.demofox.org/2020/05/25/casual-shadertoy-path-tracing-1-basic-camera-diffuse-emissive/
						uint seed = uint( gl_FragCoord.x ) * uint( 1973 ) + uint( gl_FragCoord.y ) * uint( 9277 ) + uint( frame ) * uint( 26699 );
						vec3 size = vec3( textureSize( map, 0 ) );
						float randNum = randomFloat( seed ) * 2.0 - 1.0;
						p += rayDir * randNum * ( 1.0 / size );

						//

						vec4 ac = vec4( base, 0.0 );

						for ( float t = bounds.x; t < bounds.y; t += delta ) {

							float d = sample1( p + 0.5 );

							d = smoothstep( threshold - range, threshold + range, d ) * opacity;

							float col = shading( p + 0.5 ) * 3.0 + ( ( p.x + p.y ) * 0.25 ) + 0.2;

							ac.rgb += ( 1.0 - ac.a ) * d * col;

							ac.a += ( 1.0 - ac.a ) * d;

							if ( ac.a >= 0.95 ) break;

							p += rayDir * delta;

						}

						color = linearToSRGB( ac );

						if ( color.a == 0.0 ) discard;
						
						// 1. Calculate the fog factor (0.0 = no fog, 1.0 = full fog)
                        float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );

                        // 2. Mix the final color with the fog color
                        color.rgb = mix( color.rgb, fogColor, fogFactor );
					}
				`;

