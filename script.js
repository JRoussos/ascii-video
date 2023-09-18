const ascii_chars = "`.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@"
let play = true

const video = document.getElementById('video')
const canvas = document.getElementById('canvas')

const ctx = canvas.getContext('2d')

const canvas_tmp = document.createElement('canvas')
const ctx_tmp = canvas_tmp.getContext('2d')

let FONT_SIZE = 10

const luminanceValue = rgb => {
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2] 
}

const init = () => {    
    document.body.style.height = `${window.innerHeight}px`
    handleResize()

    if ( navigator.mediaDevices.getUserMedia ){
        navigator.mediaDevices.getUserMedia({ video: true })
        .then( stream => {
            video.srcObject = stream
            video.addEventListener('loadedmetadata', render)
        }).catch( error => console.log(error))
    }
}

const range = (value, oldmin, oldmax, newmin, newmax) => {
    return ((value - oldmin) * (newmax - newmin)) / (oldmax - oldmin) + newmin
}

const render = () => {
    if (video.paused || video.ended) return

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx_tmp.drawImage(video, 0, 0, video.height, video.height )

    const frames = ctx_tmp.getImageData(0, 0, video.height, video.height )

    ctx.font = `${FONT_SIZE}px Roboto Mono`
    ctx.fillStyle = "white"
    ctx.textAlign = "center"

    for (let i = 0; i < frames.data.length /4; i++) {

        let r = frames.data[i * 4 + 0]
        let g = frames.data[i * 4 + 1]
        let b = frames.data[i * 4 + 2]

        const light = luminanceValue([r, g, b])
        const index = Math.floor((light * ascii_chars.length) / 255); 

        const video_x = i % video.width
        const video_y = Math.floor(i / video.width)

        const canvas_x = FONT_SIZE/2 + (video_x * canvas.width) / video.width // range(video_x, 0, video.width, 0, canvas.width)   
        const canvas_y = FONT_SIZE + (video_y * canvas.height) / video.height // range(video_y, 0, video.height, 0, canvas.height)         console.log(canvas_x, canvas_y);
        
        ctx.fillText(ascii_chars.charAt(index), canvas_x, canvas_y )
    }

    play && requestAnimationFrame(render)
}

const handlePause = event => {
    if (event.type === "dblclick" || (event.keyCode === 32 && event.code === 'Space')) {
        play = !play
        if( play ) render()
    }
}

const handleResize = () => {
    canvas.width  = document.getElementById('canvas').clientWidth
    canvas.height = document.getElementById('canvas').clientHeight

    FONT_SIZE = range(canvas.width, 300, 800, 10, 15)
}

document.addEventListener("keypress", handlePause)
document.addEventListener("dblclick", handlePause)
window.addEventListener("resize", handleResize)

document.addEventListener("DOMContentLoaded", init)
