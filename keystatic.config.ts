// Editor for the site. Open http://localhost:4321/keystatic while `npm run dev` runs.
// Every page section is a "singleton" stored as a JSON file in /content.
import { config, fields, singleton } from '@keystatic/core';

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
const spacing = () => opt('Space above this section', [['compact', 'Compact'], ['normal', 'Normal'], ['spacious', 'Spacious']], 'normal');
const photoLayout = (defaultPosition: string, defaultAlign: string) => ({
  photoPosition: opt('Photo position', [['left', 'Left of the text'], ['right', 'Right of the text'], ['top', 'Above the text'], ['bottom', 'Below the text']], defaultPosition),
  photoSize: opt('Photo size', [['s', 'Small'], ['m', 'Medium'], ['l', 'Large']], 'm'),
  photoAlign: opt('Photo height next to the text', [['top', 'Higher (top)'], ['center', 'Middle'], ['bottom', 'Lower (bottom)']], defaultAlign, 'Only when the photo is left or right of the text.'),
  photoFocus: opt('Part of the photo to keep in view', [['top', 'Top'], ['center', 'Centre'], ['bottom', 'Bottom']], 'center', 'Shifts the crop up or down.'),
});
const layout = (extra: Record<string, any> = {}) => fields.object({ spacing: spacing(), ...extra }, { label: 'Layout' });

const sectionOptions = [
  { label: 'Logos', value: 'logos' },
  { label: 'Experience', value: 'experience' },
  { label: 'Selected work (cases)', value: 'work' },
  { label: 'Speaking & teaching', value: 'speaking' },
  { label: 'Education', value: 'education' },
  { label: 'Skills', value: 'skills' },
  { label: 'About', value: 'about' },
] as const;

const header = { eyebrow: text('Small label above the title'), title: text('Section title') };

// Dutch copies of every section (content/nl/*.json). Only the TEXT there is used on /nl/;
// photos, logos, layout and section order always come from the English version.
const KEYS = ['settings', 'hero', 'logos', 'experience', 'work', 'speaking', 'education', 'skills', 'about', 'contact'] as const;
function withDutch(s: Record<string, any>) {
  const nl = Object.fromEntries(
    Object.entries(s).map(([k, v]) => [`${k}_nl`, singleton({ ...v, label: `${v.label} · NL`, path: `content/nl/${k}` })])
  );
  return { ...s, ...nl };
}

export default config({
  storage: { kind: 'local' },
  ui: {
    brand: { name: 'Thomas Lacquet · site' },
    navigation: {
      'Whole site': ['settings'],
      'Top of the page': ['hero', 'logos'],
      Sections: ['experience', 'work', 'speaking', 'education', 'skills', 'about', 'contact'],
      'Nederlands (alleen tekst)': KEYS.map((k) => `${k}_nl`) as any,
    },
  },
  singletons: withDutch({
    settings: singleton({
      label: 'Settings, order & SEO',
      path: 'content/settings',
      format: { data: 'json' },
      schema: {
        name: text('Your name'),
        role: text('Job title'),
        employer: text('Employer'),
        location: text('Location'),
        email: text('Email'),
        linkedin: text('LinkedIn URL'),
        cv: text('CV file path (optional)', 'Leave empty to hide every "Download CV" button. To show one, put a PDF in public/ and enter its path, e.g. /cv.pdf. Do not publish a CV with your phone number or home address.'),
        accent: text('Accent colour (hex)', 'Used for links, labels and highlights, e.g. #1F5F99'),
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
      label: 'Hero (top)',
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
        layout: layout(),
        haystack: fields.object(
          {
            period: text('Period'),
            title: text('Job title'),
            company: text('Company'),
            ...logo('experience'),
            intro: longText('Intro'),
            steps: fields.array(
              fields.object({ name: text('Step'), what: text('Short explanation') }),
              { label: 'Project steps', itemLabel: (p) => p.fields.name.value || 'Step' }
            ),
            note: longText('Note under the steps (sectors)'),
            studyTypes: list('Study types (tags under the steps)', 'Study type'),
            panelLabel: text('Panel: small label'),
            panelTitle: text('Panel: title'),
            panelText: longText('Panel: text'),
            panelTags: list('Panel: tags', 'Tag'),
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
      label: 'Speaking & teaching',
      path: 'content/speaking',
      format: { data: 'json' },
      schema: {
        ...header,
        layout: layout(photoLayout('left', 'top')),
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
        layout: layout(),
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
        layout: layout(),
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
      label: 'About',
      path: 'content/about',
      format: { data: 'json' },
      schema: { ...header, layout: layout(photoLayout('right', 'center')), photo: image('Photo (optional)', 'public/img/about', '/img/about/'), photoAlt: text('Photo description (for screen readers and Google)'), paragraphs: fields.array(fields.text({ label: 'Paragraph', multiline: true }), { label: 'Paragraphs', itemLabel: (p) => p.value.slice(0, 60) || 'Paragraph' }) },
    }),

    contact: singleton({
      label: 'Contact (bottom)',
      path: 'content/contact',
      format: { data: 'json' },
      schema: { ...header, layout: layout(), text: longText('Text') },
    }),
  }),
});
