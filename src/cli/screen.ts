#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { readFileContent } from './fileReader';
import { screenResumeDualTier, type TierAnalysisResult } from '../utils/tierScreener';

function printTierReport(tier: TierAnalysisResult, color: typeof chalk.blue) {
  console.log(color.bold(`\n═══ ${tier.title.toUpperCase()} ═══`));
  console.log(`Match Score:      ${color.bold(`${tier.overallScore}%`)}`);
  console.log(`Calibration Fit:  ${chalk.bold(tier.levelAssessment)}`);
  console.log(`Recruiter Check:  ${chalk.green(`${tier.passedCount} Passed`)}, ${chalk.yellow(`${tier.warningCount} Partial`)}, ${chalk.red(`${tier.missingCount} Missing`)}`);
  console.log(`Summary:          ${chalk.italic(tier.summary)}\n`);

  console.log(chalk.bold.underline('Top Focus Areas:'));
  tier.focusAreas.slice(0, 10).forEach((area) => {
    const icon =
      area.status === 'passed' ? chalk.green('✔') : area.status === 'warning' ? chalk.yellow('▲') : chalk.red('✖');
    console.log(` ${icon} [${String(area.id).padStart(2, '0')}] ${chalk.bold(area.name)} (${area.score}/100)`);
    console.log(`    Recruiter Focus: ${chalk.gray(area.recruiterFocus)}`);
    if (area.evidenceFound) {
      console.log(`    Evidence:        ${chalk.cyan(area.evidenceFound)}`);
    }
    console.log(`    Action:          ${chalk.white(area.recommendation)}`);
  });

  if (tier.nextSteps.length > 0) {
    console.log(chalk.bold.underline('\nStrategic Action Items:'));
    tier.nextSteps.forEach((step, idx) => {
      console.log(` ${chalk.bold(`${idx + 1}.`)} [${chalk.bold(step.category)}] ${step.title}`);
      console.log(`    ${chalk.gray(step.actionItem)}`);
      if (step.exampleSnippet) {
        console.log(`    ${chalk.yellow(step.exampleSnippet.replace(/\n/g, '\n    '))}`);
      }
    });
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    console.log(chalk.bold.cyan('\n🎯 SuperCV — FAANG vs. Startup Resume Screener CLI'));
    console.log('Usage: npm run screen -- <path-to-resume.pdf/.txt/.docx> [options]\n');
    console.log('Options:');
    console.log('  -t, --tier <faang|startup|both>   Filter output by target tier (default: both)');
    console.log('  --json                            Output structured JSON evaluation');
    console.log('  -h, --help                        Display help screen\n');
    process.exit(0);
  }

  const resumePath = args[0];
  const tierIndex = args.indexOf('-t') !== -1 ? args.indexOf('-t') : args.indexOf('--tier');
  const targetTier = tierIndex !== -1 && args[tierIndex + 1] ? args[tierIndex + 1].toLowerCase() : 'both';
  const isJson = args.includes('--json');

  const resolvedResume = path.resolve(process.cwd(), resumePath);
  if (!fs.existsSync(resolvedResume)) {
    console.error(chalk.red(`Error: File not found at ${resolvedResume}`));
    process.exit(1);
  }

  try {
    const resumeText = await readFileContent(resolvedResume);
    const dualResult = screenResumeDualTier(resumeText);

    if (isJson) {
      console.log(JSON.stringify(dualResult, null, 2));
      process.exit(0);
    }

    console.log(chalk.bold.cyan('\n╔══════════════════════════════════════════════════════════╗'));
    console.log(chalk.bold.cyan('║         🎯 FAANG VS. STARTUP RESUME SCREENER 🎯          ║'));
    console.log(chalk.bold.cyan('╚══════════════════════════════════════════════════════════╝\n'));

    console.log(chalk.bold('Recruiter Verdict:'));
    console.log(chalk.cyan(`  ${dualResult.comparisonSummary}`));

    if (targetTier === 'both' || targetTier === 'faang') {
      printTierReport(dualResult.faang, chalk.blue);
    }

    if (targetTier === 'both' || targetTier === 'startup') {
      printTierReport(dualResult.startup, chalk.magenta);
    }

    console.log(chalk.gray('\nTip: Run `npm run dev` to view the full interactive 40-point visual breakdown in the browser.\n'));
  } catch (err: unknown) {
    console.error(chalk.red(`Error screening resume: ${(err as Error).message}`));
    process.exit(1);
  }
}

main();
