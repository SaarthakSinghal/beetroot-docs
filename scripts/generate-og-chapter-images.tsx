import ImageResponse from '@takumi-rs/image-response';
import sharp from 'sharp';

const outputDir = './qa-artifacts/og-chapters';
const docsDir = './content/docs/workshop';
const width = 1200;
const height = 630;
const accent = '#ae021e';
const grid = 'rgba(150, 0, 24, 0.4)';
const siteUrl = 'docs.ssdev.space/beetroot';

type Chapter = {
  chapter: string;
  description: string;
  filename: string;
  kind: 'chapter' | 'credits';
  slug: string;
  title: string;
};

const fonts = [
  {
    name: 'Inter Tight',
    data: await Bun.file(
      './node_modules/@fontsource-variable/inter-tight/files/inter-tight-latin-wght-normal.woff2',
    ).arrayBuffer(),
    weight: 400,
    style: 'normal' as const,
  },
];

function parseFrontmatter(source: string) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const values: Record<string, string> = {};

  if (!match) {
    return values;
  }

  for (const line of match[1].split(/\r?\n/)) {
    const pair = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!pair) continue;

    const raw = pair[2].trim();
    values[pair[1]] = raw.replace(/^["']|["']$/g, '');
  }

  return values;
}

async function getChapters() {
  const entries = await Array.fromAsync(new Bun.Glob('*.mdx').scan(docsDir));
  const chapters: Chapter[] = [];

  for (const filename of entries.sort()) {
    const chapterMatch = filename.match(/^(\d+)-(.+)\.mdx$/);
    if (!chapterMatch) continue;

    const source = await Bun.file(`${docsDir}/${filename}`).text();
    const frontmatter = parseFrontmatter(source);

    chapters.push({
      chapter: chapterMatch[1],
      description: frontmatter.description ?? 'Step-by-step Beetroot workshop notes.',
      filename,
      kind: 'chapter',
      slug: filename.replace(/\.mdx$/, ''),
      title: frontmatter.title ?? chapterMatch[2].replaceAll('-', ' '),
    });
  }

  const creditsSource = await Bun.file(`${docsDir}/credits.mdx`).text();
  const creditsFrontmatter = parseFrontmatter(creditsSource);
  chapters.push({
    chapter: '',
    description:
      creditsFrontmatter.description ?? 'Thanks and acknowledgements for Beetroot.',
    filename: 'credits.mdx',
    kind: 'credits',
    slug: 'credits',
    title: creditsFrontmatter.title ?? 'Credits',
  });

  return chapters;
}

function Frame({ children }: { children: JSX.Element }) {
  return (
    <div
      tw="flex h-full w-full text-zinc-100"
      style={{ fontFamily: 'Inter Tight' }}
    >
      <div
        tw="flex flex-col h-full w-full bg-black border border-zinc-800 p-16 relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(${grid} 1px, transparent 1px), linear-gradient(90deg, ${grid} 1px, transparent 1px)`,
          backgroundSize: '44px 44px',
        }}
      >
        {children}
      </div>
    </div>
  );
}

function ChapterMark({ chapter }: { chapter: string }) {
  return (
    <div tw="flex flex-col items-start">
      <span
        tw="text-2xl font-bold uppercase tracking-widest"
        style={{ color: accent }}
      >
        Chapter
      </span>
      <span
        tw="mt-1 text-white text-7xl font-black leading-none"
        style={{ transform: 'translateY(-6px)' }}
      >
        {chapter}
      </span>
      <div tw="w-36 h-1" style={{ backgroundColor: accent, marginTop: 4 }} />
    </div>
  );
}

