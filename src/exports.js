const DEFAULT_CONFIG = {
  logsDir: '/home/cvc/telemetry/apps',
  deployDir: '/home/cvc/deploy',
  ting: 1,
  tingRules: [],
  debug: {
    autoOpenDevTools: false
  },
  server: {
    ip:'127.0.0.1',
    port: 3000,
  },
  media: {
    volume: 1,
    transitionDuration: 0.6
  },
  music: {
    volume: .9,
    type: 0
  },
  window: {
    type: 0,
    posX: 0,
    posY: 0,
    width: 1280,
    height: 720,
    alwaysOnTop: true
  },
  interface: {
    infoBar: true,
    clock: true,
    type: 0,
    colas: {
      historial: false,
      mensaje: false,
      destacada: 0,
      excluir: [],
      BGtype: 1,
    },
    colors: {
      app: '#FFFFFF',
      main: '#000000',
      secondary: '#739E10',
      aside: '#6B6B6B'
    }
  }
}

exports.DEFAULT_CONFIG = DEFAULT_CONFIG