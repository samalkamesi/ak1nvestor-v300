#!/usr/bin/env node
// Bygger AR23 utbildningsaktier-ar (s3-u3 byggare 3/3) av _s3u3-ar23-body.md
import { readFileSync, writeFileSync } from 'node:fs';

const body = readFileSync('/home/ak1a/AK1/verktyg/_s3u3-ar23-body.md', 'utf8').trim();
const ord = body.split(/\s+/).length;

const post = {
  slug: 'utbildningsaktier-sa-analyserar-du-utbildningsbolag-ar',
  title: 'أسهم التعليم: كيف تحلل شركات التعليم',
  description: 'أسهم التعليم تُدفع أجورها لكل طالب لا لكل دورة اقتصادية. تعلّم قراءة أعداد الطلاب ونماذج التمويل ومخاطر الرقابة — مع AcadeMedia محسوبة خطوة بخطوة.',
  pillar: 'Institutionell metodik',
  author: 'AK1A Research Lab',
  publishedAt: '2026-09-21',
  readingMinutes: Math.max(1, Math.round(ord / 600)),
  tags: ['أسهم التعليم', 'شركات التعليم', 'المدارس المستقلة', 'تمويل المدارس', 'النسب المالية'],
  body
};

writeFileSync(
  '/home/ak1a/AK1/data/blogg-utkast/utbildningsaktier-sa-analyserar-du-utbildningsbolag-ar.json',
  JSON.stringify(post, null, 1) + '\n'
);
console.log('skrev JSON — ord ' + ord + ', readingMinutes ' + post.readingMinutes +
  ', title ' + [...post.title].length + ' tkn, OG ' + [...post.description].length + ' tkn');