function GemMark() {
  return (
    <div tw="flex flex-col items-start">
      <div
        tw="flex items-center justify-center"
        style={{
          color: accent,
          height: 92,
          width: 92,
          transform: 'translate(0px, -10px)',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10.5 3 8 9l4 13 4-13-2.5-6" />
          <path d="M17 3a2 2 0 0 1 1.6.8l3 4a2 2 0 0 1 .013 2.382l-7.99 10.986a2 2 0 0 1-3.247 0l-7.99-10.986A2 2 0 0 1 2.4 7.8l2.998-3.997A2 2 0 0 1 7 3z" />
          <path d="M2 9h20" />
        </svg>
      </div>
      <div tw="w-36 h-1" style={{ backgroundColor: accent, marginTop: 8, transform: 'translateY(-4px)' }} />
    </div>
  );
}

function BeetrootLabel() {
  return (
    <div tw="flex flex-col items-end" style={{ transform: 'translateY(-6px)' }}>
      <span
        tw="text-2xl font-bold uppercase tracking-widest"
        style={{ color: accent }}
      >
        Beetroot
      </span>
      <span tw="text-zinc-600 text-xl mt-2">{siteUrl}</span>
    </div>
  );
}

function getTitleStyle(title: string) {
  if (title.length > 34) {
    return { fontSize: 58, lineHeight: 0.94, maxWidth: 940 };
  }

  if (title.length > 24) {
    return { fontSize: 66, lineHeight: 0.94, maxWidth: 960 };
  }

  return { fontSize: 74, lineHeight: 0.94, maxWidth: 980 };
}

function getDescriptionStyle(description: string) {
  if (description.length > 100) {
    return { fontSize: 27, lineHeight: 1.22, maxWidth: 820 };
  }

  if (description.length > 72) {
    return { fontSize: 29, lineHeight: 1.22, maxWidth: 840 };
  }

  return { fontSize: 31, lineHeight: 1.22, maxWidth: 860 };
}

function Body({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  const titleStyle = getTitleStyle(title);
  const descriptionStyle = getDescriptionStyle(description);

  return (
    <div tw="flex flex-col" style={{ marginTop: 120 }}>
      <h1
        tw="font-black text-white"
        style={{
          fontSize: titleStyle.fontSize,
          lineHeight: titleStyle.lineHeight,
          margin: 0,
          marginBottom: 30,
          maxWidth: titleStyle.maxWidth,
        }}
      >
        {title}
      </h1>
      <p
        tw="text-zinc-400"
        style={{
          fontSize: descriptionStyle.fontSize,
          lineHeight: descriptionStyle.lineHeight,
          marginTop: 10,
          maxWidth: descriptionStyle.maxWidth,
        }}
      >
        {description}
      </p>
    </div>
  );
}

function OgImage({ chapter }: { chapter: Chapter }) {
  return (
    <Frame>
      <>
        <div tw="flex justify-between items-start">
          {chapter.kind === 'credits' ? (
            <GemMark />
          ) : (
            <ChapterMark chapter={chapter.chapter} />
          )}
          <BeetrootLabel />
        </div>
        <Body title={chapter.title} description={chapter.description} />
      </>
    </Frame>
  );
}

function escapeSvg(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

async function writeContactSheet(chapters: Chapter[]) {
  const thumbWidth = 360;
  const thumbHeight = 189;
  const gap = 28;
  const labelHeight = 34;
  const headerHeight = 74;
  const columns = 2;
  const rows = Math.ceil(chapters.length / columns);
  const sheetWidth = columns * thumbWidth + (columns + 1) * gap;
  const sheetHeight =
    headerHeight + rows * (thumbHeight + labelHeight) + (rows + 1) * gap;
  const composites: sharp.OverlayOptions[] = [
    {
      input: Buffer.from(
        `<svg width="${sheetWidth}" height="${headerHeight}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#09090b"/>
          <text x="${gap}" y="48" font-family="Arial, sans-serif" font-size="34" font-weight="800" fill="#fafafa">Beetroot Chapter OG Images</text>
          <text x="${sheetWidth - gap}" y="48" text-anchor="end" font-family="Arial, sans-serif" font-size="18" font-weight="600" fill="#71717a">Inter Tight, #960018</text>
        </svg>`,
      ),
      left: 0,
      top: 0,
    },
  ];

  for (const [index, chapter] of chapters.entries()) {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const left = gap + column * (thumbWidth + gap);
    const top = headerHeight + gap + row * (thumbHeight + labelHeight + gap);
    const imagePath = `${outputDir}/${chapter.slug}.png`;
    const preview = await sharp(imagePath).resize(thumbWidth, thumbHeight).png().toBuffer();
    const label = Buffer.from(
      `<svg width="${thumbWidth}" height="${labelHeight}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#09090b"/>
        <text x="0" y="23" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#d4d4d8">${escapeSvg(chapter.slug)}</text>
      </svg>`,
    );

    composites.push({ input: preview, left, top });
    composites.push({ input: label, left, top: top + thumbHeight + 8 });
  }

  const sheet = await sharp({
    create: {
      width: sheetWidth,
      height: sheetHeight,
      channels: 4,
      background: '#09090b',
    },
  })
    .composite(composites)
    .png()
    .toBuffer();

  await Bun.write(`${outputDir}/contact-sheet.png`, sheet);
}

await Bun.$`mkdir -p ${outputDir}`;

const chapters = await getChapters();

for (const chapter of chapters) {
  const response = new ImageResponse(<OgImage chapter={chapter} />, {
    width,
    height,
    format: 'png',
    fonts,
  });

  await response.ready;
  await Bun.write(
    `${outputDir}/${chapter.slug}.png`,
    Buffer.from(await response.arrayBuffer()),
  );
  console.log(`${chapter.slug}.png`);
}

await writeContactSheet(chapters);
console.log('contact-sheet.png');
