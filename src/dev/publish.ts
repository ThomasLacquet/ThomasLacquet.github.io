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
  if (!(await step('Site controleren', 'npm', ['run', 'build'], true))) return json({ ok: false, log: log.join('\n') + '\n\nDe site bouwt niet. Er is niets online gezet.' });
  await step('Wijzigingen bundelen', 'git', ['add', '-A']);
  await run('git', ['restore', '--staged', 'package-lock.json']);
  const staged = await run('git', ['diff', '--cached', '--quiet']);
  if (staged.code !== 0) {
    const d = new Date();
    await step('Opslaan', 'git', ['commit', '-m', `Update via bedieningspaneel (${d.toLocaleDateString('nl-BE')} ${d.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })})`]);
  } else log.push('Geen nieuwe aanpassingen, ik haal wel de laatste online versie op.');
  if (!(await step('Laatste online versie ophalen', 'git', ['pull', '--rebase', '--autostash', 'origin', 'main']))) return json({ ok: false, log: log.join('\n') });
  if (!(await step('Online zetten', 'git', ['push', 'origin', 'main']))) return json({ ok: false, log: log.join('\n') + '\n\nTip: dubbelklik eens op publiceer.bat, misschien vraagt GitHub om opnieuw in te loggen.' });
  return json({ ok: true, log: log.join('\n') });
};

const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
