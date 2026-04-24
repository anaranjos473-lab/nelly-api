#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function runNodeScript(scriptPath, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [scriptPath, ...args], {
      cwd: root,
      stdio: 'inherit',
      env: process.env,
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      resolve(code || 0);
    });
  });
}

async function main() {
  const appPath = path.join(root, 'app.js');
  const testPath = path.join(root, 'test-asignador.js');

  const app = spawn(process.execPath, [appPath], {
    cwd: root,
    stdio: 'inherit',
    env: process.env,
  });

  let appExited = false;
  app.on('exit', () => {
    appExited = true;
  });

  try {
    // Dar margen al backend para inicializar listeners.
    await wait(6000);

    if (appExited) {
      throw new Error('app.js terminó antes de iniciar la prueba');
    }

    const testCode = await runNodeScript(testPath);
    if (testCode !== 0) {
      process.exitCode = testCode;
      return;
    }

    process.exitCode = 0;
  } catch (error) {
    console.error('[STRICT_ASSIGN_TEST] Error:', error.message);
    process.exitCode = 1;
  } finally {
    if (!appExited) {
      app.kill('SIGTERM');
      await wait(1000);
      if (!appExited) {
        app.kill('SIGKILL');
      }
    }
  }
}

main();
