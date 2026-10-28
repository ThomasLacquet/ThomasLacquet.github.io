// Local control panel at http://localhost:4321/start. Only exists while `npm run dev` runs:
// it is never part of the published site.
export default function devDashboard() {
  return {
    name: 'dev-dashboard',
    hooks: {
      'astro:config:setup': ({ injectRoute, command }) => {
        if (command !== 'dev') return;
        injectRoute({ pattern: '/start', entrypoint: new URL('./start.astro', import.meta.url), prerender: false });
        injectRoute({ pattern: '/start/publish', entrypoint: new URL('./publish.ts', import.meta.url), prerender: false });
      },
    },
  };
}
