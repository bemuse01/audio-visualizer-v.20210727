import SHADER_METHOD from '../../../method/method.shader.js'

export default {
    draw: {
        vertex: `
            varying vec3 vPosition;
            varying vec2 vUv;

            void main(){
                vPosition = position;
                vUv = uv;

                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragment: `
            uniform vec3 uColor;
            uniform float uMaxDist;
            uniform float uBoundary;
            uniform float uOpacity;
            uniform float uMaxAudioData;

            varying vec3 vPosition;
            varying vec2 vUv;

            ${SHADER_METHOD.executeNormalizing()}

            void main(){
                float dist = 0.0;
                float opacity = executeNormalizing(distance(abs(vPosition.y), 1.0), 0.65, 0.85, 0.0, uMaxAudioData + 10.0);

                if(abs(vPosition.x) > uMaxDist * uBoundary){
                    dist = distance(vPosition.x, uMaxDist * uBoundary * sign(vPosition.x)) / (uMaxDist - uMaxDist * uBoundary);
                }
                
                gl_FragColor = vec4(uColor, (1.0 - dist) * opacity);

                // ver 1.
                // float opacity = executeNormalizing(distance(vUv.y, 0.5), 0.3, 0.5, 0.0, 0.5);

                // ver 2.
                // float opacity = executeNormalizing(distance(abs(vPosition.y), 1.0), 0.3, 0.5, 0.0, uMaxAudioData);
            }
        `
    },
    audio: {
        fragment: `
            uniform sampler2D uBuffer;

            void main(){
                ivec2 coord = ivec2(gl_FragCoord.xy);

                vec4 aud = texelFetch(audio, coord, 0);

                aud.x = float(texelFetch(uBuffer, coord, 0));

                gl_FragColor = aud;
            }
        `
    }
}