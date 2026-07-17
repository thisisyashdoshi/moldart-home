#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const promptPath = path.join(root, 'data', 'ai-visual-prompts.json');
const prompts = JSON.parse(fs.readFileSync(promptPath, 'utf8'));
const outputPath = path.join(root, 'docs', 'chatgpt-image-prompts.md');

const lines = [
  '# ChatGPT Image Prompts',
  '',
  'Use these prompts manually in ChatGPT with the newest image generation available in your subscription. This workflow does not use the OpenAI API and does not require any API key.',
  '',
  'After downloading the images from ChatGPT, rename each file to include the slug shown below and place it in `chatgpt-visuals-inbox/`. Then run `npm run images:import`.',
  '',
  '| Slug | Intended Output |',
  '| --- | --- |',
  ...prompts.map((item) => `| \`${item.slug}\` | \`${item.output}\` |`),
  '',
];

for (const item of prompts) {
  lines.push(`## ${item.title}`);
  lines.push('');
  lines.push(`Slug: \`${item.slug}\``);
  lines.push('');
  lines.push('Copy this into ChatGPT image generation:');
  lines.push('');
  lines.push('```text');
  lines.push(item.prompt);
  lines.push('```');
  lines.push('');
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${lines.join('\n')}\n`);
fs.mkdirSync(path.join(root, 'chatgpt-visuals-inbox'), { recursive: true });

console.log(`Prompts exported: ${path.relative(root, outputPath).replace(/\\/g, '/')}`);
console.log('Inbox ready: chatgpt-visuals-inbox/');
for (const item of prompts) console.log(`- ${item.slug}: ${item.title}`);
