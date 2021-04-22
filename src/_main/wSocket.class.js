import {iconNames, $, $$, isFunction, modalBox} from '../exports.web.js'

class wSocket {
    constructor(ip, port, pan, UI, ting, logger) {
        this.ip = ip
        this.port = port
        this.UI = UI
        this.log = logger.std
        this.logError = logger.error
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
                    this.log({origin: 'TURNOMATIC', event: 'SPREAD', message: `Colas: ${JSON.stringify(msg.colas)}, Turnos: ${JSON.stringify(msg.turnos)}, Tickets: ${JSON.stringify(msg.tickets)}`})
                break
                case 'update':
                    if (this.UI.type != 0) { this.update(msg.cola, msg.numero, msg.texto) }
                    this.log({origin: 'TURNOMATIC', event: 'UPDATE', message: `Cola: ${msg.cola}, Numero: ${msg.numero}, Texto: ${msg.texto}`})
                break
                case 'pan':
                    if ( isFunction(this.onpan) ) { this.onpan() }
                    this.log({origin: 'TURNOMATIC', event: 'PAN', message: `Aviso del pan`})
                break
                default:
                    modalBox('OFFLINE', false)
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
        let divColas, cola, nombre, num, icon, texto, colasEnPantalla=[]
        divColas = $('colas'); divColas.className = ''
        while (divColas.firstChild) { divColas.removeChild(divColas.firstChild) }

        colas.forEach((el, key) => {
            if ( this.UI.colas.excluir.indexOf(key+1) == -1 ) {
                el.id = key
                colasEnPantalla.push(el)
              }
        })

        colasEnPantalla.forEach(col => {
            cola = document.createElement('div'); cola.id =  `cola${col.id}`; cola.style = `background:${colas[col.id].color}; color:${colas[col.id].color};`
                icon = document.createElement('i'); icon.className = `icon-${iconNames[colas[col.id].icon]}`
                texto = document.createElement('span'); texto.className = 'texto'; texto.textContent = turnos[col.id].texto;
                num = document.createElement('span'); num.className = 'num'; num.textContent = turnos[col.id].num
                nombre = document.createElement('span'); nombre.className = 'nombre'; nombre.textContent = colas[col.id].nombre; nombre.style = `border-color:${colas[col.id].color}`
            
                cola.appendChild(icon); cola.appendChild(nombre); cola.appendChild(num)
                if (this.UI.colas.mensaje) { cola.appendChild(texto); divColas.classList.add('texto')  }

                if (this.UI.colas.historial) {
                    divColas.classList.add('history')
                    let table = document.createElement('table'); table.className = 'historial'
                    let tr1 = document.createElement('tr'); let tr2 = document.createElement('tr'); let tr3 = document.createElement('tr')
                    let td1 = document.createElement('td'); let td2 = document.createElement('td')
                    let td3 = document.createElement('td'); let td4 = document.createElement('td')
                    let td5 = document.createElement('td'); let td6 = document.createElement('td')

                    tr1.className = 'history1'
                    tr2.className = 'history2'
                    tr3.className = 'history3'
                    td1.className = td3.className = td5.className = 'historyNum'
                    td2.className = td4.className = td6.className = 'historyText'
                    td1.textContent = td2.textContent = td3.textContent = td4.textContent = td5.textContent = td6.textContent ='-'

                    tr1.appendChild(td1);   tr1.appendChild(td2)
                    tr2.appendChild(td3);   tr2.appendChild(td4)
                    tr3.appendChild(td5);   tr3.appendChild(td6)
                    table.appendChild(tr1)
                    if (colasEnPantalla.length <= 2) { table.appendChild(tr2) }
                    if (colasEnPantalla.length == 1) { table.appendChild(tr3) }
                    
                    cola.appendChild(table)
                }
                divColas.appendChild(cola)
        })

        divColas.classList.add(`ncolas-${colasEnPantalla.length}`)

        if (this.UI.type == 3) {
            const n = this.UI.colas.destacada - 1
            divColas = $('colaDestacada')
            while (divColas.firstChild) { divColas.removeChild(divColas.firstChild) }

            if (typeof colas[n] !== 'undefined' && this.UI.colas.excluir.indexOf(n+1) == -1) {
                try { $(`cola${n}`).remove() }catch(e){}
                cola = document.createElement('div'); cola.id =  `cola${n}`; cola.style = `background:${colas[n].color}; color:${colas[n].color};`
                nombre = document.createElement('span'); nombre.className = 'nombre'; nombre.textContent = colas[n].nombre; nombre.style = `border-color:${colas[n].color}`
                num = document.createElement('span'); num.className = 'num'; num.textContent = turnos[n].num
            
                cola.appendChild(nombre); cola.appendChild(num)
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
            let history1Text = $$(`#cola${cola} .history1 .historyText`)
            let history2Num = $$(`#cola${cola} .history2 .historyNum`)
            let history2Text = $$(`#cola${cola} .history2 .historyText`)
            let history3Num = $$(`#cola${cola} .history3 .historyNum`)
            let history3Text = $$(`#cola${cola} .history3 .historyText`)

            if (history3Num) {
                history3Num.textContent = history2Num.textContent
                history3Text.textContent = history2Text.textContent
            }

            if (history2Num) {
                history2Num.textContent = history1Num.textContent
                history2Text.textContent = history1Text.textContent
            }

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

            modalBox('OFFLINE', 'msgBox', [['header','ERROR DE CONEXIÓN'],['texto',`Conectando a ${this.ip}`]], 'error', false )
            this.logError({origin: 'TURNOMATIC', error: 'OFFLINE', message: `Conectando a ${this.ip}`})
            
        }, 5000)
      }
}

export default wSocket