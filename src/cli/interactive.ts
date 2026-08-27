import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import chalk from 'chalk';
import fs from 'fs';
import { type LLMProvider, detectProvider } from './llmClient';
import { readFileContent } from './fileReader';

export interface InteractiveOptions {
  resumeText: string;
  jobDescription: string;
  provider: LLMProvider;
  model?: string;
  forceEnhance: boolean;
}

export async function runInteractiveWizard(): Promise<InteractiveOptions> {
  const rl = readline.createInterface({ input, output });

  console.log(chalk.bold.yellow('Interactive Mode — Step-by-Step ATS Setup\n'));

  // 1. LLM / NLP Provider
  const detected = detectProvider();
  let defaultProvider: LLMProvider = detected.provider || 'transformer';

  console.log(chalk.cyan(`Detected Provider: ${chalk.bold(defaultProvider.toUpperCase())}`));
  const providerAnswer = await rl.question(
    `Select provider [transformer (local/no keys) / gemini / openai / claude / ollama / groq / openrouter] (default: ${defaultProvider}): `
  );

  const provider: LLMProvider = (providerAnswer.trim().toLowerCase() as LLMProvider) || defaultProvider;

  // 2. Model selection (optional)
  const modelAnswer = await rl.question('Custom model name (press Enter for default): ');
  const model = modelAnswer.trim() || undefined;

  // 3. Resume input
  let resumeText = '';
  while (!resumeText.trim()) {
    const resumePath = await rl.question(
      '\nEnter path to Resume file (.txt, .pdf, .docx, .md) or type "paste": '
    );

    if (resumePath.trim().toLowerCase() === 'paste') {
      console.log(chalk.gray('(Paste your resume text below. Type "EOF" on a new line when done):'));
      const lines: string[] = [];
      while (true) {
        const line = await rl.question('');
        if (line.trim() === 'EOF') break;
        lines.push(line);
      }
      resumeText = lines.join('\n');
    } else {
      try {
        const p = resumePath.trim();
        if (!fs.existsSync(p)) {
          console.log(chalk.red(`File not found: ${p}. Please check the path and try again.`));
          continue;
        }
        console.log(chalk.blue(`Reading resume from ${p}...`));
        resumeText = await readFileContent(p);
      } catch (err: unknown) {
        console.log(chalk.red(`Error reading resume: ${(err as Error).message}`));
      }
    }
  }

  // 4. Job Description input
  let jobDescription = '';
  while (!jobDescription.trim()) {
    const jdPath = await rl.question(
      '\nEnter path to Job Description file (.txt, .md) or type "paste": '
    );

    if (jdPath.trim().toLowerCase() === 'paste') {
      console.log(chalk.gray('(Paste the job description below. Type "EOF" on a new line when done):'));
      const lines: string[] = [];
      while (true) {
        const line = await rl.question('');
        if (line.trim() === 'EOF') break;
        lines.push(line);
      }
      jobDescription = lines.join('\n');
    } else {
      try {
        const p = jdPath.trim();
        if (!fs.existsSync(p)) {
          console.log(chalk.red(`File not found: ${p}. Please check the path and try again.`));
          continue;
        }
        console.log(chalk.blue(`Reading job description from ${p}...`));
        jobDescription = await readFileContent(p);
      } catch (err: unknown) {
        console.log(chalk.red(`Error reading job description: ${(err as Error).message}`));
      }
    }
  }

  // 5. Force enhance option
  const forceAnswer = await rl.question(
    '\nForce Phase 2 resume enhancement even if score ≥ 70%? (y/N): '
  );
  const forceEnhance = forceAnswer.trim().toLowerCase() === 'y';

  rl.close();

  return {
    resumeText,
    jobDescription,
    provider,
    model,
    forceEnhance,
  };
}
