#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { readFileContent } from './fileReader';
import { roastResume } from '../utils/resumeRoaster';

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    console.log(chalk.bold.red('\n🔥 AI Resume Roast CLI — Savage Recruiter Critique'));
    console.log('Usage: npm run roast -- <path-to-resume.pdf/.txt/.docx> [options]\n');
    console.log('Options:');
    console.log('  -j, --jd <path>      Optional target job description to roast against');
    console.log('  --json               Output roast report as JSON');
    console.log('  -h, --help           Display help screen\n');
    process.exit(0);
  }

  const resumePath = args[0];
  const jdIndex = args.indexOf('-j') !== -1 ? args.indexOf('-j') : args.indexOf('--jd');
  const jdPath = jdIndex !== -1 && args[jdIndex + 1] ? args[jdIndex + 1] : undefined;
  const isJson = args.includes('--json');

  const resolvedResume = path.resolve(process.cwd(), resumePath);
  if (!fs.existsSync(resolvedResume)) {
    console.error(chalk.red(`Error: Resume file not found at ${resolvedResume}`));
    process.exit(1);
  }

  try {
    const resumeText = await readFileContent(resolvedResume);
    let jdText: string | undefined;
    if (jdPath) {
      jdText = await readFileContent(path.resolve(process.cwd(), jdPath));
    }

    const roast = roastResume(resumeText, jdText);

    if (isJson) {
      console.log(JSON.stringify(roast, null, 2));
      process.exit(0);
    }

    console.log(chalk.bold.red('\n╔══════════════════════════════════════════════════════════╗'));
    console.log(chalk.bold.red('║              🔥 SAVAGE AI RESUME ROAST 🔥                ║'));
    console.log(chalk.bold.red('╚══════════════════════════════════════════════════════════╝\n'));

    const heatBadge =
      roast.roastScore >= 80
        ? chalk.bgRed.black.bold(` ${roast.roastLevel} (${roast.roastScore}/100) `)
        : chalk.bgYellow.black.bold(` ${roast.roastLevel} (${roast.roastScore}/100) `);

    console.log(chalk.bold('Roast Heat Level: ') + heatBadge);
    console.log(chalk.bold.yellow(`\nVerdict: `) + chalk.italic(`"${roast.verdictHeadline}"`));
    console.log('');

    console.log(chalk.bold.underline('💬 Recruiter\'s 6-Second First Impression:'));
    console.log(chalk.gray(`  ${roast.recruiterInnerThought}`));
    console.log('');

    console.log(chalk.bold.underline('⚡ Top Burns:'));
    for (const burn of roast.burns) {
      console.log(`\n ${burn.emoji} ${chalk.bold.red(burn.category.toUpperCase())}:`);
      console.log(`   ${chalk.bold.white(burn.punchline)}`);
      console.log(`   ${chalk.gray(burn.details)}`);
    }
    console.log('');

    console.log(chalk.bold.green.underline('🛠️ Tough Love (How to Fix This Resume):'));
    roast.toughLoveFixes.forEach((fix, idx) => {
      console.log(` ${chalk.green(`${idx + 1}.`)} ${fix}`);
    });
    console.log('');

    console.log(chalk.cyan('Tip: Run `npm run ats -- -r ' + resumePath + '` to auto-enhance and fix these issues!\n'));
  } catch (err: unknown) {
    console.error(chalk.red(`Error roasting resume: ${(err as Error).message}`));
    process.exit(1);
  }
}

main();
