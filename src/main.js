const appName = 'canal'
const { app, BrowserWindow, Menu, ipcMain, dialog, screen } = require('electron')
const { exec } = require("child_process")
const fs = require("fs")
const path = require('path')
const logger = require('./log.js')
const isLinux = process.platform === "linux"
const restartCommandShell =  `/home/cvc/scripts/appsCtrl restart ${appName} &`
const {DEFAULT_CONFIG} = require('./exports.js')

var appWin, configWin, configServerWin;

const CONFIG_FILE = `${app.getPath('userData')}/_custom/CONF.json`
if ( !(global.CONF = loadConfigFile(CONFIG_FILE)) )      { global.CONF = DEFAULT_CONFIG }


/*=============================================
=            Menu            =
=============================================*/

  const MENU = [
    {
      role: 'appMenu',
      label: 'Archivo',
      submenu: [
          {label:'Reiniciar', accelerator: 'CmdOrCtrl+R', click() { restart() } },
          {role:'forcereload', label:'Refrescar' },
          {role: 'quit', label:'Salir'}
      ]
    },{
      label: 'Editar',
      submenu: [
          {label:'Ajustes', accelerator: 'CmdOrCtrl+E',  click() {
            if (configWin == null)  { config() } 
            else                    { configWin.focus() } 
          }},
          {label:'Ajustes del servidor', accelerator: 'CmdOrCtrl+S',  click() {
            if (configServerWin == null)     { configServer() } 
            else                             { configWin.focus() } 
          }},
          {type: 'separator'},
          {label:'Restaurar parámetros',     click() { restoreDialog() } }
      ]
    }
    ,{
      role: 'help',
      label: 'Ayuda',
      submenu: [
          {label:'Información',     click() { about() } },
          {role: 'toggledevtools', label:'Consola Web'}
      ]
    }
  ]

/*=====  End of Funciones  ======*/



/*=============================================
=            Funciones            =
=============================================*/

  function restart() {
    if (isLinux)    { exec(restartCommandShell) }
    else            { app.relaunch(); app.quit() }
  }

  function saveConf(items, file) { 
    fs.mkdirSync( path.dirname(file), { recursive: true } )
    fs.writeFileSync(file, JSON.stringify(items, null, '\t'), 'utf8') 
  }

  function loadConfigFile(file) {
    if (fs.existsSync(file)) {
      try {
        let data = JSON.parse(fs.readFileSync(file, 'utf8'))
        return data
      } catch (error) { return false }
    } else { return false}
  }

  function restore() { saveConf(DEFAULT_CONFIG, CONFIG_FILE); restart()  }

  function restoreDialog() {
    const options  = {
      type: 'warning',
      buttons: ['Cancelar','Aceptar'],
      message: '¿Restaurar los valores por defecto de la configuración de la aplicación?'
    }
    dialog.showMessageBox(options, (resp) => { if (resp) { restore(); restart() } }) // Ha pulsado aceptar
  }

/*=====  End of Funciones  ======*/



