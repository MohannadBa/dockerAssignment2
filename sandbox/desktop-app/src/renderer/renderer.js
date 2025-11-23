const statusText = document.getElementById('statusText');
const logsOutput = document.getElementById('logsOutput');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const resetBtn = document.getElementById('resetBtn');
const refreshLogsBtn = document.getElementById('refreshLogsBtn');

function setLoading(element, isLoading) {
  if (isLoading) {
    element.disabled = true;
    element.dataset.originalText = element.textContent;
    element.textContent = 'Working...';
  } else if (element.dataset.originalText) {
    element.textContent = element.dataset.originalText;
    element.disabled = false;
    delete element.dataset.originalText;
  }
}

async function updateStatus() {
  statusText.textContent = 'Fetching...';
  try {
    const status = await window.sandbox.status();
    statusText.textContent = status || 'No services running.';
  } catch (error) {
    statusText.textContent = `Failed to fetch status:\n${error.message}`;
  }
}

async function updateLogs() {
  logsOutput.textContent = 'Fetching logs...';
  try {
    const logs = await window.sandbox.logs();
    logsOutput.textContent = logs || 'No recent logs.';
  } catch (error) {
    logsOutput.textContent = `Failed to fetch logs:\n${error.message}`;
  }
}

async function handleCommand(button, command) {
  setLoading(button, true);
  try {
    await command();
    await Promise.all([updateStatus(), updateLogs()]);
  } catch (error) {
    window.sandbox.showError(error.message);
  } finally {
    setLoading(button, false);
  }
}

startBtn.addEventListener('click', () =>
  handleCommand(startBtn, () => window.sandbox.start())
);
stopBtn.addEventListener('click', () =>
  handleCommand(stopBtn, () => window.sandbox.stop())
);
resetBtn.addEventListener('click', () =>
  handleCommand(resetBtn, () => window.sandbox.reset())
);
refreshLogsBtn.addEventListener('click', updateLogs);

updateStatus();
updateLogs();

