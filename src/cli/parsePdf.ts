#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { readFileContent } from './fileReader';

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    console.log(chalk.bold.cyan('\nPDF to TXT ATS Resume Parser & Structure Inspector'));
    console.log('Usage: npm run parse-pdf -- <path-to-file.pdf> [options]\n');
    console.log('Options:');
    console.log('  -o, --output <path>    Save extracted plain text to file');
    console.log('  --json                 Output parsed structure as JSON');
    console.log('  -h, --help             Show help screen\n');
    process.exit(0);
  }

  const filePath = args[0];
  const outputIndex = args.indexOf('-o') !== -1 ? args.indexOf('-o') : args.indexOf('--output');
  const outputPath = outputIndex !== -1 && args[outputIndex + 1] ? args[outputIndex + 1] : undefined;
  const isJson = args.includes('--json');

  const resolvedPath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(resolvedPath)) {
    console.error(chalk.red(`Error: File not found at ${resolvedPath}`));
    process.exit(1);
  }

  try {
    const stats = fs.statSync(resolvedPath);
    const rawText = await readFileContent(resolvedPath);
    const cleanedText = rawText.replace(/\r\n/g, '\n').replace(/\t/g, '  ').trim();

    const words = cleanedText.split(/\s+/).filter(Boolean);
    const lines = cleanedText.split('\n').map((l) => l.trim()).filter(Boolean);

    // Section detection
    const sections = [
      { name: 'Contact Info', found: /(@|\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/i.test(cleanedText) },
      { name: 'Professional Summary', found: /(summary|profile|about\s+me|overview)/i.test(cleanedText) },
      { name: 'Core Skills', found: /(skills|technical\s+skills|competencies|technologies)/i.test(cleanedText) },
      { name: 'Experience / History', found: /(experience|employment|work\s+history|career)/i.test(cleanedText) },
      { name: 'Education', found: /(education|academic|university|degree|bachelor|master|phd)/i.test(cleanedText) },
      { name: 'Projects', found: /(projects|portfolio)/i.test(cleanedText) },
      { name: 'Certifications', found: /(certifications|certificates|licenses)/i.test(cleanedText) },
    ];

    const emailMatch = cleanedText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    const phoneMatch = cleanedText.match(/(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/);

    if (isJson) {
      const outputJson = {
        fileName: path.basename(resolvedPath),
        fileSizeBytes: stats.size,
        wordCount: words.length,
        charCount: cleanedText.length,
        sections,
        extractedContact: {
          email: emailMatch ? emailMatch[1] : null,
          phone: phoneMatch ? phoneMatch[1] : null,
        },
        text: cleanedText,
      };
      console.log(JSON.stringify(outputJson, null, 2));
    } else {
      console.log(chalk.bold.cyan('\n╔══════════════════════════════════════════════════════════╗'));
      console.log(chalk.bold.cyan('║          PDF / CV TO TXT ATS STRUCTURE PARSER            ║'));
      console.log(chalk.bold.cyan('╚══════════════════════════════════════════════════════════╝\n'));

      console.log(chalk.bold(`📄 File: `) + chalk.green(path.basename(resolvedPath)));
      console.log(chalk.bold(`📦 Size: `) + chalk.gray(`${(stats.size / 1024).toFixed(1)} KB`));
      console.log(chalk.bold(`📊 Stats: `) + chalk.yellow(`${words.length} words, ${cleanedText.length} characters, ${lines.length} lines`));
      console.log('');

      console.log(chalk.bold.underline('Detected CV Sections:'));
      for (const sec of sections) {
        if (sec.found) {
          console.log(` ${chalk.green('✔')} ${chalk.bold(sec.name)}`);
        } else {
          console.log(` ${chalk.red('✖')} ${chalk.gray(sec.name)} (Missing or non-standard)`);
        }
      }
      console.log('');

      if (emailMatch || phoneMatch) {
        console.log(chalk.bold.underline('Extracted Contact Data:'));
        if (emailMatch) console.log(` • Email: ${chalk.cyan(emailMatch[1])}`);
        if (phoneMatch) console.log(` • Phone: ${chalk.cyan(phoneMatch[1])}`);
        console.log('');
      }

      console.log(chalk.bold.underline('Extracted Plain Text (ATS-Parsed):'));
      console.log(chalk.gray('────────────────────────────────────────────────────────────'));
      console.log(cleanedText);
      console.log(chalk.gray('────────────────────────────────────────────────────────────\n'));

      if (outputPath) {
        fs.writeFileSync(path.resolve(process.cwd(), outputPath), cleanedText, 'utf-8');
        console.log(chalk.green(`✔ Plain text saved to: ${chalk.bold(outputPath)}\n`));
      } else {
        console.log(chalk.gray('Tip: Pass -o <file.txt> to save the extracted text to a file.'));
      }
    }
  } catch (err: unknown) {
    console.error(chalk.red(`Error parsing PDF: ${(err as Error).message}`));
    process.exit(1);
  }
}

main();
