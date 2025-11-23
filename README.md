## node_modules file deleted because its a huge file 

## Sandbox Desktop App

An Electron-based controller for the Studyjam sandbox. It brings the compose stack up/down, performs full resets, and shows live logs so you can monitor the isolated browser environment.

## Quick start

```bash
cd desktop-app
npm install
npm start
```
This launches the Electron shell. Use the buttons to start, stop, or reset the sandbox. The log viewer pulls the latest `docker compose` logs so you can watch browser/proxy traffic in real time.
