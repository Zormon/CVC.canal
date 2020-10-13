const appName = 'canal'
const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron')
const fs = require("fs")
const path = require('path')
const logger = require('./log.js')
const isLinux = process.platform === "linux"
const restartCommandShell =  `~/system/scripts/appsCvc restart ${appName} &`

var appWin; var configWin; var configServerWin; var configUIWin;

/*=============================================
=            Preferencias            =
=============================================*/

  const CONFIG_FILE = `${app.getPath('userData')}/APPCONF.json`
  const CONFIGUI_FILE = `${app.getPath('userData')}/APPCONFUI.json`

  // Defaults
  const DEFAULT_CONFIG = { 
    logsDir: '/home/cvc/telemetry/logs',
    avisoSonoro: true, 
    server: {
      ip:'127.0.0.1',
      port: 3000,
    },
    media: {
      path: '/home/cvc/_contenidos'
    },
    music: {
      path:'/home/cvc/_musica',
      volume: .9,
      type: 0
    },
    window: {
      type: 0,
      posX: 0,
      posY: 0,
      sizeX: 1280,
      sizeY: 720
    }
  }

  const DEFAULT_UI = {
    info: true,
    type: 0,
    colas: {
      historial: false,
      mensaje: false,
      destacada: 0,
      excluir: [],
    },
    colors: {
      main: '#ff0000',
      secondary: '#00ff00'
    }
  }

  if ( !(global.APPCONF = loadConfigFile(CONFIG_FILE)) )      { global.APPCONF = DEFAULT_CONFIG }
  if ( !(global.UI = loadConfigFile(CONFIGUI_FILE)) )  { global.UI = DEFAULT_UI }

/*=====  End of Preferencias  ======*/



