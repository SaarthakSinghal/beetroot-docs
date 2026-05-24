import { getPageImage, source } from '@/lib/source';
import { ImageResponse } from 'next/og';
import { notFound } from 'next/navigation';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ReactNode } from 'react';

const width = 1200;
const height = 630;
const accent = '#960018';
const grid = 'rgba(150, 0, 24, 0.4)';
const siteUrl = 'docs.ssdev.space/beetroot';

function readFont(path: string) {
  return readFile(join(process.cwd(), path)).then((buffer) =>
    buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
    ),
  );
}

const interTightRegular = readFont(
  'public/fonts/inter-tight/InterTight-Regular.ttf',
);
const interTightBold = readFont('public/fonts/inter-tight/InterTight-Bold.ttf');
const interTightBlack = readFont('public/fonts/inter-tight/InterTight-Black.ttf');

const fontData = Promise.all([
  interTightRegular,
  interTightBold,
  interTightBlack,
]).then(([regular, bold, black]) => [
  {
    name: 'Inter Tight',
    data: regular,
    weight: 400 as const,
    style: 'normal' as const,
  },
  {
    name: 'Inter Tight',
    data: bold,
    weight: 700 as const,
    style: 'normal' as const,
  },
  {
    name: 'Inter Tight',
    data: black,
    weight: 900 as const,
    style: 'normal' as const,
  },
]);

// Cache OG images for 2 weeks (1,209,600 seconds).
export const revalidate = 1209600;

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

function Frame({ children }: { children: ReactNode }) {
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
        style={{ fontWeight: 900, transform: 'translateY(-6px)' }}
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
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="92"
          height="92"
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
      <div tw="w-36 h-1" style={{ backgroundColor: accent, marginTop: 8 }} />
    </div>
  );
}

function DocsMark() {
  return (
    <div tw="flex flex-col items-start">
      <span
        tw="text-2xl font-bold uppercase tracking-widest"
        style={{ color: accent }}
      >
        Docs
      </span>
      <span
        tw="mt-1 text-white text-7xl font-black leading-none"
        style={{ fontWeight: 900, transform: 'translateY(-6px)' }}
      >
        B
      </span>
      <div tw="w-36 h-1" style={{ backgroundColor: accent, marginTop: 4 }} />
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

function PageMark({ slug }: { slug: string }) {
  const chapter = slug.match(/^(\d+)-/)?.[1];

  if (slug === 'credits') {
    return <GemMark />;
  }

  if (chapter) {
    return <ChapterMark chapter={chapter} />;
  }

  return <DocsMark />;
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
          fontWeight: 900,
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
          fontWeight: 400,
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

function OgImage({
  description,
  pageSlug,
  title,
}: {
  description: string;
  pageSlug: string;
  title: string;
}) {
  return (
    <Frame>
      <div tw="flex justify-between items-start">
        <PageMark slug={pageSlug} />
        <BeetrootLabel />
      </div>
      <Body title={title} description={description} />
    </Frame>
  );
}

export async function GET(
  _req: Request,
  { params }: RouteContext<'/og/docs/[...slug]'>,
) {
  const { slug } = await params;
  const page = source.getPage(slug.slice(0, -1));
  if (!page) notFound();

  return new ImageResponse(
    <OgImage
      pageSlug={page.slugs.at(-1) ?? 'docs'}
      title={page.data.title}
      description={page.data.description ?? 'Beetroot documentation'}
    />,
    {
      width,
      height,
      fonts: await fontData,
    },
  );
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    slug: getPageImage(page).segments,
  }));
}
