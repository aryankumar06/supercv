import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import mammoth from 'mammoth';

const require = createRequire(import.meta.url);

export async function readFileContent(filePath: string): Promise<string> {
  const resolvedPath = path.resolve(process.cwd(), filePath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`File not found: ${filePath} (resolved to ${resolvedPath})`);
  }

  const ext = path.extname(resolvedPath).toLowerCase();

  switch (ext) {
    case '.txt':
    case '.md':
    case '.markdown':
    case '.rtf': {
      return fs.readFileSync(resolvedPath, 'utf-8');
    }

    case '.pdf': {
      const pdfParse = require('pdf-parse');
      const dataBuffer = fs.readFileSync(resolvedPath);
      const pdfData = await pdfParse(dataBuffer);
      return pdfData.text;
    }

    case '.docx': {
      const docxBuffer = fs.readFileSync(resolvedPath);
      const result = await mammoth.extractRawText({ buffer: docxBuffer });
      return result.value;
    }

    default: {
      // Attempt plain text read as fallback
      try {
        return fs.readFileSync(resolvedPath, 'utf-8');
      } catch {
        throw new Error(
          `Unsupported file extension: ${ext}. Supported formats are .txt, .md, .pdf, .docx.`
        );
      }
    }
  }
}
