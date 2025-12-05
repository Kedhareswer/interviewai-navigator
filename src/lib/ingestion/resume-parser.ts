import pdfParse from 'pdf-parse';
import { storageService } from '../storage';

export class ResumeParser {
  /**
   * Parse resume from URL or file buffer
   */
  async parseResume(
    file: File | Buffer | string
  ): Promise<{ text: string; metadata: Record<string, any> }> {
    let buffer: Buffer;
    let filename = 'resume';

    if (typeof file === 'string') {
      // URL - download first
      const response = await fetch(file);
      buffer = Buffer.from(await response.arrayBuffer());
      filename = file.split('/').pop() || 'resume';
    } else if (file instanceof File) {
      buffer = Buffer.from(await file.arrayBuffer());
      filename = file.name;
    } else {
      buffer = file;
    }

    // Check file type
    const isPDF = filename.toLowerCase().endsWith('.pdf') || 
                  buffer.slice(0, 4).toString() === '%PDF';

    if (isPDF) {
      return this.parsePDF(buffer);
    } else {
      // Plain text
      return {
        text: buffer.toString('utf-8'),
        metadata: { type: 'text', filename },
      };
    }
  }

  /**
   * Parse PDF resume
   */
  private async parsePDF(buffer: Buffer): Promise<{ text: string; metadata: Record<string, any> }> {
    try {
      const data = await pdfParse(buffer);
      
      return {
        text: data.text,
        metadata: {
          type: 'pdf',
          pages: data.numpages,
          info: data.info,
        },
      };
    } catch (error) {
      throw new Error(`Failed to parse PDF: ${error}`);
    }
  }

  /**
   * Chunk resume text into sections
   */
  chunkResume(text: string): Array<{ text: string; section: string }> {
    const chunks: Array<{ text: string; section: string }> = [];
    
    // Common resume sections
    const sectionPatterns = [
      { name: 'summary', regex: /(?:summary|profile|objective|about)[\s:]*\n/i },
      { name: 'experience', regex: /(?:experience|work history|employment|professional experience)[\s:]*\n/i },
      { name: 'education', regex: /(?:education|academic|qualifications)[\s:]*\n/i },
      { name: 'skills', regex: /(?:skills|technical skills|competencies|expertise)[\s:]*\n/i },
      { name: 'projects', regex: /(?:projects|portfolio|key projects)[\s:]*\n/i },
      { name: 'certifications', regex: /(?:certifications|certificates|credentials)[\s:]*\n/i },
    ];

    let currentSection = 'header';
    let currentText = '';
    const lines = text.split('\n');

    for (const line of lines) {
      // Check if this line starts a new section
      let foundSection = false;
      for (const pattern of sectionPatterns) {
        if (pattern.regex.test(line)) {
          // Save previous section
          if (currentText.trim()) {
            chunks.push({ text: currentText.trim(), section: currentSection });
          }
          currentSection = pattern.name;
          currentText = line + '\n';
          foundSection = true;
          break;
        }
      }

      if (!foundSection) {
        currentText += line + '\n';
      }
    }

    // Add last section
    if (currentText.trim()) {
      chunks.push({ text: currentText.trim(), section: currentSection });
    }

    // If no sections found, chunk by paragraphs
    if (chunks.length === 0) {
      const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
      paragraphs.forEach((para, index) => {
        chunks.push({ text: para.trim(), section: `paragraph_${index}` });
      });
    }

    return chunks;
  }
}

export const resumeParser = new ResumeParser();

