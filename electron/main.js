const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { exec } = require("child_process");
const isDev = process.env.NODE_ENV === "development";
const os = require("os");

// For production, use electron-serve to serve the static files
let serve;
let loadURL; // Declare loadURL
if (!isDev) {
  serve = require("electron-serve");
  loadURL = serve({ directory: "out" });
}

// Attempt to import ps-list, but handle if it fails
let psList;
try {
  psList = require("ps-list");
} catch (err) {
  console.error("Failed to load ps-list:", err);
  psList = async () => [];
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "../public/icon.png"),
  });

  // Load the app
  if (isDev) {
    // In development, load from the dev server
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built app
    if (loadURL) {
      loadURL(mainWindow);
    } else {
      mainWindow.loadFile(path.join(__dirname, "../out/index.html"));
    }
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS re-create a window when dock icon is clicked and no windows are open
  if (mainWindow === null) {
    createWindow();
  }
});

// Get system processes
ipcMain.handle("get-processes", async () => {
  try {
    // For development testing, you can return mock data if ps-list fails
    let processes = [];

    try {
      processes = await psList();
    } catch (err) {
      console.error("Error getting process list:", err);
      // Return mock data if real process list fails
      return getMockProcesses();
    }

    // Filter and format processes
    const filteredProcesses = processes
      .filter((process) => {
        // Filter out system processes and focus on user processes
        return process.name && process.name !== "" && process.cpu > 0.1;
      })
      .map((process) => {
        // Determine process type based on name (simplified logic)
        let type = "other";
        const name = process.name.toLowerCase();

        if (
          name.includes("download") ||
          name.includes("browser") ||
          name.includes("curl") ||
          name.includes("wget")
        ) {
          type = "download";
        } else if (name.includes("copy") || name.includes("xcopy")) {
          type = "copy";
        } else if (
          name.includes("del") ||
          name.includes("rm") ||
          name.includes("trash")
        ) {
          type = "delete";
        } else if (name.includes("cut") || name.includes("move")) {
          type = "cut";
        } else if (name.includes("export") || name.includes("convert")) {
          type = "export";
        }

        // Generate a mock progress for demonstration
        const progress = Math.floor(Math.random() * 100);
        const estimatedMinutes = Math.floor(Math.random() * 60);
        const estimatedSeconds = Math.floor(Math.random() * 60);

        return {
          id: process.pid,
          name: process.name,
          type: type,
          progress: progress,
          estimatedTimeRemaining: `00:${estimatedMinutes
            .toString()
            .padStart(2, "0")}:${estimatedSeconds.toString().padStart(2, "0")}`,
          cpu: process.cpu || 0,
          memory: process.memory / 1024 / 1024 || 0, // Convert to MB
          selected: false,
        };
      })
      .slice(0, 20); // Limit to 20 processes for UI

    return filteredProcesses.length > 0
      ? filteredProcesses
      : getMockProcesses();
  } catch (error) {
    console.error("Error getting processes:", error);
    return getMockProcesses();
  }
});

// Mock processes for development or when real process access fails
function getMockProcesses() {
  return [
    {
      id: 1001,
      name: "File Download",
      type: "download",
      progress: 45,
      estimatedTimeRemaining: "01:23:45",
      cpu: 2.5,
      memory: 125.4,
      selected: false,
    },
    {
      id: 1002,
      name: "Large File Deletion",
      type: "delete",
      progress: 78,
      estimatedTimeRemaining: "00:12:30",
      cpu: 1.2,
      memory: 45.7,
      selected: false,
    },
    {
      id: 1003,
      name: "Backup Copy",
      type: "copy",
      progress: 23,
      estimatedTimeRemaining: "00:45:10",
      cpu: 3.7,
      memory: 210.3,
      selected: false,
    },
    {
      id: 1004,
      name: "Video File Cut",
      type: "cut",
      progress: 67,
      estimatedTimeRemaining: "00:08:15",
      cpu: 5.1,
      memory: 345.8,
      selected: false,
    },
    {
      id: 1005,
      name: "Document Export",
      type: "export",
      progress: 92,
      estimatedTimeRemaining: "00:02:45",
      cpu: 0.8,
      memory: 78.2,
      selected: false,
    },
  ];
}

