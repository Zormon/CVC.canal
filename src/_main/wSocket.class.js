function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }
function $$(id)     { return document.querySelector(id)     }
function isFunction(f) {return f && {}.toString.call(f)==='[object Function]'}

class wSocket {
    constructor(ip, port, pan, ui, ipcR, ting) {
        this.ip = ip
        this.port = port
        this.ui = ui
        this.ipc = ipcR
        this.ting = ting
        this.pan = pan
        this.onpan = null
    }

    init() {
        this.ws =  new WebSocket(`ws://${this.ip}:${this.port}`)
        var _this = this
        _this.check()

        this.ws.onmessage = (message) => {
            let msg = JSON.parse(message.data)
            switch (msg.accion) {
                case 'spread':
                    if (this.ui.type != 0) { this.spread(msg.colas, msg.turnos) }
                    this.ipc.send('log', {origin: 'TURNOMATIC', event: 'SPREAD', message: `Colas: ${JSON.stringify(msg.colas)}, Turnos: ${JSON.stringify(msg.turnos)}, Tickets: ${JSON.stringify(msg.tickets)}`})
                break
                case 'update':
                    if (this.ui.type != 0) { this.update(msg.cola, msg.numero) }
                    this.ipc.send('log', {origin: 'TURNOMATIC', event: 'UPDATE', message: `Cola: ${msg.cola}, Numero: ${msg.numero}`})
                break
                case 'pan':
                    if ( isFunction(this.onpan) ) { this.onpan() }
                    this.ipc.send('log', {origin: 'TURNOMATIC', event: 'PAN', message: `Aviso del pan`})
                break
                default:
                    modalBox('socketError', false)
                    _this.check()
                break
            }
        }
    }
	
	close() {
        this.ws.close()
    }

    spread(colas, turnos) {
        // Crea los divs con las colas
        let divColas, cola, num, nombre
        divColas = $('colas')
        while (divColas.firstChild) { divColas.removeChild(divColas.firstChild) }
        for (let i=0; i < colas.length; i++) {
            if ( this.ui.exColas.indexOf(i+1) == -1 ) { 
                cola = document.createElement('div'); cola.id =  `cola${i}`; cola.style = `background:${colas[i].color}; color:${colas[i].color};`
                num = document.createElement('span'); num.className = 'num'; num.textContent = turnos[i].num
                nombre = document.createElement('span'); nombre.className = 'nombre'; nombre.textContent = colas[i].nombre; nombre.style = `border-color:${colas[i].color}`
            
                cola.appendChild(num); cola.appendChild(nombre)
                $('colas').appendChild(cola)
            }
        }

        if (this.ui.type == 3) {
            const n = this.ui.colaDestacada - 1
            divColas = $('colaDestacada')
            while (divColas.firstChild) { divColas.removeChild(divColas.firstChild) }

            if (typeof colas[n] !== 'undefined' && this.ui.exColas.indexOf(n+1) == -1) {
                try { $(`cola${n}`).remove() }catch(e){}
                cola = document.createElement('div'); cola.id =  `cola${n}`; cola.style = `background:${colas[n].color}; color:${colas[n].color};`
                num = document.createElement('span'); num.className = 'num'; num.textContent = turnos[n].num
                nombre = document.createElement('span'); nombre.className = 'nombre'; nombre.textContent = colas[n].nombre; nombre.style = `border-color:${colas[n].color}`
            
                cola.appendChild(num); cola.appendChild(nombre)
                divColas.appendChild(cola)
            }
        }
    }

    update(cola, num) {
        if (document.contains($$(`#cola${cola}`))) {
            if (this.ting) { this.ting.pause(); this.ting.play() }
            $$(`#cola${cola} > .num`).textContent = num.toString()
            $$(`#cola${cola} > .num`).classList.remove('effect')
            $$(`#cola${cola} > .num`).offsetHeight // Reflow
            $$(`#cola${cola} > .num`).classList.add('effect')
        }
    }

    check() {
        clearTimeout(document.wsTimeout)
      
        var _this = this
        document.wsTimeout = setTimeout( ()=> {
			_this.close()
            _this.init()
            _this.check()

            modalBox('socketError', 'error', 'ERROR DE CONEXIÓN', `Conectando a ${remote.getGlobal('appConf').server.ip}`)
            this.ipc.send('logError', {origin: 'TURNOMATIC', error: 'OFFLINE', message: `Conectando a ${remote.getGlobal('appConf').server.ip}`})
            
        }, 5000)
      }
}