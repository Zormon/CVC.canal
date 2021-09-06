import LineIn from './linein.class.js'
import wSocket from './wSocket.class.js'
import Content from './content.class.js'
import Music from './music.class.js'
import {$} from '../exports.web.js'

const conf = window.ipc.get.appConf()
const UI = window.ipc.get.interface()


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


 
/*=====  End of Funciones  ======*/


/*=============================================
=            MAIN            =
=============================================*/

// Aplica CSS basado en la configuracion
if (!UI.info) { document.body.classList.add('noInfo') }
const css = new CSSStyleSheet()
// Colores
css.insertRule(` :root { --main-color: ${UI.colors.main}; } `)
css.insertRule(` :root { --main-color-light: ${shadeColor(UI.colors.main, 30)}; } `)
css.insertRule(` :root { --main-color-dark: ${shadeColor(UI.colors.main, -30)}; } `)
css.insertRule(` :root { --secondary-color: ${UI.colors.secondary}; } `)
css.insertRule(` :root { --secondary-color-light: ${shadeColor(UI.colors.secondary, 30)}; } `)
css.insertRule(` :root { --secondary-color-dark: ${shadeColor(UI.colors.secondary, -30)}; } `)
css.insertRule(` :root { --turnos-color: ${UI.colors.aside}; } `)
css.insertRule(` :root { --turnos-color-light: ${shadeColor(UI.colors.aside, 30)}; } `)
switch (UI.colas.BGtype) {
  case 1: // Color
    css.insertRule(` #colas { background: radial-gradient( circle, var(--turnos-color-light), var(--turnos-color));} `)
  break
  case 2: // Img
    css.insertRule(` #colas { background: url(../../files/asideBG.png) 0 0 no-repeat; background-size: 100% 100%} `)
  break
}

document.adoptedStyleSheets = [css]


var music


switch(conf.music.type) {
  case 0: // Hilo integrado
    music = new Music(conf.music.path, conf.music.volume, window.ipc.logger)
    music.updatePlaylist().then( ()=> { music.next() })
    setInterval(()=>{music.updatePlaylist()}, 30000) // 30 seconds
  break

  case 1: //Hilo externo
    music = new LineIn(conf.music.volume)
    music.play()
    navigator.mediaDevices.ondevicechange = ()=> { music.play() }
  break

  case 2: //Sin musica
    music = false
  break
}

var content = new Content(conf.media.path, music, window.ipc.logger)
content.next()

const ting = conf.avisoSonoro? new Audio('../res/aviso.opus') : false;
var ws = new wSocket(conf.server, content, UI, window.ipc, {ting:ting, pan:true})
ws.init()

time()
setInterval(time, 5000)

/*=====  End of MAIN  ======*/



// Atajos de teclado para testeo
window.onkeyup = (e) => {
  switch (e.keyCode) {
    // Enter: Siguiente contenido
    case 13:
      window.ipc.logger.std({origin: 'USER', event: 'SKIP_CONTENT', message: ''})
      content.next()
    break
    // Shift: Siguiente cancion
    case 16:
      if (conf.music.type == 0) { window.ipc.logger.std({origin: 'USER', event: 'SKIP_MUSIC', message: ''}); music.next()}
    break
    case 80:
      content.togglePause()
    break

    case 49: // Sube cola 1
      window.ipc.logger.std({origin: 'USER', event: 'SUBE_COLA', message: ''})
      ws.ws.send( JSON.stringify( {accion: 'sube', cola: 0, texto: 'test'} ) )
    break

    case 50: // Baja cola 1
      window.ipc.logger.std({origin: 'USER', event: 'BAJA_COLA', message: ''})
      ws.ws.send( JSON.stringify( {accion: 'baja', cola: 0, texto: 'test'} ) )
    break
  }
}