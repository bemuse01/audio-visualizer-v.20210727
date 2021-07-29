import * as THREE from '../../../lib/three.module.js'
import PARAM from './visualizer.child.param.js'
import METHOD from './visualizer.child.method.js'
import SHADER from './visualizer.child.shader.js'

export default class{
    constructor({group, size}){
        this.init(size)
        this.create()
        this.add(group)
    }


    // init
    init(size){
        this.size = size
        this.play = true

        this.param = {
            count: 3,
            display: 100,
            width: 0.95,
            height: 2,
            fps: 60,
            step: 12,
            // smooth: 0.14,
            smooth: 0.1,
            boundary: 0.75,
            opacity: {min: 0.6, max: 0.85},
            color: [130, 220, 360],
            boost: 1.2,
        }

        this.index = Array.from({length: this.param.display}, (e, i) => i)
    }


    // add
    add(group){
        group.add(this.local)
    }

    
    // create
    create(){
        this.local = new THREE.Group()

        for(let i = 0; i < this.param.count; i++){
            const mesh = this.createMesh(i)

            this.local.add(mesh)
        }
    }
    createMesh(idx){
        const geometry = this.createGeometry()
        const material = this.createMaterial(idx)
        return new THREE.Mesh(geometry, material)
    }
    createGeometry(){
        const geometry = new THREE.PlaneGeometry(this.size.obj.w * this.param.width, this.param.height, this.param.display - 1)

        return geometry
    }
    createMaterial(idx){
        return new THREE.ShaderMaterial({
            vertexShader: SHADER.draw.vertex,
            fragmentShader: SHADER.draw.fragment,
            transparent: true,
            uniforms: {
                uColor: {value: new THREE.Color(`hsl(${this.param.color[idx]}, 100%, 70%)`)},
                uMaxDist: {value: this.size.obj.w * this.param.width / 2},
                uBoundary: {value: this.param.boundary},
                uOpacityMin: {value: this.param.opacity.min},
                uOpacityMax: {value: this.param.opacity.max},
                uMaxAudioData: {value: 0},
                uHeight: {value: this.param.height},
                uAvg: {value: 0}
            },
            depthTest: false,
            blending: THREE.AdditiveBlending
        })
    }


    // resize
    resize(size){
        this.size = size

        this.local.children.forEach(mesh => {
            mesh.geometry.dispose()

            mesh.geometry = this.createGeometry()
            mesh.material.uniforms['uMaxDist'].value = this.size.obj.w * this.param.width / 2
        })
    }


    // animate
    animate({audioData, context}){
        if(!context) return

        const {fps, display, step, smooth, height, boost} = this.param

        const startOffset = Math.floor(1 / fps * context.sampleRate)
        const offset = audioData.slice(startOffset)
        const sample = METHOD.createStepAudioBuffer({offset, display, step})

        this.local.children.forEach((mesh, idx) => {
            const buffer = METHOD.createAudioBuffer({sample, smooth, boost, index: this.index, start: idx})
            mesh.material.uniforms['uMaxAudioData'].value = Math.max(...buffer)

            const position = mesh.geometry.attributes.position
            const {array, count} = position

            for(let i = 0; i < 2; i++){
                const dir = i === 0 ? 1 : -1
                for(let j = 0; j < count / 2; j++){
                    const index = (i * (count / 2) + j)
                    array[index * 3 + 1] = (height / 2 + buffer[index % buffer.length]) * dir
                }
            }

            position.needsUpdate = true
        })
    }
}