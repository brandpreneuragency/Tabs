const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
	secureKey: {
		get: () => ipcRenderer.invoke('secure-key:get'),
		set: (apiKey) => ipcRenderer.invoke('secure-key:set', apiKey),
		remove: () => ipcRenderer.invoke('secure-key:remove')
	},
	ai: {
		generate: (payload) => ipcRenderer.invoke('ai:generate', payload)
	}
});