/*=============================================
=            Ventanas            =
=============================================*/

  function initApp() {
    let windowOptions = {autoHideMenuBar: true, resizable:true, show: false, webPreferences: { spellcheck:false, preload: path.join(__dirname, "preload.js") }, icon: `${app.getAppPath()}/icon64.png`}
    if      (CONF.window.type == 0)                             { windowOptions.fullscreen = true }
    else if (CONF.window.type == 1 || CONF.window.type == 3)    { windowOptions.frame = false } // Borderless or fullBorderless
    if (CONF.window.type != 0)                                  { windowOptions.alwaysOnTop = CONF.window.alwaysOnTop }
    appWin = new BrowserWindow(windowOptions)

    switch (CONF.window.type) {
      case 0: // Fullscreen
        screen.on('display-metrics-changed', restart )
      break
      case 1: // Borderless
        appWin.setPosition( CONF.window.posX, CONF.window.posY)
      case 2: // Normal Window
        appWin.setSize(CONF.window.width, CONF.window.height)
      break
      case 3: // fullBorderless
        let width=0, height=0, displays = screen.getAllDisplays()
        displays.forEach(d => { 
          width += d.bounds.width
          height = (height<d.bounds.height)? d.bounds.height : height
        })

        appWin.setPosition(0,0)
        appWin.setSize(width,height)
      break
    }

    let tpl
    switch(CONF.interface.type) {
      case 0: tpl = '_canalcorp'; break;      // Sin colas
      case 1: tpl = '_derecha';   break;      // Derecha
      case 2: tpl = '_izquierda'; break;      // Izquierda
      case 3: tpl = '_abajo';     break;      // Abajo
    }

    appWin.loadFile(`${__dirname}/_main/${tpl}.html`)
    appWin.setTitle(appName)
    appWin.on('page-title-updated', (e)=>{ e.preventDefault()})
    Menu.setApplicationMenu( Menu.buildFromTemplate(MENU) )
    appWin.setResizable(false)
    appWin.on('closed', () => { logs.log('MAIN','QUIT',''); app.quit() })

    appWin.show()
    logs.log('MAIN','START','')
    appWin.webContents.openDevTools()
  }

  function config() {
    const winOptions = {
      width: 450, height: 600, show:false, parent: appWin, modal:true, resizable:false, 
      webPreferences: { spellcheck:false, preload: path.join(__dirname, "preload.js") }
    }
    configWin = new BrowserWindow(winOptions)
    configWin.loadFile(`${__dirname}/_config/config.html`)
    configWin.setMenu( null )
    configWin.resizable = false
    configWin.show()
    
    configWin.on('closed', () => { configWin = null })
    //configWin.webContents.openDevTools()
  }

  function configServer() {
    const winOptions = {
      width: 400, height: 550, show:false, parent: appWin, modal:true, resizable:false, 
      webPreferences: { spellcheck:false, preload: path.join(__dirname, "preload.js") }
    }
    configServerWin = new BrowserWindow(winOptions)
    configServerWin.loadFile(`${__dirname}/_configServer/configServer.html`)
    configServerWin.setMenu( null )
    configServerWin.show()
    
    configServerWin.on('closed', () => { configServerWin = null })
    //configServerWin.webContents.openDevTools()
  }

  function about() {
    const options  = {
      type: 'info',
      buttons: ['Aceptar'],
      message: 'Canal corporativo y turnomatic digital\nComunicacion Visual Canarias 2023\nContacto: 928 67 29 81'
     }
    dialog.showMessageBox(appWin, options)
  }

/*=====  End of Ventanas  ======*/


app.on('ready', initApp)


/*=============================================
=                 IPC signals                 =
=============================================*/

ipcMain.on('execShell', (e, cmd) => {
  exec(cmd)
})

ipcMain.on('getGlobal', (e, type) => {
  switch(type) {
    case 'appConf':
      e.returnValue = global.CONF
    break
  }
})

ipcMain.on('getPath', (e, dir) => {
  e.returnValue = app.getPath(dir)
})

ipcMain.on('saveAppConf', (e, conf, files) => { 
  global.CONF = conf
  saveConf(conf, CONFIG_FILE)
  logs.log('MAIN', 'SAVE_CONF', JSON.stringify(conf, null, '\t'))

  for ( let file of files ) {
    const buf = Buffer.from(file.file, 'base64');
    fs.writeFileSync(app.getPath('userData')+'/_custom/'+file.name, buf)
  }

  restart()
})

ipcMain.on('closeWindow', (e, arg) => { 
  switch(arg) {
    case 'config':
      configWin.close()
    break
    case 'configServer':
      configServerWin.close()
    break
  }
})

ipcMain.on('saveDirDialog', (e, arg) => {
  let options
  if (arg.file) { // Abre archivo
    options = {
      title : 'Abrir archivo list.json', 
      defaultPath : arg.dir,
      buttonLabel : "Abrir lista",
      filters : [{name: 'list', extensions: ['json']}],
      properties: ['openFile']
    }
  } else { // Abre directorio
    options = {
      title : 'Abrir directorio', 
      defaultPath : arg.dir,
      buttonLabel : "Abrir directorio",
      properties: ['openDirectory']
    }
  }
  

  let dir = dialog.showOpenDialogSync(options)
  if (typeof dir != 'undefined')  { e.returnValue = arg.file? path.dirname( dir.toString() ) : dir.toString() }
  else                            { e.returnValue = arg.dir }
})

// Logs
var logs = new logger(`${global.CONF.logsDir}/`, appName)
ipcMain.on('log', (e, arg) =>       { logs.log(arg.origin, arg.event, arg.message) })
ipcMain.on('logError', (e, arg) =>  { logs.error(arg.origin, arg.error, arg.message) })


/*=====  End of IPC signals  ======*/