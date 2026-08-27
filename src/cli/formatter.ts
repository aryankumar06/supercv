import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import type { ParsedPhase1Report } from './prompt';

export function printBanner(): void {
  console.log(chalk.bold.cyan('\n╔══════════════════════════════════════════════════════════╗'));
  console.log(chalk.bold.cyan('║            ATS RESUME CHECKER & ENHANCER (AI)            ║'));
  console.log(chalk.bold.cyan('╚══════════════════════════════════════════════════════════╝\n'));
}

export function printScoreBadge(score: number, verdict: 'PASS' | 'FAIL'): void {
  const isPass = verdict === 'PASS' || score >= 70;
  const scoreColor = isPass ? chalk.bold.green : chalk.bold.red;
  const badgeColor = isPass ? chalk.bgGreen.black : chalk.bgRed.white;

  console.log(
    chalk.bold('Overall ATS Score: ') +
      scoreColor(`${score} / 100`) +
      '  ' +
      badgeColor(` ${isPass ? 'PASS (≥70%) — ATS-READY' : 'FAIL (<70%) — ENHANCEMENT TRIGGERED'} `)
  );
  console.log('');
}

export function printParsedReport(report: ParsedPhase1Report): void {
  printScoreBadge(report.overallScore, report.verdict);

  if (report.categories.length > 0) {
    console.log(chalk.bold.underline('Category Breakdown:'));
    for (const cat of report.categories) {
      const catScore = parseInt(cat.score, 10);
      const scoreColor = isNaN(catScore)
        ? chalk.yellow
        : catScore >= 75
        ? chalk.green
        : catScore >= 60
        ? chalk.yellow
        : chalk.red;

      console.log(
        ` • ${chalk.bold(cat.category.padEnd(30))} [${cat.weight.padEnd(4)}] : ` +
          scoreColor(cat.score.padEnd(8)) +
          ` ${chalk.gray(cat.notes)}`
      );
    }
    console.log('');
  }

  if (report.matchedKeywords.length > 0) {
    console.log(chalk.bold.green('✔ Matched Keywords:'));
    console.log(chalk.greenBright(`  ${report.matchedKeywords.join(', ')}`));
    console.log('');
  }

  if (report.missingKeywords.length > 0) {
    console.log(chalk.bold.red('✖ Missing Critical Keywords (Ranked):'));
    console.log(chalk.redBright(`  ${report.missingKeywords.join(', ')}`));
    console.log('');
  }

  if (report.formattingRedFlags.length > 0) {
    console.log(chalk.bold.yellow('⚠ Formatting Red Flags:'));
    for (const flag of report.formattingRedFlags) {
      console.log(chalk.yellow(`  • ${flag}`));
    }
    console.log('');
  }

  if (report.topIssues.length > 0) {
    console.log(chalk.bold.magenta('⚡ Top Issues Holding This Resume Back:'));
    report.topIssues.forEach((issue, idx) => {
      console.log(chalk.magentaBright(`  ${idx + 1}. ${issue}`));
    });
    console.log('');
  }
}

export function printFullMarkdown(markdown: string): void {
  console.log(chalk.gray('────────────────────────────────────────────────────────────'));
  console.log(markdown);
  console.log(chalk.gray('────────────────────────────────────────────────────────────\n'));
}

export function extractEnhancedResume(fullOutput: string): string | null {
  const marker = '### Enhanced Resume (ATS-Optimized)';
  if (!fullOutput.includes(marker)) return null;

  const afterMarker = fullOutput.split(marker)[1];
  const endMarker = '### What Changed & Why';
  if (afterMarker.includes(endMarker)) {
    return afterMarker.split(endMarker)[0].replace(/^---|\n---/g, '').trim();
  }

  return afterMarker.trim();
}

export function saveToFile(filePath: string, content: string): void {
  const resolvedPath = path.resolve(process.cwd(), filePath);
  const dir = path.dirname(resolvedPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(resolvedPath, content, 'utf-8');
  console.log(chalk.green(`✔ Successfully saved output to: ${chalk.bold(resolvedPath)}`));
}
