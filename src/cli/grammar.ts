#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { readFileContent } from './fileReader';
import { checkGrammar } from '../utils/grammarChecker';

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    console.log(chalk.bold.cyan('\n✨ AI Resume Grammar Checker & Auto-Corrector CLI'));
    console.log('Usage: npm run grammar -- <path-to-resume.pdf/.txt/.docx> [options]\n');
    console.log('Options:');
    console.log('  -o, --output <path>    Save auto-corrected plain text to file');
    console.log('  --json                 Output complete grammar analysis as JSON');
    console.log('  -h, --help             Display help screen\n');
    process.exit(0);
  }

  const resumePath = args[0];
  const outputIndex = args.indexOf('-o') !== -1 ? args.indexOf('-o') : args.indexOf('--output');
  const outputPath = outputIndex !== -1 && args[outputIndex + 1] ? args[outputIndex + 1] : undefined;
  const isJson = args.includes('--json');

  const resolvedResume = path.resolve(process.cwd(), resumePath);
  if (!fs.existsSync(resolvedResume)) {
    console.error(chalk.red(`Error: File not found at ${resolvedResume}`));
    process.exit(1);
  }

  try {
    const resumeText = await readFileContent(resolvedResume);
    const result = checkGrammar(resumeText);

    if (isJson) {
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    }

    console.log(chalk.bold.cyan('\n╔══════════════════════════════════════════════════════════╗'));
    console.log(chalk.bold.cyan('║         ✨ AI RESUME GRAMMAR & SPELL CHECKER ✨          ║'));
    console.log(chalk.bold.cyan('╚══════════════════════════════════════════════════════════╝\n'));

    const scoreColor =
      result.score >= 88 ? chalk.bold.green : result.score >= 70 ? chalk.bold.yellow : chalk.bold.red;

    console.log(
      chalk.bold('Grammar Score: ') +
        scoreColor(`${result.score}% (Grade ${result.grade})`) +
        '  ' +
        chalk.gray(`[${result.totalIssues} total issues found]`)
    );
    console.log(chalk.italic(`"${result.summary}"`));
    console.log('');

    console.log(chalk.bold.underline('Issue Breakdown:'));
    console.log(` • Spelling Errors:        ${chalk.red(result.spellingErrorsCount)}`);
    console.log(` • Grammar / Tense Issues: ${chalk.yellow(result.grammarErrorsCount)}`);
    console.log(` • Style / Casing Issues:  ${chalk.blue(result.styleSuggestionsCount)}`);
    console.log('');

    if (result.issues.length > 0) {
      console.log(chalk.bold.underline('Line-by-Line Corrections:'));
      result.issues.forEach((issue, idx) => {
        const typeBadge =
          issue.type === 'spelling'
            ? chalk.bgRed.black(` SPELLING `)
            : issue.type === 'grammar'
            ? chalk.bgYellow.black(` GRAMMAR `)
            : chalk.bgBlue.black(` STYLE `);

        console.log(`\n ${chalk.bold(`${idx + 1}.`)} ${typeBadge} ${issue.lineNumber ? chalk.gray(`Line ${issue.lineNumber}:`) : ''}`);
        console.log(`    Original:  ${chalk.red.strikethrough(issue.originalText)}`);
        console.log(`    Corrected: ${chalk.green.bold(issue.suggestedText)}`);
        console.log(`    Reason:    ${chalk.gray(issue.explanation)}`);
      });
      console.log('');
    }

    if (outputPath) {
      fs.writeFileSync(path.resolve(process.cwd(), outputPath), result.correctedText, 'utf-8');
      console.log(chalk.green(`✔ Auto-corrected resume saved to: ${chalk.bold(outputPath)}\n`));
    } else {
      console.log(chalk.gray('Tip: Pass -o <file.txt> to export the auto-corrected resume directly.'));
    }
  } catch (err: unknown) {
    console.error(chalk.red(`Error checking grammar: ${(err as Error).message}`));
    process.exit(1);
  }
}

main();