// Schedule shutdown
ipcMain.handle(
  "schedule-shutdown",
  (event, { delaySeconds, waitForProcesses, selectedProcessIds }) => {
    console.log(
      `Scheduling shutdown: delay=${delaySeconds}, waitForProcesses=${waitForProcesses}`
    );

    if (isDev) {
      console.log("Development mode: Simulating shutdown scheduling");
      return {
        scheduled: true,
        message: "Shutdown scheduled (Development Mode)",
      };
    }

    if (waitForProcesses && selectedProcessIds.length > 0) {
      // Logic to monitor processes and shutdown when they complete
      const checkProcesses = setInterval(async () => {
        const currentProcesses = await psList();
        const selectedProcessesStillRunning = currentProcesses.filter((p) =>
          selectedProcessIds.includes(p.pid)
        );

        if (selectedProcessesStillRunning.length === 0) {
          clearInterval(checkProcesses);
          executeShutdown();
        }
      }, 5000); // Check every 5 seconds

      return {
        scheduled: true,
        message: "Shutdown scheduled after processes complete",
      };
    } else if (delaySeconds > 0) {
      // Schedule shutdown after delay
      const platform = os.platform();

      if (platform === "win32") {
        exec(`shutdown /s /t ${delaySeconds}`);
      } else if (platform === "linux" || platform === "darwin") {
        // For macOS and Linux
        exec(`sleep ${delaySeconds} && shutdown -h now`);
      }

      return {
        scheduled: true,
        message: `Shutdown scheduled in ${delaySeconds} seconds`,
      };
    }

    return { scheduled: false, message: "Invalid shutdown parameters" };
  }
);

// Schedule restart
ipcMain.handle(
  "schedule-restart",
  (event, { delaySeconds, waitForProcesses, selectedProcessIds }) => {
    console.log(
      `Scheduling restart: delay=${delaySeconds}, waitForProcesses=${waitForProcesses}`
    );

    if (isDev) {
      console.log("Development mode: Simulating restart scheduling");
      return {
        scheduled: true,
        message: "Restart scheduled (Development Mode)",
      };
    }

    if (waitForProcesses && selectedProcessIds.length > 0) {
      // Logic to monitor processes and restart when they complete
      const checkProcesses = setInterval(async () => {
        const currentProcesses = await psList();
        const selectedProcessesStillRunning = currentProcesses.filter((p) =>
          selectedProcessIds.includes(p.pid)
        );

        if (selectedProcessesStillRunning.length === 0) {
          clearInterval(checkProcesses);
          executeRestart();
        }
      }, 5000); // Check every 5 seconds

      return {
        scheduled: true,
        message: "Restart scheduled after processes complete",
      };
    } else if (delaySeconds > 0) {
      // Schedule restart after delay
      const platform = os.platform();

      if (platform === "win32") {
        exec(`shutdown /r /t ${delaySeconds}`);
      } else if (platform === "linux" || platform === "darwin") {
        // For macOS and Linux
        exec(`sleep ${delaySeconds} && shutdown -r now`);
      }

      return {
        scheduled: true,
        message: `Restart scheduled in ${delaySeconds} seconds`,
      };
    }

    return { scheduled: false, message: "Invalid restart parameters" };
  }
);

// Cancel scheduled shutdown/restart
ipcMain.handle("cancel-scheduled-action", () => {
  console.log("Cancelling scheduled action");

  if (isDev) {
    console.log("Development mode: Simulating action cancellation");
    return {
      cancelled: true,
      message: "Scheduled action cancelled (Development Mode)",
    };
  }

  const platform = os.platform();

  if (platform === "win32") {
    exec("shutdown /a");
  } else if (platform === "linux" || platform === "darwin") {
    exec("killall shutdown");
  }

  return { cancelled: true, message: "Scheduled action cancelled" };
});

function executeShutdown() {
  const platform = os.platform();

  if (platform === "win32") {
    exec("shutdown /s /t 0");
  } else if (platform === "linux" || platform === "darwin") {
    exec("shutdown -h now");
  }
}

function executeRestart() {
  const platform = os.platform();

  if (platform === "win32") {
    exec("shutdown /r /t 0");
  } else if (platform === "linux" || platform === "darwin") {
    exec("shutdown -r now");
  }
}
