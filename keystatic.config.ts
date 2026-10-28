// Editor for the site. Open http://localhost:4321/keystatic while `npm run dev` runs.
// Every page section is a "singleton" stored as a JSON file in /content.
import { config, fields, singleton } from '@keystatic/core';
// The editor menu follows the order of the sections on the page (Settings → Sections on the page).
import site from './content/settings.json';

const text = (label: string, description?: string) => fields.text({ label, description });
const longText = (label: string, description?: string) => fields.text({ label, description, multiline: true });
const list = (label: string, itemLabel = 'Item') =>
  fields.array(fields.text({ label: itemLabel }), { label, itemLabel: (p) => p.value || itemLabel });
const image = (label: string, directory = 'public/img', publicPath = '/img/') =>
  fields.image({ label, directory, publicPath, description: 'JPG, PNG or WebP. Keep it under ~300 KB.' });

// Each section gets its own image folder, so files from different sections never overwrite each other.
const logo = (section: string) => ({
  logo: fields.image({ label: 'Logo (transparent PNG/WebP)', directory: `public/logos/${section}`, publicPath: `/logos/${section}/` }),
  logoHeight: fields.integer({ label: 'Logo height (px)', defaultValue: 32, description: 'Tune so logos look equally heavy. 24–44 works well.' }),
});


// Layout controls shown per section under "Layout".
const opt = (label: string, options: [string, string][], defaultValue: string, description?: string) =>
  fields.select({ label, description, defaultValue, options: options.map(([value, l]) => ({ value, label: l })) });
const spacing = () => opt('Space above this section', [['compact', 'Compact (default)'], ['normal', 'Normal'], ['spacious', 'Spacious']], 'compact');
const photoLayout = (defaultPosition: string, defaultAlign: string) => ({
  photoPosition: opt('Photo position', [['left', 'Left of the text'], ['right', 'Right of the text'], ['top', 'Above the text'], ['bottom', 'Below the text']], defaultPosition),
  photoSize: opt('Photo size', [['s', 'Small'], ['m', 'Medium'], ['l', 'Large']], 'm'),
  photoAlign: opt('Photo height next to the text', [['top', 'Higher (top)'], ['center', 'Middle'], ['bottom', 'Lower (bottom)']], defaultAlign, 'Only when the photo is left or right of the text.'),
  photoFocus: opt('Part of the photo to keep in view', [['top', 'Top'], ['center', 'Centre'], ['bottom', 'Bottom']], 'center', 'Shifts the crop up or down.'),
});
// On/off switch for one part of a section (default: shown).
const show = (label: string, description?: string) => fields.checkbox({ label, description, defaultValue: true });
const layout = (extra: Record<string, any> = {}) => fields.object({ spacing: spacing(), ...extra }, { label: 'Layout' });

const sectionOptions = [
  { label: 'Logos', value: 'logos' },
  { label: 'Experience', value: 'experience' },
  { label: 'Selected work (cases)', value: 'work' },
  { label: 'Public speaking', value: 'speaking' },
  { label: 'Education', value: 'education' },
  { label: 'Skills', value: 'skills' },
  { label: 'Personal', value: 'about' },
  { label: 'Own section 1', value: 'extra1' },
  { label: 'Own section 2', value: 'extra2' },
  { label: 'Own section 3', value: 'extra3' },
] as const;

const header = { eyebrow: text('Small label above the title'), title: text('Section title') };

// Dutch copies of every section (content/nl/*.json). Only the TEXT there is used on /nl/;
// photos, logos, layout and section order always come from the English version.
const KEYS = ['settings', 'hero', 'logos', 'experience', 'work', 'speaking', 'education', 'skills', 'about', 'contact', 'extras'] as const;
// Page order: hero first, then the sections in the order of settings.json, contact last.
const onPage: string[] = ['hero'];
for (const id of (site as any).sections ?? []) {
  const key = /^extra[1-3]$/.test(id) ? 'extras' : id;
  if (!onPage.includes(key)) onPage.push(key);
}
onPage.push('contact');
const notOnPage = ['logos', 'work', 'experience', 'speaking', 'education', 'skills', 'about', 'extras'].filter((k) => !onPage.includes(k));

