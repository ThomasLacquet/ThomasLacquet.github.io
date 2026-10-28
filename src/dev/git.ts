import { execFile } from 'node:child_process';

export const run = (cmd: string, args: string[], shell = false) =>
  new Promise<{ code: number; out: string }>((resolve) => {
    execFile(cmd, args, { cwd: process.cwd(), shell, windowsHide: true, maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
      resolve({ code: err ? (typeof (err as any).code === 'number' ? (err as any).code : 1) : 0, out: `${stdout}${stderr}`.trim() });
    });
  });

// Files changed on this computer that are not online yet (ignores the npm lock file).
export async function pendingChanges() {
  const r = await run('git', ['status', '--porcelain']);
  if (r.code !== 0) return null; // no git yet: run publiceer.bat once
  return r.out.split('\n').filter((l) => l.trim() && !l.endsWith('package-lock.json')).map((l) => l.replace(/^\s*\S+\s+/, ''));
}
