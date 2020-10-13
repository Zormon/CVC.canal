function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }
function $$(id)     { return document.querySelector(id)     }
function isFunction(f) {return f && {}.toString.call(f)==='[object Function]'}

class wSocket {
    constructor(ip, port, pan, UI, ipcR, ting) {
        this.ip = ip
        this.port = port
        this.UI = UI
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
                    if (this.UI.type != 0) { this.spread(msg.colas, msg.turnos) }
                    this.ipc.send('log', {origin: 'TURNOMATIC', event: 'SPREAD', message: `Colas: ${JSON.stringify(msg.colas)}, Turnos: ${JSON.stringify(msg.turnos)}, Tickets: ${JSON.stringify(msg.tickets)}`})
                break
                case 'update':
                    if (this.UI.type != 0) { this.update(msg.cola, msg.numero, msg.texto) }
                    this.ipc.send('log', {origin: 'TURNOMATIC', event: 'UPDATE', message: `Cola: ${msg.cola}, Numero: ${msg.numero}, Texto: ${msg.texto}`})
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
        let divColas, wrapper, cola, num, nombre, texto
        divColas = $('colas')
        while (divColas.firstChild) { divColas.removeChild(divColas.firstChild) }
        for (let i=0; i < colas.length; i++) {
            if ( this.UI.colas.excluir.indexOf(i+1) == -1 ) { 
                cola = document.createElement('div'); cola.id =  `cola${i}`
                wrapper = document.createElement('div'); wrapper.style = `background:${colas[i].color}; color:${colas[i].color};`
                nombre = document.createElement('span'); nombre.className = 'nombre'; nombre.textContent = colas[i].nombre; nombre.style = `border-color:${colas[i].color}`
                num = document.createElement('span'); num.className = 'num'; num.textContent = turnos[i].num
                texto = document.createElement('span'); texto.className = 'texto'; texto.textContent = turnos[i].texto;
            
                wrapper.appendChild(texto); wrapper.appendChild(num); wrapper.appendChild(nombre)
                cola.appendChild(wrapper)

                if (this.UI.colas.historial) {
                    let table = document.createElement('table'); table.className = 'historial'
                    let tr1 = document.createElement('tr'); let tr2 = document.createElement('tr')
                    let td1 = document.createElement('td'); let td2 = document.createElement('td')
                    let td3 = document.createElement('td'); let td4 = document.createElement('td')

                    tr1.className = 'history1'
                    tr2.className = 'history2'
                    td1.className = td3.className = 'historyNum'
                    td2.className = td4.className = 'historyText'
                    td1.textContent = td2.textContent = td3.textContent = td4.textContent = '-'

                    tr1.appendChild(td1);   tr1.appendChild(td2)
                    tr2.appendChild(td3);   tr2.appendChild(td4)
                    table.appendChild(tr1); table.appendChild(tr2)
                    wrapper.appendChild(table)
                }

                $('colas').appendChild(cola)
            }
        }

        if (this.UI.type == 3) {
            const n = this.UI.colas.destacada - 1
            divColas = $('colaDestacada')
            while (divColas.firstChild) { divColas.removeChild(divColas.firstChild) }

            if (typeof colas[n] !== 'undefined' && this.UI.colas.excluir.indexOf(n+1) == -1) {
                try { $(`cola${n}`).remove() }catch(e){}
                cola = document.createElement('div'); cola.id =  `cola${n}`; cola.style = `background:${colas[n].color}; color:${colas[n].color};`
                num = document.createElement('span'); num.className = 'num'; num.textContent = turnos[n].num
                nombre = document.createElement('span'); nombre.className = 'nombre'; nombre.textContent = colas[n].nombre; nombre.style = `border-color:${colas[n].color}`
            
                cola.appendChild(num); cola.appendChild(nombre)
                divColas.appendChild(cola)
            }
        }
    }

    update(cola, num, texto='') {
        try         { var mainText = $$(`#cola${cola} .texto`) } 
        catch (e)   { console.warn( `Cola ${cola}, Numero ${num}, Texto: ${texto} | Ex: ${e.message}` ); return }

        var mainNum = $$(`#cola${cola} .num`)

        if (this.UI.colas.historial) {
            let history1Num = $$(`#cola${cola} .history1 .historyNum`)
            let history2Num = $$(`#cola${cola} .history2 .historyNum`)
            let history1Text = $$(`#cola${cola} .history1 .historyText`)
            let history2Text = $$(`#cola${cola} .history2 .historyText`)

            history2Num.textContent = history1Num.textContent
            history2Text.textContent = history1Text.textContent
            history1Text.textContent = mainText.textContent
            history1Num.textContent = mainNum.textContent
        }

        if (this.ting) { this.ting.pause(); this.ting.play() }
        mainText.textContent = texto
        mainNum.textContent = num.toString()
        mainNum.classList.remove('effect')
        mainNum.offsetHeight // Reflow
        mainNum.classList.add('effect')
    }

    check() {
        clearTimeout(document.wsTimeout)
      
        var _this = this
        document.wsTimeout = setTimeout( ()=> {
			_this.close()
            _this.init()
            _this.check()

            modalBox('socketError', 'error', 'ERROR DE CONEXIÓN', `Conectando a ${remote.getGlobal('APPCONF').server.ip}`)
            this.ipc.send('logError', {origin: 'TURNOMATIC', error: 'OFFLINE', message: `Conectando a ${remote.getGlobal('APPCONF').server.ip}`})
            
        }, 5000)
      }
}