// Numbered labels in page order, plus the Dutch copies.
function arrange(s: Record<string, any>) {
  onPage.forEach((k, i) => { if (s[k]) s[k] = singleton({ ...s[k], label: `${i + 1}. ${s[k].label}` }); });
  notOnPage.forEach((k) => { if (s[k]) s[k] = singleton({ ...s[k], label: `${s[k].label} (hidden)` }); });
  const nl = Object.fromEntries(
    Object.entries(s).map(([k, v]) => [`${k}_nl`, singleton({ ...v, label: `${v.label.replace(' (hidden)', '')} · NL`, path: `content/nl/${k}` })])
  );
  return { ...s, ...nl };
}

export default config({
  storage: { kind: 'local' },
  ui: {
    brand: { name: 'Thomas Lacquet · site' },
    navigation: {
      'Instellingen': ['settings'],
      'Op de pagina, van boven naar onder': onPage as any,
      'Niet op de pagina (zet aan via Instellingen)': notOnPage as any,
      'Nederlands (alleen tekst)': ['settings_nl', ...onPage.map((k) => `${k}_nl`)] as any,
    },
  },
  singletons: arrange({
    settings: singleton({
      label: 'Settings: order, look & Google',
      path: 'content/settings',
      format: { data: 'json' },
      schema: {
        name: text('Your name'),
        role: text('Job title'),
        employer: text('Employer'),
        location: text('Location'),
        email: text('Email'),
        linkedin: text('LinkedIn URL'),
        cv: text('CV download', 'Your CV is made automatically from the text on this site (max. 2 A4, English) every time you publish. Keep "/Thomas-Lacquet-CV.pdf" to show the Download CV buttons; empty this field to hide them. Preview: localhost:4321/cv/'),
        theme: fields.object(
          {
            accent: opt('Accent colour', [['#1F5F99', 'Blue (default)'], ['#1D6670', 'Petrol'], ['#2E6B4F', 'Green'], ['#8A2E3B', 'Burgundy'], ['#5B3A73', 'Plum'], ['#9A4B1C', 'Rust'], ['#16202B', 'Ink (no colour)']], '#1F5F99', 'Links, labels and highlights. Every option is readable on every background.'),
            background: opt('Page background', [['warm', 'Warm paper (default)'], ['white', 'White'], ['cool', 'Cool grey']], 'warm'),
            textSize: opt('Text size', [['s', 'Smaller'], ['m', 'Normal'], ['l', 'Larger']], 'm'),
            titleSize: opt('Title size', [['compact', 'Compact'], ['normal', 'Normal'], ['big', 'Big']], 'normal'),
            showStickyContact: show('Floating contact bar while scrolling'),
            showLanguageSwitch: show('NL/EN switch in the menu'),
          },
          { label: 'Look & site-wide options' }
        ),
        sections: fields.array(
          fields.select({ label: 'Section', options: sectionOptions, defaultValue: 'experience' }),
          {
            label: 'Sections on the page',
            description: 'Drag to reorder. Remove a row to hide that section. Hero is always first, contact always last.',
            itemLabel: (p) => sectionOptions.find((o) => o.value === p.value)?.label ?? p.value,
          }
        ),
        seoTitle: text('Google title', 'Shown as the blue link in Google. Keep it under ~65 characters.'),
        seoDescription: longText('Google description', 'Shown under the link in Google. Keep it under ~160 characters.'),
      },
    }),

    hero: singleton({
      label: 'Top (name, intro, buttons)',
      path: 'content/hero',
      format: { data: 'json' },
      schema: {
        photo: image('Profile photo', 'public/img/hero', '/img/hero/'),
        roleLine: text('Line under your name'),
        lead: longText('Intro sentence'),
        claim: text('Big sentence (start)', 'The rotating words follow this text, e.g. "I help clients decide with"'),
        claimWords: list('Rotating words', 'Word'),
        metaLine: list('Grey line under the sentence', 'Item'),
        tools: list('Tools (pills next to the buttons)', 'Tool'),
        segments: fields.array(
          fields.object({
            name: text('Segment name', 'Short, e.g. "Research". Shown as a small label above the cluster.'),
            color: opt('Colour', [['blue', 'Blue'], ['ink', 'Dark'], ['ochre', 'Ochre'], ['green', 'Green']], 'blue'),
            items: fields.array(
              fields.object({
                name: text('Item', 'A role, lecture or degree. Shown as one dot; the name itself is not shown.'),
              }),
              { label: 'Items in this segment (max 4)', itemLabel: (p) => p.fields.name.value || 'Item' }
            ),
          }),
          {
            label: 'Background clusters (max 4 segments)',
            description: 'Your CV as a segmentation, drawn faintly behind the hero. Each item becomes a dot in its cluster.',
            itemLabel: (p) => p.fields.name.value || 'Segment',
          }
        ),
        layout: layout({
          avatarSize: opt('Profile photo size', [['s', 'Small'], ['m', 'Medium'], ['l', 'Large']], 'm'),
          showPhoto: show('Show profile photo'),
          showClaim: show('Show the big sentence with rotating words'),
          showMeta: show('Show the grey line under the sentence'),
          showLinkedIn: show('Show LinkedIn button'),
          background: opt('Background', [['charts', 'Chart changes with the rotating word'], ['clusters', 'Only the clusters'], ['none', 'None']], 'charts', 'Each study type gets its classic chart (JAR, purchase intent, funnel, clusters, tracker, NPS, key drivers). Phones always show only the faint clusters.'),
        }),
      },
    }),

    logos: singleton({
      label: 'Logos',
      path: 'content/logos',
      format: { data: 'json' },
      schema: {
        label: text('Small label'),
        items: fields.array(
          fields.object({
            name: text('Organisation'),
            logo: image('Logo (transparent PNG/WebP)', 'public/logos/strip', '/logos/strip/'),
            height: fields.integer({ label: 'Display height (px)', defaultValue: 32, description: 'Tune so logos look equally heavy. 26–44 works well.' }),
          }),
          { label: 'Logos', itemLabel: (p) => p.fields.name.value || 'Logo' }
        ),
      },
    }),

    experience: singleton({
      label: 'Experience',
      path: 'content/experience',
      format: { data: 'json' },
      schema: {
        ...header,
        layout: layout({
          showLogos: show('Show company logos'),
          showSteps: show('Show the 6 project steps (Haystack)'),
          showDataScience: show('Show the data science card (Haystack)'),
          showSectors: show('Show sectors and study-type tags (Haystack)'),
          showTimeline: show('Show the timeline line on the left'),
        }),
        haystack: fields.object(
          {
            period: text('Period'),
            title: text('Job title'),
            company: text('Company'),
            ...logo('experience'),
            researchTitle: text('Title of your research role', 'e.g. "Quantitative researcher"'),
            intro: longText('Intro (research role)'),
            steps: fields.array(
              fields.object({ name: text('Step'), what: text('Short explanation') }),
              { label: 'Project steps', itemLabel: (p) => p.fields.name.value || 'Step' }
            ),
            note: longText('Note under the steps (sectors)'),
            studyTypes: list('Study types (tags under the steps)', 'Study type'),
            panelLabel: text('Innovation role: title', 'e.g. "Data science & innovation team"'),
            panelTitle: text('Innovation role: subtitle (not shown at the moment)'),
            panelText: longText('Panel: text'),
            panelTags: list('Innovation role: tools you use', 'Write "Tool → what it gives", e.g. "AI tools → faster workflows"'),
            radarLabel: text('Innovation role: line above the trends', 'e.g. "Keeping up with the latest innovations, like:"'),
            radar: list('Innovation role: trends you follow', 'Trend'),
          },
          { label: 'Current job (Haystack)' }
        ),
        jobs: fields.array(
          fields.object({
            period: text('Period'),
            title: text('Job title'),
            company: text('Company / context'),
            ...logo('experience'),
            text: longText('Description'),
            items: fields.array(
              fields.object({ title: text('Title'), ...logo('experience'), text: longText('Text') }),
              { label: 'Sub-items (optional)', itemLabel: (p) => p.fields.title.value || 'Item' }
            ),
          }),
          { label: 'Earlier jobs', itemLabel: (p) => `${p.fields.title.value} — ${p.fields.period.value}` }
        ),
      },
    }),

    work: singleton({
      label: 'Selected work (cases)',
      path: 'content/work',
      format: { data: 'json' },
      schema: {
        ...header,
        intro: longText('Intro'),
        cases: fields.array(
          fields.object({
            meta: text('Sector · year'),
            title: text('Title'),
            question: longText('Question'),
            approach: longText('Approach'),
            outcome: longText('Outcome'),
            tags: list('Tags', 'Tag'),
            image: image('Image (chart, dashboard…)', 'public/img/work', '/img/work/'),
            placeholder: text('Placeholder text when there is no image'),
          }),
          { label: 'Cases', itemLabel: (p) => p.fields.title.value || 'Case' }
        ),
      },
    }),

    speaking: singleton({
      label: 'Public speaking',
      path: 'content/speaking',
      format: { data: 'json' },
      schema: {
        ...header,
        layout: layout({ ...photoLayout('left', 'top'), showPhoto: show('Show main photo'), showCaption: show('Show photo caption'), showLogos: show('Show logos'), showBadges: show('Show badges (Yearly, 2024, ...)'), showTalkImages: show('Show images inside talks') }),
        intro: longText('Intro'),
        photo: image('Main photo', 'public/img/speaking', '/img/speaking/'),
        photoAlt: text('Photo description (for screen readers and Google)'),
        photoCaption: text('Photo caption'),
        talks: fields.array(
          fields.object({
            title: text('Title'),
            text: longText('Text'),
            badge: text('Badge (e.g. Yearly or a year)'),
            ...logo('speaking'),
            image: image('Image (optional)', 'public/img/speaking', '/img/speaking/'),
          }),
          { label: 'Lectures & talks', itemLabel: (p) => p.fields.title.value || 'Talk' }
        ),
      },
    }),

    education: singleton({
      label: 'Education',
      path: 'content/education',
      format: { data: 'json' },
      schema: {
        ...header,
        layout: layout({ showLogos: show('Show school logos'), showText: show('Show descriptions'), showBullets: show('Show bullet points') }),
        items: fields.array(
          fields.object({
            period: text('Period'),
            title: text('Degree'),
            school: text('School'),
            ...logo('education'),
            text: longText('Description'),
            bullets: list('Bullet points', 'Point'),
          }),
          { label: 'Education', itemLabel: (p) => p.fields.title.value || 'Degree' }
        ),
      },
    }),

    skills: singleton({
      label: 'Skills',
      path: 'content/skills',
      format: { data: 'json' },
      schema: {
        ...header,
        layout: layout({ showTools: show('Show analysis & dashboarding'), showAi: show('Show AI & new methods'), showAlso: show('Show "Also good at"'), showLanguages: show('Show languages') }),
        tools: list('Analysis & dashboarding', 'Tool'),
        ai: list('AI & new methods', 'Item'),
        also: list('Also good at', 'Skill'),
        languages: fields.array(
          fields.object({
            name: text('Language'),
            level: fields.select({
              label: 'CEFR level',
              defaultValue: 'B2',
              options: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((l) => ({ label: l, value: l })),
            }),
          }),
          { label: 'Languages', itemLabel: (p) => `${p.fields.name.value} (${p.fields.level.value})` }
        ),
      },
    }),

    about: singleton({
      label: 'Personal (about)',
      path: 'content/about',
      format: { data: 'json' },
      schema: { ...header, layout: layout({ ...photoLayout('right', 'center'), showPhoto: show('Show photo') }), photo: image('Photo (optional)', 'public/img/about', '/img/about/'), photoAlt: text('Photo description (for screen readers and Google)'), paragraphs: fields.array(fields.text({ label: 'Paragraph', multiline: true }), { label: 'Paragraphs', itemLabel: (p) => p.value.slice(0, 60) || 'Paragraph' }) },
    }),

    contact: singleton({
      label: 'Contact',
      path: 'content/contact',
      format: { data: 'json' },
      schema: { ...header, layout: layout({ showEmail: show('Show email'), showLinkedIn: show('Show LinkedIn') }), text: longText('Text') },
    }),

    // Up to 3 sections of your own, built from blocks. Place them via Settings → "Sections on the page" → "Own section 1/2/3".
    extras: singleton({
      label: 'Own sections (blocks)',
      path: 'content/extras',
      format: { data: 'json' },
      schema: {
        sections: fields.array(
          fields.object({
            navLabel: text('Name in the menu', 'Short, e.g. "Recommendations". Leave empty to keep it out of the menu.'),
            eyebrow: text('Small label above the title'),
            title: text('Section title'),
            intro: longText('Intro (optional)'),
            layout: layout({ band: opt('Background', [['none', 'Same as page'], ['band', 'Light band'], ['sand', 'Sand']], 'none') }),
            blocks: fields.blocks(
              {
                text: { label: 'Text', schema: fields.object({ paragraphs: fields.array(fields.text({ label: 'Paragraph', multiline: true }), { label: 'Paragraphs', itemLabel: (p) => p.value.slice(0, 50) || 'Paragraph' }) }) },
                textPhoto: {
                  label: 'Text with photo',
                  schema: fields.object({
                    paragraphs: fields.array(fields.text({ label: 'Paragraph', multiline: true }), { label: 'Paragraphs', itemLabel: (p) => p.value.slice(0, 50) || 'Paragraph' }),
                    photo: image('Photo', 'public/img/extras', '/img/extras/'),
                    photoAlt: text('Photo description (for screen readers and Google)'),
                    photoPosition: opt('Photo position', [['right', 'Right of the text'], ['left', 'Left of the text']], 'right'),
                  }),
                },
                list: {
                  label: 'List',
                  schema: fields.object({
                    title: text('Title above the list (optional)'),
                    style: opt('Style', [['bullets', 'Bullets'], ['checks', 'Check marks'], ['numbers', 'Numbers'], ['chips', 'Tags']], 'bullets'),
                    items: list('Items', 'Item'),
                  }),
                },
                quotes: {
                  label: 'Quotes / recommendations',
                  schema: fields.array(
                    fields.object({ quote: longText('Quote'), name: text('Name'), role: text('Role and company') }),
                    { label: 'Quotes', itemLabel: (p) => p.fields.name.value || 'Quote' }
                  ),
                },
                cards: {
                  label: 'Cards',
                  schema: fields.array(
                    fields.object({ meta: text('Small label (optional)', 'e.g. a year or a sector'), title: text('Title'), text: longText('Text') }),
                    { label: 'Cards', itemLabel: (p) => p.fields.title.value || 'Card' }
                  ),
                },
              },
              { label: 'Blocks', description: 'Add blocks in the order you want them on the page.' }
            ),
          }),
          { label: 'Own sections (max 3)', description: 'Section 1 = "Own section 1" in Settings → Sections on the page.', itemLabel: (p) => p.fields.title.value || 'Section' }
        ),
      },
    }),
  }),
});
