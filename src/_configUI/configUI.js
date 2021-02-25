import {$, $$, $$$} from '../exports.web.js'

var UI = window.ipc.get.interface()

function saveConfigUI() {
    UI.colors.main = $('mainColor').value
    UI.colors.secondary = $('secondaryColor').value
    UI.colas.BGtype = parseInt($('asideBGType').value)
    UI.colors.aside = $('asideBGColor').value
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

    // Imagen de barra
    if (typeof $('asideBGimg').files[0] != 'undefined') {
        UI.barImg = {name: 'asideBG.png', file: $('canvasAsideBGimg').toDataURL("image/png").substring(22)}
    }

    window.ipc.save.interface(UI)
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
                $('turnos').style.display = 'none'
            break
            case 3: // Abajo
                $('turnos').style.display = ''
                $('colaDestacada').parentElement.style.display = ''
                $('exColas').parentElement.style.display = ''
            break
            default:
                $('turnos').style.display = ''
                $('colaDestacada').parentElement.style.display = 'none'
                $('exColas').parentElement.style.display = ''
            break
        }
    }

    $('asideBGType').onchange = (e) => {
        switch (parseInt(e.currentTarget.value)) {
            case 1: // Color
                $('asideBGColor').parentElement.style.display = ''
                $('asideBGimg').parentElement.style.display = 'none'
            break
            case 2: // Imagen
                $('asideBGColor').parentElement.style.display = 'none'
                $('asideBGimg').parentElement.style.display = ''
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

    $('asideBGimg').onchange = (e) => { 
        if (typeof e.currentTarget.files[0] != 'undefined')     { canvasThumb(e.currentTarget, $('canvasAsideBGimg'), 220, 720) } 
        else                                                    { clearCanvas($('canvasAsideBGimg')) }
    }

    $('save').onclick = (e)=> {
        e.preventDefault()
        if ( $('configUI').checkValidity() )    { saveConfigUI() } 
        else                                    { $('configUI').reportValidity() }
    }

    $('default').onclick = (e)=> {
        e.preventDefault()
        $('mainColor').value = '#ff0000'
        $('secondaryColor').value = '#01A701'
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
$('asideBGType').value = UI.colas.BGtype
$('asideBGColor').value = UI.colors.aside
$('info').checked = UI.info
$('type').value = UI.type
$('textoColas').checked = UI.colas.mensaje
$('historial').checked = UI.colas.historial
$('colaDestacada').value = UI.colas.destacada
UI.colas.excluir.forEach(num => { $$(`#exColas option[value='${num}'`).selected = true })


const event = new Event('change')
$('textoColas').dispatchEvent(event)
$('type').dispatchEvent(event)
$('asideBGType').dispatchEvent(event)