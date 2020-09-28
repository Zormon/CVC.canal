function $(i){return document.getElementById(i)}
const {remote, ipcRenderer} = require('electron')
const conf = remote.getGlobal('appConf')
const ui = remote.getGlobal('interface')


/*=============================================
=            Funciones            =
=============================================*/

function shadeColor(color, percent) {
  var num = parseInt(color.replace("#",""),16),
  amt = Math.round(2.55 * percent),
  R = (num >> 16) + amt,
  B = (num >> 8 & 0x00FF) + amt,
  G = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (B<255?B<1?0:B:255)*0x100 + (G<255?G<1?0:G:255)).toString(16).slice(1)
}

/**
 * Actualiza la hora basada en el sistema y la pinta en su contenedor
 */
function time() {
  let date = new Date
  $('time').textContent = date.getHours().toString().padStart(2,'0') + ':' + date.getMinutes().toString().padStart(2,'0')
}

function modalBox(id, type, header='', msg='') {
  if ( type ) { // Añadir
    if (!document.contains( $(id) )) {
      let modal = document.createElement('div')
      modal.id = id
      modal.className = `modalBox ${type}`
      modal.innerHTML = `<div><h1>${header}</h1><p>${msg}</p></div>`    
      document.body.appendChild(modal)
    } else {
        $$(`#${id} > div > h1`).textContent = header
        $$(`#${id} > div > p`).textContent = msg
    }
  } else { // Si type es falso, es que se quiere destruir el modal
    try { $(id).remove()} catch(e){}
  }
}

/**
 * Genera el aviso del pan, pausando el vídeo y mostrando la imagen del aviso
 */
function avisoPan(mus, cont) {
    if (!cont.paused) { // Solo hace algo si el contenido no esta ya pausado
      cont.togglePause()
      if (mus) { mus.fadeOut() } //Try?
      let img = document.createElement("img")
      img.id = 'imgPan'
      img.src = '../res/pan.jpg'
      document.body.appendChild(img)
      pan.play()
    }
}
 
/*=====  End of Funciones  ======*/


/*=============================================
=            MAIN            =
=============================================*/

// Aplica CSS basado en la configuracion
if (!ui.info) { document.body.classList.add('noInfo') }
const css = new CSSStyleSheet()
css.insertRule(` :root { --main-color: ${ui.colors.main}; } `)
css.insertRule(` :root { --main-color-light: ${shadeColor(ui.colors.main, 30)}; } `)
css.insertRule(` :root { --main-color-dark: ${shadeColor(ui.colors.main, -30)}; } `)
css.insertRule(` :root { --secondary-color: ${ui.colors.secondary}; } `)
css.insertRule(` :root { --secondary-color-light: ${shadeColor(ui.colors.secondary, 30)}; } `)
css.insertRule(` :root { --secondary-color-dark: ${shadeColor(ui.colors.secondary, -30)}; } `)
document.adoptedStyleSheets = [css]


var music
var pan = new Audio('../res/pan.opus')
pan.onended = async ()=> { 
  content.togglePause()
  if ( content.current.volumen == 0 && music) { await music.fadeIn() }
  $('imgPan').remove()
}

switch(conf.musicType) {
  case 0: // Hilo integrado
    music = new Music(conf.musicDir, conf.musicVol, ipcRenderer)
    music.updatePlaylist().then( ()=> { music.next() })
    setInterval('music.updatePlaylist()', 60000) // 60 seconds
  break

  case 1: //Hilo externo
    music = new LineIn(conf.musicVol)
    music.play()
    navigator.mediaDevices.ondevicechange = ()=> { music.play() }
  break

  case 2: //Sin musica
    music = false
  break
}

var content = new Content(conf.contentDir, music, ipcRenderer)
content.updatePlaylist().then( ()=> { content.next() })
setInterval('content.updatePlaylist()', 60000) // 60 seconds

const ting = conf.avisoSonoro? new Audio('../res/aviso.opus') : false;
var ws = new wSocket(conf.server.ip, conf.server.port, true, ui, ipcRenderer, ting)
ws.onpan = ()=> { avisoPan(music, content) }
ws.init()

time()
setInterval(time, 5000)

/*=====  End of MAIN  ======*/




// Atajos de teclado para testeo
window.onkeyup = function(e) {
  switch (e.keyCode) {
    // Enter: Siguiente contenido
    case 13:
      content.next()
      ipcRenderer.send('log', {origin: 'USER', event: 'SKIP_CONTENT', message: ''})
    break
    // Shift: Siguiente cancion
    case 16:
      if (conf.musicType == 0) { music.next(); ipcRenderer.send('log', {origin: 'USER', event: 'SKIP_MUSIC', message: ''}) }
    break
    case 80:
      content.togglePause()
    break

    case 49: // Sube cola 1
      ws.ws.send( JSON.stringify( {accion: 'sube', cola: 0} ) )
      ipcRenderer.send('log', {origin: 'USER', event: 'SUBE_COLA', message: ''})
    break

    case 50: // Baja cola 1
      ws.ws.send( JSON.stringify( {accion: 'baja', cola: 0} ) )
      ipcRenderer.send('log', {origin: 'USER', event: 'BAJA_COLA', message: ''})
    break
  }
}