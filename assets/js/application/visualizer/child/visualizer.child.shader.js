import PARAM from './visualizer.child.param.js'

export default {
    draw: {
        vertex: `
            varying vec3 vPosition;

            void main(){
                vPosition = position;

                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragment: `
            uniform vec3 uColor;
            uniform float uMaxDist;
            uniform float uBoundary;
            uniform float uOpacity;

            varying vec3 vPosition;

            void main(){
                float dist;

                if(abs(vPosition.x) > uMaxDist * uBoundary){
                    dist = distance(vPosition, vec3(uMaxDist * uBoundary * sign(vPosition.x), vPosition.yz)) / (uMaxDist - uMaxDist * uBoundary);
                }else{
                    dist = 0.0;
                }

                gl_FragColor = vec4(uColor, (1.0 - dist) * uOpacity);
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