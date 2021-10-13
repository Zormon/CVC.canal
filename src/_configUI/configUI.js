import {$, $$, $$$} from '../exports.web.js'

const ev = new Event('change')
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

    // Imagen derecha
    if (typeof $('rightBarImg').files[0] != 'undefined') {
        UI.rightBarImg = {name: 'rightBarImg.png', file: $('canvasRightBarImg').toDataURL("image/png").substring(22)}
    }

    // Imagen central
    if (typeof $('midBarImg').files[0] != 'undefined') {
        UI.midBarImg = {name: 'midBarImg.png', file: $('canvasMidBarImg').toDataURL("image/png").substring(22)}
    }

    // Imagen de turnos
    if (typeof $('asideBGimg').files[0] != 'undefined') {
        UI.midBarImg = {name: 'asideBG.png', file: $('canvasAsideBGimg').toDataURL("image/png").substring(22)}
    }

    window.ipc.save.interface(UI)
}

function canvasThumb(file, canvas, width, height) {
    canvas.width = width
    canvas.height = height
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    var img = document.createElement('img')
    img.src = file

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

    $('rightBarImg').onchange = (e) => { 
        if (typeof e.currentTarget.files[0] != 'undefined')     { canvasThumb(URL.createObjectURL(e.currentTarget.files[0]), $('canvasRightBarImg'), 1000, 250) } 
        else                                                    { clearCanvas($('canvasRightBarImg')) }
    }

    $('midBarImg').onchange = (e) => { 
        if (typeof e.currentTarget.files[0] != 'undefined')     { canvasThumb(URL.createObjectURL(e.currentTarget.files[0]), $('canvasMidBarImg'), 1000, 180) } 
        else                                                    { clearCanvas($('canvasMidBarImg')) }
    }

    $('asideBGimg').onchange = (e) => { 
        if (typeof e.currentTarget.files[0] != 'undefined')     { canvasThumb(URL.createObjectURL(e.currentTarget.files[0]), $('canvasAsideBGimg'), 220, 720) } 
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

canvasThumb(`file://${window.ipc.get.path('userData')}/_custom/rightBarImg.png`, $('canvasRightBarImg'), 1000, 250)
canvasThumb(`file://${window.ipc.get.path('userData')}/_custom/midBarImg.png`, $('canvasMidBarImg'), 1000, 250)
//canvasThumb(`file://${window.ipc.get.path('userData')}/_custom/asideBG.png`, $('canvasAsideBGimg'), 1000, 250)


$('textoColas').dispatchEvent(ev)
$('type').dispatchEvent(ev)
$('asideBGType').dispatchEvent(ev)