const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electron", {
  // Process management
  getProcesses: () => ipcRenderer.invoke("get-processes"),

  // Shutdown/restart scheduling
  scheduleShutdown: (options) =>
    ipcRenderer.invoke("schedule-shutdown", options),
  scheduleRestart: (options) => ipcRenderer.invoke("schedule-restart", options),
  cancelScheduledAction: () => ipcRenderer.invoke("cancel-scheduled-action"),

  // System info
  platform: process.platform,
});
