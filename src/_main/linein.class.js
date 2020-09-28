function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }

//navigator.MediaDevices.enumerateDevices()

class LineIn {
    constructor(maxVolume) {
        this.canciones = null
        this.maxVolume = maxVolume
        this.el = document.createElement('audio')
        this.el.id = 'music'
        this.el.volume = maxVolume
        this.isFading = false
        document.body.appendChild(this.el)
    }

    play() {
        this.el.srcObject = undefined
        navigator.mediaDevices.getUserMedia({ audio: {
            autoGainControl: false,
            noiseSuppression: false,
            HighpassFilter: false
        }})
        .then( (stream)=> {
            this.el.srcObject = stream
            this.el.play()
        }).catch(function() { console.warn('No se encontro entrada de audio') })
    }

    async fadeIn() {
        if (!this.isFading) {
            this.isFading = true
            while (this.el.volume < this.maxVolume) {
                let vol = this.el.volume + .1
                this.el.volume = vol>this.maxVolume ? this.maxVolume : vol //Para evitar la inexactitud de los float
                await sleep(100)
            }
            this.isFading = false
        }
    }

    async fadeOut() {
        if (!this.isFading) {
            this.isFading = true
            while (this.el.volume > 0) {
                let vol = this.el.volume - .1
                this.el.volume = vol>0 ? vol : 0 
                await sleep(100)
            }
            this.isFading = false
        }
    }
  }