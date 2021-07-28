import PUBLIC_METHOD from '../../../method/method.js'
import Spline from '../../../lib/cubic-spline.js'

export default {
    setPosition({}){

    },
    createStepAudioBuffer({offset, display, step}){
        const temp = []

        for(let i = 0; i < display; i++){
            temp.push(offset[i * step])
        }

        return temp
    },
    createAudioBuffer({sample, index, smooth, start}){
        const len = sample.length 
        let temp = []

        const xs = index
        const ys = sample
        ys[~~(len * start * smooth)] = 0
        ys[~~(len * start * smooth) + 1] = 0
        // ys[~~(len * start * smooth) + 2] = 0
        // ys[~~((len * start + len - 1) * smooth) - 1] = 0
        ys[~~((len * start + len - 1) * smooth)] = 0
        ys[~~((len * start + len - 1) * smooth) + 1] = 0
        const spline = new Spline(xs, ys)
        
        for(let i = len * start; i < len * start + len; i++){
            temp.push(spline.at(i * smooth))
        }

        const avg = temp.reduce((x, y) => x + y) / len
        temp = temp.map(e => Math.max(0, e - avg))
        // temp = temp.map(e => PUBLIC_METHOD.normalize(Math.max(1, e - avg), 1, 255, 0, 255))

        return temp
    }
}