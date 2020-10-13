function $(id)      { return document.getElementById(id)    }
function $$(id)     { return document.querySelector(id)     }
function $$$(id)    { return document.querySelectorAll(id)  }

const remote = require('electron').remote
const { ipcRenderer } = require('electron')
var CONF = remote.getGlobal('APPCONF')
var UI = remote.getGlobal('UI')

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
    CONF.window.sizeX = $('windowSizeX').value != ''? parseInt($('windowSizeX').value) : parseInt($('windowSizeX').placeholder)
    CONF.window.sizeY = $('windowSizeY').value != ''? parseInt($('windowSizeY').value) : parseInt($('windowSizeY').placeholder)
    CONF.window.posX = $('windowPosX').value != ''? parseInt($('windowPosX').value) : parseInt($('windowPosX').placeholder)
    CONF.window.posY = $('windowPosY').value != ''? parseInt($('windowPosY').value) : parseInt($('windowPosY').placeholder)

    ipcRenderer.send('saveAppConf', CONF )
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
    let dir = ipcRenderer.sendSync('saveDirDialog', {dir: $('contentDir').value, file:'lista.xml'})
    $('contentDir').value = dir
}

$('logsDir').onclick = ()=> {
    let dir = ipcRenderer.sendSync('saveDirDialog', {dir: $('logsDir').value, file:false})
    $('logsDir').value = dir
}

$('musicDir').onclick = ()=> {
    let dir = ipcRenderer.sendSync('saveDirDialog', {dir: $('musicDir').value, file:'lista.xml'})
    $('musicDir').value = dir
}

$('musicType').onchange = (e)=> {
    switch (e.currentTarget.value) {
        case '0': //Integrado
            $('musicDir').disabled = false;                         $('musicVol').disabled = false;
        break
        case '1': //Externo
            $('musicDir').disabled = true;                          $('musicVol').disabled = false
        break;
        case '2': //Desactivado
            $('musicDir').disabled = true;                          $('musicVol').disabled = true
        break;
    }
}

$('windowType').onchange = (e) => { 
    switch (e.currentTarget.value) {
        case '0': //Fullscreen
            $('windowSizeX').disabled = true;  $('windowSizeY').disabled = true
            $('windowPosX').disabled = true;  $('windowPosY').disabled = true
        break

        case '1': // Sin bordes
            $('windowSizeX').disabled = false;  $('windowSizeY').disabled = false
            $('windowPosX').disabled = false;  $('windowPosY').disabled = false
        break

        case '2': // Normal
            $('windowSizeX').disabled = false;  $('windowSizeY').disabled = false
            $('windowPosX').disabled = true;  $('windowPosY').disabled = true
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
$('windowSizeX').value = CONF.window.sizeX
$('windowSizeY').value = CONF.window.sizeY
$('windowPosX').value = CONF.window.posX
$('windowPosY').value = CONF.window.posY

const event = new Event('change')
$('musicType').dispatchEvent(event)
$('windowType').dispatchEvent(event)