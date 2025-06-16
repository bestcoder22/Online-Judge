import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import { exec as execCallback } from 'child_process';

const exec = promisify(execCallback);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputPath = path.join(__dirname, '..', 'outputs');
if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath, { recursive: true });

const TIME_LIMIT_MS = 2000;

/**
 * Runs a command with given args, feeds `input` to stdin, enforces a timeout.
 * Resolves with stdout on success, rejects with structured error on failure/timeout.
 */
function runWithInput(cmd, args, input) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args);
    let stdout = '', stderr = '', timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      proc.kill('SIGKILL');
    }, TIME_LIMIT_MS);

    proc.stdout.on('data', d => stdout += d);
    proc.stderr.on('data', d => stderr += d);
    proc.on('error', e => {
      clearTimeout(timer);
      reject({ step: 'run', errorType: 'Runtime Error', error: e.message });
    });
    proc.on('close', (code, signal) => {
      clearTimeout(timer);
      if (timedOut) {
        return reject({ step: 'run', errorType: 'Time Limit Exceeded', error: `>${TIME_LIMIT_MS}ms` });
      }
      if (signal) {
        return reject({ step: 'run', errorType: 'Runtime Error', error: `killed by ${signal}` });
      }
      if (code !== 0) {
        return reject({ step: 'run', errorType: 'Runtime Error', error: stderr || `code ${code}` });
      }
      resolve(stdout.trim());
    });

    if (input) {
      proc.stdin.write(input.toString());
    }
    proc.stdin.end();
  });
}

/**
 * Deletes the main .class file and any inner-class .class files for the given base name.
 * Swallows errors to avoid masking primary errors.
 */
function cleanupClassFiles(classDir, base) {
  try {
    const files = fs.readdirSync(classDir);
    for (const f of files) {
      // Matches "Base.class" or "Base$Inner.class", etc.
      if (f === `${base}.class` || f.startsWith(`${base}$`) && f.endsWith('.class')) {
        const full = path.join(classDir, f);
        try {
          fs.unlinkSync(full);
        } catch (e) {
          console.error(`Failed to delete class file ${full}:`, e);
        }
      }
    }
  } catch (e) {
    console.error(`Failed to read directory for cleanup at ${classDir}:`, e);
  }
}

/**
 * Executes a Java source file:
 * 1. Compiles with javac. If compilation fails, cleanup is run before rejecting.
 * 2. If compile succeeds, runs `java` for each test input:
 *    - collects { name, output } on success
 *    - collects { name, error } on runtime errors/timeouts, but continues other tests.
 * 3. Before returning results (or propagating unexpected errors), always cleans up .class files.
 *
 * @param {string} filePath - Full path to the .java source file.
 * @param {Array<{name: string, data: string}>} inputArray - Array of test cases.
 * @returns {Promise<Array<{name: string, output?: string, error?: any}>>}
 * @throws If compilation fails: rejects with { step: 'compile', errorType: 'Compilation Error', error: <message> }.
 */
export const executeJava = async (filePath, inputArray = []) => {
  const base = path.basename(filePath, '.java');
  const classDir = path.dirname(filePath);

  // 1. Compile phase
  try {
    // Quote filePath in case of spaces
    await exec(`javac "${filePath}"`);
  } catch (compileErr) {
    // Cleanup before rejecting
    cleanupClassFiles(classDir, base);

    // Extract meaningful error message
    const errMsg = compileErr.stderr || compileErr.message || String(compileErr);
    return Promise.reject({ step: 'compile', errorType: 'Compilation Error', error: errMsg });
  }

  // 2. Run tests; ensure cleanup after this block
  const results = [];
  try {
    for (const tc of inputArray) {
      try {
        const out = await runWithInput('java', ['-cp', classDir, base], tc.data);
        results.push({ name: tc.name, output: out });
      } catch (runErr) {
        // Capture runtime/timeout error for this test, but continue
        results.push({ name: tc.name, error: runErr });
      }
    }
    return results;
  } finally {
    // Cleanup after compile+run (always runs, even if unexpected exception happens above)
    cleanupClassFiles(classDir, base);
  }
};