/*=============================================
=            Menu            =
=============================================*/

  const menu = [
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
            {label:'Interfaz', accelerator: 'CmdOrCtrl+P',  click() {
              if (!configUIWin)       { configUI() } 
              else                    { configUIWin.focus() } 
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

/*=====  End of Menu  ======*/



/*=============================================
=            Funciones            =
=============================================*/

  function restart() {
    if (isLinux) {
      let exec = require('child_process').exec
      exec(restartCommandShell)
    } else {
      app.relaunch()
      app.quit()
    }
  }

  function saveConf(items, file) {
    fs.writeFileSync(file, JSON.stringify(items), 'utf8')
  }

  function loadConfigFile(file) {
    if (fs.existsSync(file)) {
      try {
        let data = JSON.parse(fs.readFileSync(file, 'utf8'))
        return data
      } catch (error) { return false }
    } else { return false}
  }

  function restore() {
    saveConf(DEFAULT_CONFIG, CONFIG_FILE)
    saveConf(DEFAULT_UI, CONFIGUI_FILE)
    restart() 
  }

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
    let windowOptions = {autoHideMenuBar: true, resizable:false, show: false, webPreferences: { enableRemoteModule: true, nodeIntegration: true}, icon: `${app.getAppPath()}/icon64.png`}
    if      (APPCONF.window.type == 0)   { windowOptions.fullscreen = true; windowOptions.resizable = true } // Fullscreen. En linux necesita resizable=true
    else if (APPCONF.window.type == 1)   { windowOptions.frame = false; windowOptions.alwaysOnTop = true } // Borderless
    appWin = new BrowserWindow(windowOptions)

    switch (APPCONF.window.type) {
      case 1: // Borderless
        appWin.setPosition( APPCONF.window.posX, APPCONF.window.posY)
      case 2: // Normal Window
        appWin.setSize(APPCONF.window.sizeX, APPCONF.window.sizeY)
      break
    }

    let tpl
    switch(UI.type) {
      case 0: // Sin colas
        tpl = '_canalcorp'
      break;
      case 1: // Derecha
        tpl = '_derecha'
      break;
      case 2: // Izquierda
        tpl = '_izquierda'
      break;
      case 3: // Abajo
        tpl = '_abajo'
      break;
    }

    appWin.loadFile(`${__dirname}/_main/${tpl}.html`)
    appWin.setTitle(appName)
    appWin.on('page-title-updated', (e)=>{ e.preventDefault()})
    Menu.setApplicationMenu( Menu.buildFromTemplate(menu) )
    appWin.show()
    appWin.on('closed', () => { logs.log('MAIN','QUIT',''); app.quit() })

    logs.log('MAIN','START','')
    //appWin.webContents.openDevTools()
  }

  function config() {
    configWin = new BrowserWindow({width: 720, height: 420, show:false, alwaysOnTop: true, webPreferences: { enableRemoteModule: true, nodeIntegration: true, parent: appWin }})
    configWin.loadFile(`${__dirname}/_config/config.html`)
    configWin.setMenu( null )
    configWin.resizable = false
    configWin.show()
    
    configWin.on('closed', () => { configWin = null })
    //configWin.webContents.openDevTools()
  }

    // Ventana de personalizacion de interfaz
    function configUI() {
      configUIWin = new BrowserWindow({width: 700, height: 500, show:false, alwaysOnTop: true, resizable: false, webPreferences: { enableRemoteModule: true, nodeIntegration: true, parent: appWin }})
      configUIWin.loadFile(`${__dirname}/_configUI/configUI.html`)
      configUIWin.setMenu( null )
      configUIWin.show()
      
      configUIWin.on('closed', () => { configUIWin = null })
      //configUIWin.webContents.openDevTools()
    }

  function configServer() {
    configWin = new BrowserWindow({width: 400, height: 550, show:false, alwaysOnTop: true, resizable: false, webPreferences: { enableRemoteModule: true, nodeIntegration: true, parent: appWin }})
    configWin.loadFile(`${__dirname}/_configServer/configServer.html`)
    configWin.setMenu( null )
    configWin.show()
    
    configWin.on('closed', () => { configWin = null })
    //configWin.webContents.openDevTools()
  }

  function about() {
    const options  = {
      type: 'info',
      buttons: ['Aceptar'],
      message: 'Canal corporativo y turnomatic digital\nComunicacion Visual Canarias 2020\nContacto: 928 67 29 81'
     }
    dialog.showMessageBox(appWin, options)
  }

/*=====  End of Ventanas  ======*/



app.on('ready', initApp)


/*=============================================
=                 IPC signals                 =
=============================================*/

ipcMain.on('saveAppConf', (e, arg) => { 
  global.APPCONF = arg
  saveConf(arg, CONFIG_FILE)
  logs.log('MAIN', 'SAVE_APPCONF', JSON.stringify(arg))
  restart()
})

ipcMain.on('saveUI', (e, arg) => { 
  global.UI = arg
  saveConf(arg, CONFIGUI_FILE)
  logs.log('MAIN', 'SAVE_UI', JSON.stringify(arg))

  //Logo cliente
  if (arg.logo) {
    const path = app.getAppPath() + '/files/'
    const file = Buffer.from(arg.logo.file, 'base64');
    fs.writeFileSync(path + arg.logo.name, file)
  }

  //Imagen de barra
  if (arg.barImg) {
    const path = app.getAppPath() + '/files/'
    const file = Buffer.from(arg.barImg.file, 'base64');
    fs.writeFileSync(path + arg.barImg.name, file)
  }
  restart()
})

ipcMain.on('saveDirDialog', (e, arg) => {
  let options
  if (arg.file) { // Abre archivo
    options = {
      title : 'Abrir archivo lista.xml', 
      defaultPath : arg.dir,
      buttonLabel : "Abrir lista",
      filters : [{name: 'lista', extensions: ['xml']}],
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
var logs = new logger(`${global.APPCONF.logsDir}/`, appName)
ipcMain.on('log', (e, arg) =>       { logs.log(arg.origin, arg.event, arg.message) })
ipcMain.on('logError', (e, arg) =>  { logs.error(arg.origin, arg.error, arg.message) })


/*=====  End of IPC signals  ======*/