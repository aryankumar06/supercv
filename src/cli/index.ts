#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import {
  ATS_SYSTEM_PROMPT,
  buildPhase1UserPrompt,
  buildPhase2UserPrompt,
  parsePhase1Report,
} from './prompt';
import { LLMClient, type LLMProvider, detectProvider, DEFAULT_MODELS } from './llmClient';
import { readFileContent } from './fileReader';
import {
  printBanner,
  printParsedReport,
  printFullMarkdown,
  extractEnhancedResume,
  saveToFile,
} from './formatter';
import { runInteractiveWizard } from './interactive';

const program = new Command();

program
  .name('ats-resume')
  .description('AI-powered ATS Resume Compatibility Checker & Auto-Enhancer CLI')
  .version('1.0.0')
  .option('-r, --resume <path>', 'Path to resume file (.txt, .pdf, .docx, .md)')
  .option('-j, --jd <path>', 'Path to job description file (.txt, .md, .pdf)')
  .option('-p, --provider <provider>', 'LLM provider: gemini | openai | claude | ollama | groq | openrouter')
  .option('-m, --model <model>', 'Model name override (e.g., gemini-2.5-pro, gpt-4o, llama3.2)')
  .option('-k, --api-key <key>', 'API key override')
  .option('--base-url <url>', 'Base URL override for LLM provider or Ollama')
  .option('-o, --output <path>', 'Export full Markdown report to file')
  .option('--json <path>', 'Export structured report as JSON to file')
  .option('--save-enhanced <path>', 'Export enhanced resume text to file')
  .option('-f, --force-enhance', 'Force Phase 2 rewrite even if score is >= 70%', false)
  .option('-i, --interactive', 'Run in interactive step-by-step wizard mode', false)
  .option('--raw', 'Print raw LLM output without pretty terminal formatting', false);

async function main() {
  program.parse(process.argv);
  const options = program.opts();

  printBanner();

  let resumeText = '';
  let jobDescription = '';
  let provider: LLMProvider = (options.provider as LLMProvider) || 'gemini';
  let model: string | undefined = options.model;
  let forceEnhance: boolean = !!options.forceEnhance;

  if (options.interactive || (!options.resume && !options.jd)) {
    const wizardResult = await runInteractiveWizard();
    resumeText = wizardResult.resumeText;
    jobDescription = wizardResult.jobDescription;
    provider = wizardResult.provider;
    model = wizardResult.model || model;
    forceEnhance = wizardResult.forceEnhance || forceEnhance;
  } else {
    if (!options.resume) {
      console.error(chalk.red('Error: Missing --resume parameter. Specify -r <path> or run with -i for interactive mode.'));
      process.exit(1);
    }
    if (!options.jd) {
      console.error(chalk.red('Error: Missing --jd parameter. Specify -j <path> or run with -i for interactive mode.'));
      process.exit(1);
    }

    try {
      console.log(chalk.gray(`Reading resume from: ${options.resume}`));
      resumeText = await readFileContent(options.resume);
      console.log(chalk.gray(`Reading job description from: ${options.jd}`));
      jobDescription = await readFileContent(options.jd);
    } catch (err: unknown) {
      console.error(chalk.red(`File read error: ${(err as Error).message}`));
      process.exit(1);
    }
  }

  if (resumeText.trim().length < 50) {
    console.error(chalk.red('Error: Resume text is too short (minimum 50 characters required).'));
    process.exit(1);
  }

  if (jobDescription.trim().length < 50) {
    console.error(chalk.red('Error: Job description text is too short (minimum 50 characters required).'));
    process.exit(1);
  }

  // Setup LLM Client
  const detected = detectProvider();
  if (!options.provider && detected) {
    provider = detected.provider;
  }

  const llmClient = new LLMClient({
    provider,
    model: model || DEFAULT_MODELS[provider],
    apiKey: options.apiKey,
    baseUrl: options.baseUrl,
  });

  const clientConfig = llmClient.getConfig();
  console.log(
    chalk.cyan(
      `Running ATS Analysis with ${chalk.bold(clientConfig.provider.toUpperCase())} (${clientConfig.model || 'default'})...\n`
    )
  );

  try {
    console.log(chalk.yellow('⚡ Executing Phase 1: ATS Compatibility Scoring...'));
    const phase1Prompt = buildPhase1UserPrompt(resumeText, jobDescription, forceEnhance);

    let fullOutput = await llmClient.generate({
      systemPrompt: ATS_SYSTEM_PROMPT,
      userPrompt: phase1Prompt,
    });

    const parsedReport = parsePhase1Report(fullOutput);

    // If Phase 2 was not auto-included by the model, but score < 70% or forceEnhance is active, run Phase 2
    const hasPhase2InOutput = fullOutput.includes('### Enhanced Resume (ATS-Optimized)');
    const needsPhase2 = forceEnhance || parsedReport.overallScore < 70;

    if (!hasPhase2InOutput && needsPhase2) {
      console.log(
        chalk.yellow(
          `⚡ ATS score is ${parsedReport.overallScore}/100 (< 70%). Executing Phase 2: Resume Auto-Enhancement...`
        )
      );
      const phase2Prompt = buildPhase2UserPrompt(resumeText, jobDescription, fullOutput);
      const phase2Output = await llmClient.generate({
        systemPrompt: ATS_SYSTEM_PROMPT,
        userPrompt: phase2Prompt,
      });

      fullOutput = `${fullOutput}\n\n═══════════════════════════════════════\n${phase2Output}`;
    }

    console.log('');
    if (options.raw) {
      console.log(fullOutput);
    } else {
      printParsedReport(parsedReport);
      printFullMarkdown(fullOutput);
    }

    // Save Markdown Output
    if (options.output) {
      saveToFile(options.output, fullOutput);
    }

    // Save JSON Output
    if (options.json) {
      const jsonReport = {
        timestamp: new Date().toISOString(),
        overall_score: parsedReport.overallScore,
        verdict: parsedReport.verdict,
        categories: parsedReport.categories,
        matched_keywords: parsedReport.matchedKeywords,
        missing_keywords: parsedReport.missingKeywords,
        formatting_red_flags: parsedReport.formattingRedFlags,
        top_issues: parsedReport.topIssues,
        full_markdown: fullOutput,
      };
      saveToFile(options.json, JSON.stringify(jsonReport, null, 2));
    }

    // Save Enhanced Resume Text
    const enhancedResume = extractEnhancedResume(fullOutput);
    if (options.saveEnhanced) {
      if (enhancedResume) {
        saveToFile(options.saveEnhanced, enhancedResume);
      } else {
        console.log(chalk.yellow('Note: No enhanced resume was generated to save (score was ≥70% with no rewrite).'));
      }
    } else if (enhancedResume) {
      console.log(
        chalk.gray(
          'Tip: Use --save-enhanced <path> to export the rewritten resume directly to a text/markdown file.'
        )
      );
    }
  } catch (err: unknown) {
    console.error(chalk.red(`\nExecution Error: ${(err as Error).message}`));
    process.exit(1);
  }
}

main();
