function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }

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
        return fetch(`file://${this.dir}/lista.xml`).then(r => r.text()).then(s => new window.DOMParser().parseFromString(s, "text/xml")).then((xml) => {
            let nodes = xml.getElementsByTagName('cancion')
            this.canciones = new Array()
            for (let i=0; i< nodes.length; i++) {
              this.canciones.push({
                  'titulo': nodes[i].getElementsByTagName('titulo')[0].textContent,
                  'archivo': nodes[i].getElementsByTagName('archivo')[0].textContent
              })
            }
        })
      }

    next() {
        if (this.canciones != null) {
          let next = parseInt(localStorage.getItem('nextMusic'))
          if (isNaN(next) || next >= this.canciones.length) { next = 0 }
          this.el.src = `file://${this.dir}/files/${this.canciones[next].archivo}`
          
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