import * as React from 'react';
import * as THREE from 'three';

const vertex_shader: string = (`
varying vec2 vUv;
varying vec3 vNormal;
void main() {
    vUv = uv;
    vNormal = normal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`);

const fragment_shader: string = (`
varying vec2 vUv;
varying vec3 vNormal;
uniform bool textureReady;
uniform sampler2D texture1;
uniform float opacity;
void main() {
    if (!textureReady) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, opacity);
    } else if (vUv.x < 0.0 || vUv.x >= 1.0 || vUv.y < 0.0 || vUv.y >= 1.0) {
        gl_FragColor = vec4(1.0, 1.0, 1.0, opacity);
    } else {
        vec4 pix = texture2D(texture1, vUv);
        if (pix.a < 0.1) {
            pix = vec4(1.0, 1.0, 1.0, opacity);
        } else if (vNormal.z < 0.0) {
            float grey = (pix.x + pix.y + pix.z)/3.0;
            pix = vec4(grey, grey, grey, opacity);
        } else {
            pix.a *= opacity;
        }
        gl_FragColor = pix;
    }
}
`);

export default function getMiniShaderMaterial(texture: THREE.Texture | null, opacity: number) {
    return (
        <shaderMaterial
            vertexShader={vertex_shader}
            fragmentShader={fragment_shader}
            transparent={opacity < 1.0}
        >
            <uniforms>
                <uniform type='b' name='textureReady' value={texture !== null} />
                <uniform type='t' name='texture1' value={texture} />
                <uniform type='f' name='opacity' value={opacity}/>
            </uniforms>
        </shaderMaterial>
    );
}