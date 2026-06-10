const { spawn } = require('child_process');
const net = require('net');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const npmCommand = 'npm';
const n8nCommand = 'n8n';
const shouldStartN8n =
  !process.argv.includes('--no-n8n') &&
  String(process.env.SAA_START_N8N || '').toLowerCase() !== 'false';

const children = [];
let shuttingDown = false;

function isPortOpen(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const finish = (result) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(result);
    };

    socket.setTimeout(500);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));
    socket.connect(port, host);
  });
}

async function findRunningPort(ports) {
  for (const port of ports) {
    if (await isPortOpen(port)) {
      return port;
    }
  }
  return null;
}

function writePrefixed(serviceName, chunk, output) {
  const text = chunk.toString();
  const lines = text.split(/\r?\n/);

  lines.forEach((line, index) => {
    if (!line && index === lines.length - 1) {
      return;
    }
    output.write(`[${serviceName}] ${line}\n`);
  });
}

function getSpawnTarget(command, args) {
  if (process.platform !== 'win32') {
    return { command, args };
  }

  return {
    command: process.env.ComSpec || 'cmd.exe',
    args: ['/d', '/s', '/c', [command, ...args].join(' ')]
  };
}

function startService({ name, command, args, cwd, optional = false }) {
  console.log(`[dev] starting ${name}...`);
  const target = getSpawnTarget(command, args);

  const child = spawn(target.command, target.args, {
    cwd,
    env: {
      ...process.env,
      BROWSER: 'none',
      FORCE_COLOR: process.env.FORCE_COLOR || '1'
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  children.push({ name, child });

  child.stdout.on('data', (chunk) => writePrefixed(name, chunk, process.stdout));
  child.stderr.on('data', (chunk) => writePrefixed(name, chunk, process.stderr));

  child.on('error', (error) => {
    const message = `${name} could not start: ${error.message}`;
    if (optional) {
      console.warn(`[dev] ${message}`);
      return;
    }
    console.error(`[dev] ${message}`);
    stopAll(1);
  });

  child.on('exit', (code, signal) => {
    if (shuttingDown) {
      return;
    }

    const reason = signal ? `signal ${signal}` : `code ${code}`;
    console.log(`[dev] ${name} stopped with ${reason}`);

    if (!optional && code !== 0) {
      stopAll(code || 1);
    }
  });
}

function killChild(child) {
  if (child.exitCode !== null || child.killed) {
    return;
  }

  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], {
      stdio: 'ignore'
    });
    return;
  }

  child.kill('SIGINT');
}

function stopAll(exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  console.log('\n[dev] stopping project services...');

  for (const { child } of children) {
    killChild(child);
  }

  setTimeout(() => process.exit(exitCode), 700);
}

async function main() {
  console.log('[dev] Smart Academic Assistant');
  console.log('[dev] Frontend: http://localhost:5173');
  console.log('[dev] Backend:  http://localhost:5000');
  if (shouldStartN8n) {
    console.log('[dev] n8n:      http://localhost:5678');
  }

  const backendAlreadyRunning = await isPortOpen(5000);
  if (backendAlreadyRunning) {
    console.log('[backend] already running on http://localhost:5000');
  } else {
    startService({
      name: 'backend',
      command: npmCommand,
      args: ['run', 'dev'],
      cwd: path.join(rootDir, 'backend')
    });
  }

  const frontendPort = await findRunningPort([5173, 5174, 5175, 5176, 5177]);
  if (frontendPort) {
    console.log(`[frontend] already running on http://localhost:${frontendPort}`);
  } else {
    startService({
      name: 'frontend',
      command: npmCommand,
      args: ['run', 'dev'],
      cwd: path.join(rootDir, 'frontend')
    });
  }

  if (shouldStartN8n) {
    const n8nAlreadyRunning = await isPortOpen(5678);
    if (n8nAlreadyRunning) {
      console.log('[n8n] already running on http://localhost:5678');
    } else {
      startService({
        name: 'n8n',
        command: n8nCommand,
        args: [],
        cwd: rootDir,
        optional: true
      });
    }
  }

  if (children.length === 0) {
    console.log('[dev] all services already appear to be running.');
    return;
  }

  process.on('SIGINT', () => stopAll(0));
  process.on('SIGTERM', () => stopAll(0));
}

main().catch((error) => {
  console.error(`[dev] failed: ${error.message}`);
  stopAll(1);
});
