function $(id)      { return document.getElementById(id)    }
function $$(id)     { return document.querySelector(id)     }
function $$$(id)    { return document.querySelectorAll(id)  }

const remote = require('electron').remote
const { ipcRenderer } = require('electron')

var UI = remote.getGlobal('UI')

function saveConfigUI() {
    UI.colors.main = $('mainColor').value
    UI.colors.secondary = $('secondaryColor').value
    UI.info = $('info').checked
    UI.type = parseInt($('type').value)
    UI.colas.historial = $('historial').checked
    UI.colas.mensaje = $('textoColas').checked
    UI.colas.destacada = parseInt($('colaDestacada').value)

    UI.colas.excluir = Array.from( $('exColas').selectedOptions ).map(el => parseInt(el.value))

    // Imagen de logo
    if (typeof $('footerLogo').files[0] != 'undefined') {
        UI.logo = {name: 'logoCliente.png', file: $('canvasLogo').toDataURL("image/png").substring(22)}
    }

    // Imagen de barra
    if (typeof $('barImg').files[0] != 'undefined') {
        UI.barImg = {name: 'barImage.png', file: $('canvasBarImg').toDataURL("image/png").substring(22)}
    }

    ipcRenderer.send('saveUI', UI )
}

function canvasThumb(event, canvas, width, height) {
    canvas.width = width
    canvas.height = height
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    var img = document.createElement('img')
    img.src = URL.createObjectURL( event.files[0] )

    img.onload = ()=> {
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height )
    }
}

function clearCanvas(canvas) {
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
}

/**
 * ###############################################################################
 * ################################### EVENTOS ###################################
 * ############################################################################### 
 * */

    $('textoColas').onchange = (e) => { 
        if (e.currentTarget.checked)    { $('historial').disabled = false }
        else                            { $('historial').checked = false; $('historial').disabled = true }
     }

    $('type').onchange = (e) => { 
        switch (parseInt(e.currentTarget.value)) {
            case 0: // Sin colas
                $('turnos').disabled = true
            break
            case 3: // Abajo
                $('turnos').disabled = false
                $('colaDestacada').disabled = false
                $('exColas').disabled = false
            break
            default:
                $('turnos').disabled = false
                $('colaDestacada').disabled = true
                $('exColas').disabled = false
            break
        }
    }

    $('footerLogo').onchange = (e) => { 
        if (typeof e.currentTarget.files[0] != 'undefined')     { canvasThumb(e.currentTarget, $('canvasLogo'), 1000, 250) } 
        else                                                    { clearCanvas($('canvasLogo')) }
    }

    $('barImg').onchange = (e) => { 
        if (typeof e.currentTarget.files[0] != 'undefined')     { canvasThumb(e.currentTarget, $('canvasBarImg'), 1000, 180) } 
        else                                                    { clearCanvas($('canvasBarImg')) }
    }

    $('save').onclick = (e)=> {
        e.preventDefault()
        if ( $('configUI').checkValidity() )    { saveConfigUI() } 
        else                                    { $('configUI').reportValidity() }
    }

    $('default').onclick = (e)=> {
        e.preventDefault()
        $('mainColor').value = '#ff0000'
        $('secondaryColor').value = '#00ff00'
        $('info').checked = true
        $('historial').checked = false
        $('textoColas').checked = false
        $('type').value = 0
        $('colaDestacada').value = 0
        $$$(`#exColas option`).forEach( el => { el.selected = false })
    }

/*=====  End of Eventos  ======*/

// Initialization
$('mainColor').value = UI.colors.main
$('secondaryColor').value = UI.colors.secondary
$('info').checked = UI.info
$('type').value = UI.type
$('textoColas').checked = UI.colas.mensaje
$('historial').checked = UI.colas.historial
$('colaDestacada').value = UI.colas.destacada
UI.colas.excluir.forEach(num => { $$(`#exColas option[value='${num}'`).selected = true })


const event = new Event('change')
$('textoColas').dispatchEvent(event)
$('type').dispatchEvent(event)