// All page content comes from the JSON files in /content (edited via /keystatic).
// English lives in /content/*.json, Dutch in /content/nl/*.json.
// Dutch files only supply TEXT: photos, logos, layout, links and section order always come
// from the English files, so you change those in one place.
import settings from '../../content/settings.json';
import hero from '../../content/hero.json';
import logos from '../../content/logos.json';
import experience from '../../content/experience.json';
import work from '../../content/work.json';
import speaking from '../../content/speaking.json';
import education from '../../content/education.json';
import skills from '../../content/skills.json';
import about from '../../content/about.json';
import contact from '../../content/contact.json';
import extras from '../../content/extras.json';

const en = { settings, hero, logos, experience, work, speaking, education, skills, about, contact, extras };
type Content = typeof en;

// Dutch files are optional: a missing file falls back to English.
const nlFiles = import.meta.glob('../../content/nl/*.json', { eager: true, import: 'default' }) as Record<string, any>;
const nlRaw: Record<string, any> = Object.fromEntries(
  Object.entries(nlFiles).map(([p, v]) => [p.split('/').pop()!.replace('.json', ''), v])
);

// Keys that are never translated: they always come from the English file.
const SHARED = new Set(['photo', 'logo', 'logoHeight', 'height', 'image', 'layout', 'color', 'level', 'cv', 'email', 'linkedin', 'accent', 'sections', 'theme', 'discriminant', 'style', 'photoPosition']);

// English decides the structure (how many jobs, talks, ...). Dutch fills in the text where it exists.
function merge(base: any, tr: any): any {
  if (tr === undefined || tr === null) return base;
  if (Array.isArray(base)) return base.map((b, i) => (Array.isArray(tr) ? merge(b, tr[i]) : b));
  if (base && typeof base === 'object') {
    const out: any = {};
    for (const k of Object.keys(base)) out[k] = SHARED.has(k) ? base[k] : merge(base[k], tr?.[k]);
    return out;
  }
  if (typeof base === 'string') return typeof tr === 'string' && tr.trim() !== '' ? tr : base;
  return base;
}

const nl = Object.fromEntries(Object.entries(en).map(([k, v]) => [k, merge(v, nlRaw[k])])) as Content;

// Fixed interface text (buttons, labels) per language.
const ui = {
  en: {
    nav: { experience: 'Experience', work: 'Work', speaking: 'Public speaking', education: 'Education', skills: 'Skills', about: 'Personal' } as Record<string, string>,
    contact: 'Contact', emailMe: 'Email me', downloadCv: 'Download CV (PDF)', cvShort: 'CV', linkedinProfile: 'LinkedIn profile',
    portraitOf: 'Portrait of', skip: 'Skip to content', mainNav: 'Main', howProject: 'How a project runs', studyTypes: 'Study types',
    tools: 'Tools', organisations: 'Organisations',
    skillLabels: { analysis: 'Analysis & dashboarding', ai: 'AI & new methods', also: 'Also good at', languages: 'Languages' },
    levels: { A1: 'Beginner', A2: 'Elementary', B1: 'Intermediate', B2: 'Upper intermediate', C1: 'Advanced', C2: 'Proficient' } as Record<string, string>,
    caseLabels: { question: 'Question', approach: 'Approach', outcome: 'Outcome' },
    switchLabel: 'Nederlands', switchShort: 'NL', switchHref: '/nl/', switchLang: 'nl',
    ogDescription: 'Consumer and CX research for FMCG, services and banking. Based in Leuven, Belgium.',
    personDescription: 'Quantitative research consultant, experienced in hybrid research methodologies, specialised in consumer and customer experience (CX) research for FMCG, services and banking.',
    ogLocale: 'en_BE',
  },
  nl: {
    nav: { experience: 'Ervaring', work: 'Projecten', speaking: 'Publiek spreken', education: 'Opleiding', skills: 'Vaardigheden', about: 'Persoonlijk' } as Record<string, string>,
    contact: 'Contact', emailMe: 'Mail me', downloadCv: 'Download cv (Engels, pdf)', cvShort: 'CV', linkedinProfile: 'LinkedIn-profiel',
    portraitOf: 'Portret van', skip: 'Naar de inhoud', mainNav: 'Hoofdmenu', howProject: 'Hoe een project verloopt', studyTypes: 'Soorten onderzoek',
    tools: 'Tools', organisations: 'Organisaties',
    skillLabels: { analysis: 'Analyse & dashboarding', ai: 'AI & nieuwe methodes', also: 'Ook goed in', languages: 'Talen' },
    levels: { A1: 'Beginner', A2: 'Basis', B1: 'Redelijk', B2: 'Goed', C1: 'Zeer goed', C2: 'Uitstekend' } as Record<string, string>,
    caseLabels: { question: 'Vraag', approach: 'Aanpak', outcome: 'Resultaat' },
    switchLabel: 'English', switchShort: 'EN', switchHref: '/', switchLang: 'en',
    ogDescription: 'Consumenten- en CX-onderzoek voor FMCG, diensten en banken. Gevestigd in Leuven, België.',
    personDescription: 'Kwantitatief research consultant met ervaring in hybride onderzoeksmethodes, gespecialiseerd in consumenten- en klantervaringsonderzoek (CX) voor FMCG, diensten en banken.',
    ogLocale: 'nl_BE',
  },
};

export type Lang = 'en' | 'nl';
export const langOf = (l?: string): Lang => (l === 'nl' ? 'nl' : 'en');
export const getContent = (l?: string) => {
  const lang = langOf(l);
  return { ...(lang === 'nl' ? nl : en), ui: ui[lang], lang };
};

// Kept for older imports: English content.
export { settings, hero, logos, experience, work, speaking, education, skills, about, contact, extras };

// A switch in the editor counts as ON unless it was explicitly turned off.
export const isOn = (v: unknown) => v !== false;
