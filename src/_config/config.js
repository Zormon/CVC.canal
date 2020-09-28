function $(id)      { return document.getElementById(id)    }
function $$(id)     { return document.querySelector(id)     }
function $$$(id)    { return document.querySelectorAll(id)  }

const remote = require('electron').remote
const { ipcRenderer } = require('electron')
var prefs = remote.getGlobal('appConf')
var interface = remote.getGlobal('interface')

function savePreferences() {
    prefs.contentDir = $('contentDir').value
    prefs.logsDir = $('logsDir').value

    prefs.server.ip = $('serverIp').value != ''? $('serverIp').value : $('serverIp').placeholder
    prefs.server.port = $('serverPort').value != ''? parseInt($('serverPort').value) : parseInt($('serverPort').placeholder)

    prefs.musicDir = $('musicDir').value
    prefs.musicVol = parseFloat($('musicVol').value)
    prefs.musicType = parseInt($('musicType').value)
    prefs.avisoSonoro = $('avisoSonoro').checked

    prefs.window.type = parseInt($('windowType').value)
    prefs.window.sizeX = $('windowSizeX').value != ''? parseInt($('windowSizeX').value) : parseInt($('windowSizeX').placeholder)
    prefs.window.sizeY = $('windowSizeY').value != ''? parseInt($('windowSizeY').value) : parseInt($('windowSizeY').placeholder)
    prefs.window.posX = $('windowPosX').value != ''? parseInt($('windowPosX').value) : parseInt($('windowPosX').placeholder)
    prefs.window.posY = $('windowPosY').value != ''? parseInt($('windowPosY').value) : parseInt($('windowPosY').placeholder)

    ipcRenderer.send('savePrefs', prefs )
}

$('save').onclick = (e)=> {
    e.preventDefault()
    if ( $('config').checkValidity() ) {
        savePreferences()
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
$('contentDir').value = prefs.contentDir
$('musicDir').value = prefs.musicDir
$('logsDir').value = prefs.logsDir
$('serverIp').value = prefs.server.ip
$('serverPort').value = prefs.server.port
$('musicVol').value = prefs.musicVol
$('musicType').value = prefs.musicType
$('avisoSonoro').checked = prefs.avisoSonoro; if (interface.type == 0) { $('avisoSonoro').disabled = true }

$('windowType').value = prefs.window.type
$('windowSizeX').value = prefs.window.sizeX
$('windowSizeY').value = prefs.window.sizeY
$('windowPosX').value = prefs.window.posX
$('windowPosY').value = prefs.window.posY

const event = new Event('change')
$('musicType').dispatchEvent(event)
$('windowType').dispatchEvent(event)