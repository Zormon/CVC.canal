function $(id)      { return document.getElementById(id)    }
function $$(id)     { return document.querySelector(id)     }
function $$$(id)    { return document.querySelectorAll(id)  }

const remote = require('electron').remote
const { ipcRenderer } = require('electron')

var interface = remote.getGlobal('interface')

function saveConfigUI() {
    interface.colors.main = $('mainColor').value
    interface.colors.secondary = $('secondaryColor').value
    interface.info = $('info').checked
    interface.type = parseInt($('type').value)
    interface.colaDestacada = parseInt($('colaDestacada').value)

    interface.exColas = Array.from( $('exColas').selectedOptions ).map(el => parseInt(el.value))

    // Imagen de logo
    if (typeof $('footerLogo').files[0] != 'undefined') {
        interface.logo = {name: 'logoCliente.png', file: $('canvasLogo').toDataURL("image/png").substring(22)}
    }

    // Imagen de barra
    if (typeof $('barImg').files[0] != 'undefined') {
        interface.barImg = {name: 'barImage.png', file: $('canvasBarImg').toDataURL("image/png").substring(22)}
    }

    ipcRenderer.send('saveInterface', interface )
}

function updateFieldsFromType(type) {
    switch (type) {
        case 0: // Sin colas
            $('colaDestacada').disabled = true
            $('exColas').disabled = true
        break
        case 3: // Abajo
            $('colaDestacada').disabled = false
            $('exColas').disabled = false
        break
        default:
            $('colaDestacada').disabled = true
            $('exColas').disabled = false
        break
    }
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


$('type').onchange = (e) => { updateFieldsFromType( parseInt(e.currentTarget.value)) }

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
    $('type').value = 0
    $('colaDestacada').value = 0
    $$$(`#exColas option`).forEach( el => { el.selected = false })
}

// Initialization
$('mainColor').value = interface.colors.main
$('secondaryColor').value = interface.colors.secondary
$('info').checked = interface.info
$('type').value = interface.type
$('colaDestacada').value = interface.colaDestacada
interface.exColas.forEach(num => { $$(`#exColas option[value='${num}'`).selected = true })

updateFieldsFromType(interface.type)