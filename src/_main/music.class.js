import {sleep} from '../exports.web.js'

class Music {
    constructor(dir, maxVolume, logger) {
        this.canciones = null
        this.dir = dir
        this.maxVolume = maxVolume
        this.el = document.createElement('audio')
        this.el.id = 'music'
        this.el.onended = ()=> { this.next() }
        this.el.oncanplaythrough = ()=> { this.el.play() }
        this.el.volume = maxVolume
        this.isFading = false
        this.log = logger.std
        this.logError = logger.error

        document.body.appendChild(this.el)
    }

    async updatePlaylist() {
        return fetch(`file://${this.dir}/list.json`).then(r => r.json()).then((data) => {
            this.canciones = new Array()

            data.canciones.forEach(canc => {
                this.canciones.push({
                    'titulo': canc.titulo,
                    'fichero': canc.fichero
                })  
            })
        })
    }

    next() {
        if (this.canciones != null) {
          let next = parseInt(localStorage.getItem('nextMusic'))
          if (isNaN(next) || next >= this.canciones.length) { next = 0 }
          this.el.src = `file://${this.dir}/files/${this.canciones[next].fichero}`
          
          this.log({origin: 'MUSIC', event: 'PLAY', message:  this.canciones[next].titulo})
          localStorage.setItem('nextMusic', ++next)
        }
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

  export default Music