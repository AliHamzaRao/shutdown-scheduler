# Shutdown Scheduler

A sleek desktop application for scheduling system shutdowns and restarts with process monitoring capabilities.

![Shutdown Scheduler Screenshot](./screenshots/app-screenshot.png)

## Features

- **Custom Timer Settings**: Schedule shutdowns/restarts with precise hours, minutes, and seconds
- **Quick Presets**: Convenient preset buttons for common durations (15min, 30min, 1hr, 2hrs)
- **Process Monitoring**: View active system processes with progress indicators
- **Process-Based Scheduling**: Wait for specific processes to complete before shutdown/restart
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Dark/Light Theme**: Toggle between dark and light modes

## Installation

### Windows

1. Download the latest `Shutdown-Scheduler-Setup-1.0.0.exe` from the [Releases](https://github.com/AliHamzaRao/shutdown-scheduler/releases) page
2. Run the installer and follow the on-screen instructions
3. The application will be installed and a desktop shortcut will be created

### macOS

1. Download the latest `Shutdown-Scheduler-1.0.0.dmg` from the [Releases](https://github.com/AliHamzaRao/shutdown-scheduler/releases) page
2. Open the DMG file
3. Drag the Shutdown Scheduler app to your Applications folder
4. Open the app from your Applications folder or Launchpad

### Linux

#### Debian/Ubuntu (DEB package)

1. Download the latest `shutdown-scheduler_1.0.0_amd64.deb` from the [Releases](https://github.com/AliHamzaRao/shutdown-scheduler/releases) page
2. Install using:
   ```bash
   sudo dpkg -i shutdown-scheduler_1.0.0_amd64.deb
   sudo apt-get install -f # Install dependencies if needed
   ```
