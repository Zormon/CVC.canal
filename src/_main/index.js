import LineIn from './linein.class.js'
import wSocket from './wSocket.class.js'
import Content from './content.class.js'
import Music from './music.class.js'
import {$, shadeColor, updateTime} from '../exports.web.js'

const CONF = window.ipc.get.appConf()

/*======================================================================
====================            ASPECTO            =====================
======================================================================*/

  if (!CONF.interface.infoBar) { document.body.classList.add('noInfo') }
  if (!CONF.interface.clock) { document.body.classList.add('noClock') }
  const css = new CSSStyleSheet()

  // Colores
  css.insertRule(` :root { --app-color: ${CONF.interface.colors.app}; } `)
  css.insertRule(` :root { --main-color: ${CONF.interface.colors.main}; } `)
  css.insertRule(` :root { --main-color-light: ${shadeColor(CONF.interface.colors.main, 30)}; } `)
  css.insertRule(` :root { --main-color-dark: ${shadeColor(CONF.interface.colors.main, -30)}; } `)
  css.insertRule(` :root { --secondary-color: ${CONF.interface.colors.secondary}; } `)
  css.insertRule(` :root { --secondary-color-light: ${shadeColor(CONF.interface.colors.secondary, 30)}; } `)
  css.insertRule(` :root { --secondary-color-dark: ${shadeColor(CONF.interface.colors.secondary, -30)}; } `)
  css.insertRule(` :root { --turnos-color: ${CONF.interface.colors.aside}; } `)
  css.insertRule(` :root { --turnos-color-light: ${shadeColor(CONF.interface.colors.aside, 30)}; } `)
  css.insertRule(` :root { --transition-duration: ${CONF.media.transitionDuration}s } `)

  switch (CONF.interface.colas.BGtype) {
    case 1: // Color
      css.insertRule(` #colas { background: radial-gradient( circle, var(--turnos-color-light), var(--turnos-color));} `)
    break
    case 2: // Img
      css.insertRule(` #colas { background: url(file://${window.ipc.get.path('userData').replace(/\\/g,'/')}/_custom/asideBG.png) 0 0 no-repeat; background-size: 100% 100%} `)
    break
  }

  document.adoptedStyleSheets = [css]

  $('midImg').src = `file://${window.ipc.get.path('userData')}/_custom/midBarImg.png`
  $('rightImg').src = `file://${window.ipc.get.path('userData')}/_custom/rightBarImg.png`




/*======================================================================
====================            MUSICA            =====================
======================================================================*/
  var music
  switch(CONF.music.type) {
    case 0: // Hilo integrado
      music = new Music(CONF.deployDir, CONF.music.volume, window.ipc.logger)
      music.updatePlaylist().then( ()=> { music.next() })
      setInterval(()=>{music.updatePlaylist()}, 30000) // 30 seconds
    break

    case 1: // Hilo externo
      music = new LineIn(CONF.music.volume)
      music.play()
      navigator.mediaDevices.ondevicechange = ()=> { music.play() }
    break

    case 2: // Sin musica
      music = false
    break
  }




/*======================================================================
===========            CONTENIDO, SOCKET Y HORA            =============
======================================================================*/
  var content = new Content(
    CONF.deployDir,
    music,
    window.ipc.logger,
    window.ipc.get.path('userData'),
    {volume: CONF.media.volume, transition_duration: CONF.media.transitionDuration}
  )
  content.next()

  var ws = new wSocket(CONF, content, window.ipc, true)
  ws.init()

  updateTime($('time'), 5000)



// Atajos de teclado para testeo
window.onkeyup = (e) => {
  switch (e.key) {
    case 'Enter':
      window.ipc.logger.std({origin: 'USER', event: 'SKIP_CONTENT', message: ''})
      content.next()
    break
    case 'm':
      if (CONF.music.type == 0) { window.ipc.logger.std({origin: 'USER', event: 'SKIP_MUSIC', message: ''}); music.next()}
    break
    case 'p':
      content.togglePause()
    break

    case '1': // Sube cola 1
      window.ipc.logger.std({origin: 'USER', event: 'SUBE_COLA', message: ''})
      ws.ws.send( JSON.stringify( {accion: 'sube', cola: 0, texto: 'test'} ) )
    break

    case '2': // Baja cola 1
      window.ipc.logger.std({origin: 'USER', event: 'BAJA_COLA', message: ''})
      ws.ws.send( JSON.stringify( {accion: 'baja', cola: 0, texto: 'test'} ) )
    break

    case '3': // Sube cola 2
      window.ipc.logger.std({origin: 'USER', event: 'SUBE_COLA', message: ''})
      ws.ws.send( JSON.stringify( {accion: 'sube', cola: 1, texto: 'test'} ) )
    break

    case '4': // Baja cola 2
      window.ipc.logger.std({origin: 'USER', event: 'BAJA_COLA', message: ''})
      ws.ws.send( JSON.stringify( {accion: 'baja', cola: 1, texto: 'test'} ) )
    break

    case 'P': // Aviso pan
      window.ipc.logger.std({origin: 'USER', event: 'AVISO_PAN', message: ''})
      navigator.sendBeacon('http://localhost:3000/pan')
  }
}