import {$} from '../exports.web.js'

var CONF = window.ipc.get.appConf()
var UI = window.ipc.get.interface()

function saveConf() {
    CONF.media.path = $('contentDir').value
    CONF.logsDir = $('logsDir').value

    CONF.server.ip = $('serverIp').value != ''? $('serverIp').value : $('serverIp').placeholder
    CONF.server.port = $('serverPort').value != ''? parseInt($('serverPort').value) : parseInt($('serverPort').placeholder)

    CONF.music.path = $('musicDir').value
    CONF.music.volume = parseFloat($('musicVol').value)
    CONF.music.type = parseInt($('musicType').value)
    CONF.avisoSonoro = $('avisoSonoro').checked

    CONF.window.type = parseInt($('windowType').value)
    CONF.window.width = $('windowSizeX').value != ''? parseInt($('windowSizeX').value) : parseInt($('windowSizeX').placeholder)
    CONF.window.height = $('windowSizeY').value != ''? parseInt($('windowSizeY').value) : parseInt($('windowSizeY').placeholder)
    CONF.window.posX = $('windowPosX').value != ''? parseInt($('windowPosX').value) : parseInt($('windowPosX').placeholder)
    CONF.window.posY = $('windowPosY').value != ''? parseInt($('windowPosY').value) : parseInt($('windowPosY').placeholder)
    CONF.window.alwaysOnTop = $('alwaysOnTop').checked

    window.ipc.save.appConf( CONF )
}

$('save').onclick = (e)=> {
    e.preventDefault()
    if ( $('config').checkValidity() ) {
        saveConf()
    } else { 
        $('config').reportValidity()
    }
}

$('contentDir').onclick = ()=> {
    let dir = window.ipc.dialog.saveDir({dir: $('contentDir').value, file:'lista.xml'})
    $('contentDir').value = dir
}

$('logsDir').onclick = ()=> {
    let dir = window.ipc.dialog.saveDir({dir: $('logsDir').value, file:false})
    $('logsDir').value = dir
}

$('musicDir').onclick = ()=> {
    let dir = window.ipc.dialog.saveDir({dir: $('musicDir').value, file:'lista.xml'})
    $('musicDir').value = dir
}

$('musicType').onchange = (e)=> {
    switch (e.currentTarget.value) {
        case '0': //Integrado
            $('musicDir').parentElement.style.display = '';         $('musicVol').parentElement.style.display = ''
        break
        case '1': //Externo
            $('musicDir').parentElement.style.display = 'none';     $('musicVol').parentElement.style.display = ''
        break;
        case '2': //Desactivado
            $('musicDir').parentElement.style.display = 'none';     $('musicVol').parentElement.style.display = 'none'
        break;
    }
}

$('windowType').onchange = (e) => { 
    switch (parseInt(e.currentTarget.value)) {
        case 0: case 3: //Fullscreen & fullborderless
            $('windowSize').parentElement.style.display = 'none'
            $('windowPos').parentElement.style.display = 'none'
            $('alwaysOnTop').parentElement.style.display = 'none'
        break

        case 1: // Sin bordes
            $('windowSize').parentElement.style.display = ''
            $('windowPos').parentElement.style.display = ''
            $('alwaysOnTop').parentElement.style.display = ''
        break

        case 2: // Normal
            $('windowSize').parentElement.style.display = ''
            $('windowPos').parentElement.style.display = 'none'
            $('alwaysOnTop').parentElement.style.display = ''
    }
}

// Initialization
$('contentDir').value = CONF.media.path
$('musicDir').value = CONF.music.path
$('logsDir').value = CONF.logsDir
$('serverIp').value = CONF.server.ip
$('serverPort').value = CONF.server.port
$('musicVol').value = CONF.music.volume
$('musicType').value = CONF.music.type
$('avisoSonoro').checked = CONF.avisoSonoro; if (UI.type == 0) { $('avisoSonoro').disabled = true }


$('windowType').value = CONF.window.type
$('windowSizeX').value = CONF.window.width
$('windowSizeY').value = CONF.window.height
$('windowPosX').value = CONF.window.posX
$('windowPosY').value = CONF.window.posY
$('alwaysOnTop').checked = CONF.window.alwaysOnTop

const event = new Event('change')
$('musicType').dispatchEvent(event)
$('windowType').dispatchEvent(event)