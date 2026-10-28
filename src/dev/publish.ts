import type { APIRoute } from 'astro';
import { run, pendingChanges } from './git';

export const prerender = false;
const LOCAL = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1', 'localhost']);

// "Online zetten" button: check the build, then commit and push. Same steps as publiceer.bat.
export const POST: APIRoute = async ({ clientAddress }) => {
  if (!LOCAL.has(clientAddress)) return json({ ok: false, log: 'Online zetten kan alleen vanaf je eigen pc, niet via je telefoon.' }, 403);
  const log: string[] = [];
  const step = async (label: string, cmd: string, args: string[], shell = false) => {
    log.push(`▸ ${label}`);
    const r = await run(cmd, args, shell);
    if (r.out) log.push(r.out.split('\n').slice(-8).join('\n'));
    return r.code === 0;
  };
  const pending = await pendingChanges();
  if (pending === null) return json({ ok: false, log: 'Deze map is nog niet gekoppeld aan GitHub. Dubbelklik één keer op publiceer.bat, daarna werkt deze knop.' });
  // Half-finished merge from an older version of this button? Undo it first.
  const gitDir = (await run('git', ['rev-parse', '--git-dir'])).out || '.git';
  const { existsSync } = await import('node:fs');
  if (existsSync(`${gitDir}/rebase-merge`) || existsSync(`${gitDir}/rebase-apply`)) {
    // quit keeps the files exactly as they are (abort would roll them back)
    await step('Oude onderbroken poging opruimen', 'git', ['rebase', '--quit']);
    await run('git', ['add', '-A']);
    await run('git', ['checkout', '-q', '-B', 'main']);
  }
  if (!(await step('Site controleren', 'npm', ['run', 'build'], true))) return json({ ok: false, log: log.join('\n') + '\n\nDe site bouwt niet. Er is niets online gezet.' });
  // This folder is the truth: take the online history, then save exactly what is in the folder on top of it.
  if (!(await step('Online versie ophalen', 'git', ['fetch', 'origin', 'main']))) return json({ ok: false, log: log.join('\n') + '\n\nGeen verbinding met GitHub.' });
  await run('git', ['reset', '--soft', 'origin/main']);
  await step('Wijzigingen bundelen', 'git', ['add', '-A']);
  await run('git', ['restore', '--staged', 'package-lock.json']);
  const staged = await run('git', ['diff', '--cached', '--quiet']);
  if (staged.code === 0) return json({ ok: true, log: log.join('\n') + '\nAlles stond al online.' });
  const d = new Date();
  await step('Opslaan', 'git', ['commit', '-m', `Update via bedieningspaneel (${d.toLocaleDateString('nl-BE')} ${d.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })})`]);
  if (!(await step('Online zetten', 'git', ['push', 'origin', 'HEAD:main']))) return json({ ok: false, log: log.join('\n') + '\n\nTip: dubbelklik eens op publiceer.bat, misschien vraagt GitHub om opnieuw in te loggen.' });
  return json({ ok: true, log: log.join('\n') });
};

const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
