const ascii_chars = [ '.', ',', '-', '~', ':', ';', '=', '!', '*', '#', '$', '@' ]
let play = true

const video = document.getElementById('video')
const canvas = document.getElementById('canvas')

canvas.width = document.getElementById('canvas').clientWidth
canvas.height = document.getElementById('canvas').clientHeight

const ctx = canvas.getContext('2d')

const canvas_tmp = document.createElement('canvas')
const ctx_tmp = canvas_tmp.getContext('2d')

const VIDEO_WIDTH = 48
const VIDEO_HEIGHT = 48

const range = (value, oldmin, oldmax, newmin, newmax) => {
    return ((value - oldmin) * (newmax - newmin)) / (oldmax - oldmin) + newmin
}

const rgb2lab = (rgb) => {
    let r = rgb[0] / 255,
        g = rgb[1] / 255,
        b = rgb[2] / 255,
        x, y, z
  
    r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92
    g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92
    b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92
  
    x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047
    y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000
    z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883
  
    x = (x > 0.008856) ? Math.pow(x, 1/3) : (7.787 * x) + 16/116
    y = (y > 0.008856) ? Math.pow(y, 1/3) : (7.787 * y) + 16/116
    z = (z > 0.008856) ? Math.pow(z, 1/3) : (7.787 * z) + 16/116
  
    return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
}

const init = () => {    
    document.body.style.height = `${window.innerHeight}px`

    if ( navigator.mediaDevices.getUserMedia ){
        navigator.mediaDevices.getUserMedia({ video: true })
        .then( stream => {
            video.srcObject = stream
            video.addEventListener('loadedmetadata', render)
        }).catch( error => console.log(error))
    }
}

const render = () => {
    if (video.paused || video.ended) return

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx_tmp.drawImage(video, 0, 0, video.height, video.height )
    const frames = ctx_tmp.getImageData(0, 0, video.height, video.height )

    for (let i = 0; i < frames.data.length /4; i++) {

        let r = frames.data[i * 4 + 0]
        let g = frames.data[i * 4 + 1]
        let b = frames.data[i * 4 + 2]

        const light = rgb2lab([r, g, b])[0]
        const index = range(light, 0, 100, 0, 11).toFixed(0) // Math.trunc(light / ascii_chars.length)

        const video_x = i % video.width
        const video_y = Math.floor(i / video.width)

        const canvas_x = range(video_x, 0, video.width, 0, canvas.width)   + 3
        const canvas_y = range(video_y, 0, video.height, 0, canvas.height) + 3
        
        ctx.font = "12px monospace"
        ctx.fillStyle = "white"
        ctx.textAlign = "center"
        ctx.fillText(ascii_chars[index], canvas_x, canvas_y )
    }

    play && setTimeout(render, 50)
    // play && requestAnimationFrame(render)
}

const handlePause = event => {
    if (event.keyCode === 32 && event.code === 'Space') play = !play
    if( play ) render()
}

document.addEventListener("keypress", handlePause)
document.addEventListener("DOMContentLoaded", init)
