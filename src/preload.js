const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld (
    "ipc", {
        get: {
            appConf: () => ipcRenderer.sendSync('getGlobal', 'appConf'),
            path: (dir) => ipcRenderer.sendSync('getPath', dir)
        },
        save: {
            appConf: (config, files=[]) => ipcRenderer.send('saveAppConf', config, files),
        },
        dialog: {
            saveDir: (opts) => ipcRenderer.sendSync('saveDirDialog', opts)
        },
        logger: {
            std: (data) => ipcRenderer.send('log', data),
            error: (data) => ipcRenderer.send('logError', data)
        },
        win: {
            close: (win) => ipcRenderer.send('closeWindow', win)
        },
        sys: {
            shellExec: (cmd) => ipcRenderer.send('execShell', cmd)
        }
    }
)