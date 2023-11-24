import {$, $$, tabNav, displayGroup, readFileAsDataURL} from '../exports.web.js'
var CONF = window.ipc.get.appConf()

async function saveConf() {
    CONF.deployDir = $('deployDir').value
    CONF.media.transitionDuration = $('transitionDuration').value
    CONF.media.volume = parseFloat($('mediaVol').value)
    CONF.logsDir = $('logsDir').value

    CONF.server.ip = $('serverIp').value != ''? $('serverIp').value : $('serverIp').placeholder
    CONF.server.port = $('serverPort').value != ''? parseInt($('serverPort').value) : parseInt($('serverPort').placeholder)

    CONF.music.volume = parseFloat($('musicVol').value)
    CONF.music.type = parseInt($('musicType').value)
    CONF.ting = parseInt( $('ting').value )

    CONF.window.type = parseInt($('windowType').value)
    CONF.window.width = $('windowSizeX').value != ''? parseInt($('windowSizeX').value) : parseInt($('windowSizeX').placeholder)
    CONF.window.height = $('windowSizeY').value != ''? parseInt($('windowSizeY').value) : parseInt($('windowSizeY').placeholder)
    CONF.window.posX = $('windowPosX').value != ''? parseInt($('windowPosX').value) : parseInt($('windowPosX').placeholder)
    CONF.window.posY = $('windowPosY').value != ''? parseInt($('windowPosY').value) : parseInt($('windowPosY').placeholder)
    CONF.window.alwaysOnTop = $('alwaysOnTop').checked

    CONF.debug.autoOpenDevTools = $('autoOpenDevTools').checked

    CONF.interface.colors.app = $('appColor').value
    CONF.interface.colors.main = $('mainColor').value
    CONF.interface.colors.secondary = $('secondaryColor').value
    CONF.interface.colas.BGtype = parseInt($('asideBGType').value)
    CONF.interface.colors.aside = $('asideBGColor').value
    CONF.interface.infoBar = $('infoBar').checked
    CONF.interface.clock = $('clock').checked
    CONF.interface.type = parseInt($('interfaceType').value)
    CONF.interface.colas.historial = $('historial').checked
    CONF.interface.colas.mensaje = $('textoColas').checked
    CONF.interface.colas.destacada = parseInt($('colaDestacada').value)
    CONF.interface.colas.excluir = Array.from( $('exColas').selectedOptions ).map(el => parseInt(el.value))

    const reader = new FileReader()
    let files=[], file, dataUrl
    // Imagen derecha
    file = $('rightBarImg').files[0]
    if (!!file) {
        dataUrl = await readFileAsDataURL(file)
        files.push( {name: '/img/rightBarImg.png', file: dataUrl.substring(22)} )
    }

    // Imagen central
    file = $('midBarImg').files[0]
    if (!!file) {
        dataUrl = await readFileAsDataURL(file)
        files.push( {name: '/img/midBarImg.png', file: dataUrl.substring(22)} )
    }

    // Imagen de turnos
    file = $('asideBGimg').files[0]
    if (!!file) {
        dataUrl = await readFileAsDataURL(file)
        files.push( {name: '/img/asideBG.png', file: dataUrl.substring(22)} )
    }

    window.ipc.save.appConf( CONF, files )
}


/* *********************** EVENTS *****************  */

$('save').onclick = (e)=> {
    e.preventDefault()
    if ( $('config').checkValidity() )  { saveConf() }
    else                                { $('config').reportValidity()}
}

$('deployDirExplore').onclick = (e)=> {
    e.preventDefault()
    let dir = window.ipc.dialog.saveDir({dir: $('deployDir').value, file:'deploy.json'})
    $('deployDir').value = dir
}

$('logsDirExplore').onclick = (e)=> {
    e.preventDefault()
    let dir = window.ipc.dialog.saveDir({dir: $('logsDir').value, file:false})
    $('logsDir').value = dir
}


// On Changes
$('musicType').onchange = (e)=> { displayGroup($('musIntegrado'), e.currentTarget.value) }
$('windowType').onchange = (e) => { displayGroup($('window'), e.currentTarget.value) }
$('interfaceType').onchange = (e) => { displayGroup($('turnos'), e.currentTarget.value) }
$('asideBGType').onchange = (e) => { displayGroup($('BGcolas'), e.currentTarget.value) }
$('textoColas').onchange = (e) => { 
    if (e.currentTarget.checked)    { $('historial').disabled = false }
    else                            { $('historial').checked = false; $('historial').disabled = true }
 }
 $('infoBar').onchange = (e) => {
    if (e.currentTarget.checked)    { $('clock').disabled = false }
    else                            { $('clock').disabled = true }
 }

/* *********************** / EVENTS *****************  */


// Initialization
$('deployDir').value = CONF.deployDir
$('transitionDuration').value = CONF.media.transitionDuration
$('logsDir').value = CONF.logsDir
$('serverIp').value = CONF.server.ip
$('serverPort').value = CONF.server.port
$('mediaVol').value = CONF.media.volume
$('musicVol').value = CONF.music.volume
$('musicType').value = CONF.music.type
$('ting').value = CONF.ting

$('windowType').value = CONF.window.type
$('windowSizeX').value = CONF.window.width
$('windowSizeY').value = CONF.window.height
$('windowPosX').value = CONF.window.posX
$('windowPosY').value = CONF.window.posY
$('alwaysOnTop').checked = CONF.window.alwaysOnTop

$('appColor').value = CONF.interface.colors.app
$('mainColor').value = CONF.interface.colors.main
$('secondaryColor').value = CONF.interface.colors.secondary
$('asideBGType').value = CONF.interface.colas.BGtype
$('asideBGColor').value = CONF.interface.colors.aside
$('infoBar').checked = CONF.interface.infoBar
$('clock').checked = CONF.interface.clock
$('interfaceType').value = CONF.interface.type
$('textoColas').checked = CONF.interface.colas.mensaje
$('historial').checked = CONF.interface.colas.historial
$('colaDestacada').value = CONF.interface.colas.destacada
CONF.interface.colas.excluir.forEach(num => { $$(`#exColas option[value='${num}'`).selected = true })


$('autoOpenDevTools').checked = CONF.debug.autoOpenDevTools

// Events
const event = new Event('change')
$('musicType').dispatchEvent(event)
$('windowType').dispatchEvent(event)
$('interfaceType').dispatchEvent(event)
$('textoColas').dispatchEvent(event)
$('asideBGType').dispatchEvent(event)


tabNav( $('configTabs'), $('configTabsContent'))