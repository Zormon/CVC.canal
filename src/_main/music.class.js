import {sleep} from '../exports.web.js'

class Music {
    constructor(dir, maxVolume, logger) {
        this.music = {list: [], catalog: []}
        this.dir = dir
        this.maxVolume = maxVolume
        this.current = null
        this.el = new Audio()
        this.el.id = 'music'
        this.el.onended = ()=> { this.next() }
        this.el.oncanplaythrough = ()=> { this.el.play() }
        this.el.onerror = (e)=> { 
            this.logError({origin: 'MUSIC', error: 'CANT_LOAD', message: `No se pudo cargar el archivo ${this.el.src}`})
            this.next()
        }
        this.el.volume = maxVolume
        this.isFading = false
        this.log = logger.std
        this.logError = logger.error
    }

    async updatePlaylist() {
        return fetch(`file://${this.dir}/deploy.json`).then(r => r.json()).then((data) => {
            this.music.catalog = data.catalog.music
            this.music.list = []

            let today = new Date; 
            const timeNow = today.getHours().toString().padStart(2,'0') + ':' + today.getMinutes().toString().padStart(2,'0')
            today.setUTCHours(0,0,0,0)
            today = today.getTime()

            for (let id of data.music) {
                const canc = this.music.catalog[id]
                if (!!!canc) { continue }

                const dateFrom = !!canc.dateFrom? Date.parse( canc.dateFrom ) : 0
                const dateTo = !!canc.dateTo? Date.parse( canc.dateTo ) : 9999999999999
                const timeFrom = canc.timeFrom?? '00:00'
                const timeTo = canc.timeTo?? '99:99'

                if ( dateFrom <= today && dateTo >= today && timeFrom <= timeNow && timeTo >= timeNow) {
                    this.music.list.push(id)
                }
            }
        })
    }

    async next() {
        await this.updatePlaylist()
        if (this.music.list.length > 0) {
            let next = parseInt(localStorage.getItem('nextMusic'))
            if (isNaN(next) || next >= this.music.list.length) { next = 0 }
            
            this.current = this.music.catalog[this.music.list[next]]
            this.el.src = `file://${this.dir}/music/${this.current.file}`
            
            this.log({origin: 'MUSIC', event: 'PLAY', message: ' name: ' + this.current.name})
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