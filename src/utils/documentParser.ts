import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure PDF.js worker for browser
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
}

export interface ParsedDocumentResult {
  fileName: string;
  fileSize: number;
  fileType: 'pdf' | 'docx' | 'txt' | 'md';
  pageCount?: number;
  wordCount: number;
  charCount: number;
  text: string;
  detectedSections: {
    name: string;
    found: boolean;
    preview?: string;
  }[];
  extractedContact?: {
    email?: string;
    phone?: string;
    links?: string[];
  };
}

export async function parseDocument(file: File): Promise<ParsedDocumentResult> {
  const fileName = file.name;
  const fileSize = file.size;
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  let text = '';
  let pageCount: number | undefined;
  let fileType: ParsedDocumentResult['fileType'] = 'txt';

  if (ext === 'pdf' || file.type.includes('pdf')) {
    fileType = 'pdf';
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;
    pageCount = pdfDoc.numPages;

    const pageTexts: string[] = [];
    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      let lastY: number | null = null;
      let pageStr = '';

      for (const item of textContent.items as any[]) {
        if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
          pageStr += '\n';
        } else if (pageStr.length > 0 && !pageStr.endsWith('\n') && !pageStr.endsWith(' ')) {
          pageStr += ' ';
        }
        pageStr += item.str;
        lastY = item.transform[5];
      }
      pageTexts.push(pageStr.trim());
    }
    text = pageTexts.join('\n\n');
  } else if (ext === 'docx' || file.type.includes('wordprocessingml')) {
    fileType = 'docx';
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    text = result.value;
  } else {
    // Text / Markdown
    fileType = ext === 'md' ? 'md' : 'txt';
    text = await file.text();
  }

  // Clean up extracted text
  text = text.replace(/\r\n/g, '\n').replace(/\t/g, '  ').trim();

  // Metrics
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const charCount = text.length;

  // Detect Sections
  const standardSections = [
    { name: 'Contact Information', regex: /(@|\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/i },
    { name: 'Professional Summary', regex: /(summary|profile|about\s+me|overview)/i },
    { name: 'Core Skills', regex: /(skills|technical\s+skills|competencies|technologies)/i },
    { name: 'Experience / Work History', regex: /(experience|employment|work\s+history|career)/i },
    { name: 'Education', regex: /(education|academic|university|degree|bachelor|master|phd)/i },
    { name: 'Projects', regex: /(projects|portfolio)/i },
    { name: 'Certifications', regex: /(certifications|certificates|licenses)/i },
  ];

  const detectedSections = standardSections.map((sec) => ({
    name: sec.name,
    found: sec.regex.test(text),
  }));

  // Extract contact info preview
  const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  const phoneMatch = text.match(/(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/);
  const links = Array.from(
    new Set(text.match(/(https?:\/\/[^\s]+|linkedin\.com\/[^\s]+|github\.com\/[^\s]+)/gi) || [])
  );

  return {
    fileName,
    fileSize,
    fileType,
    pageCount,
    wordCount,
    charCount,
    text,
    detectedSections,
    extractedContact: {
      email: emailMatch ? emailMatch[1] : undefined,
      phone: phoneMatch ? phoneMatch[1] : undefined,
      links: links.length > 0 ? links : undefined,
    },
  };
}
