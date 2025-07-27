import fs from 'fs-extra';
import path from 'path';
import * as pdfParse from 'pdfjs-dist';
import mammoth from 'mammoth';

export class DocumentProcessor {
  async processFile(file: Express.Multer.File): Promise<string> {
    const { mimetype, path: filePath } = file;
    
    try {
      switch (mimetype) {
        case 'application/pdf':
          return await this.processPDF(filePath);
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          return await this.processDOCX(filePath);
        case 'text/markdown':
        case 'text/plain':
          return await this.processTextFile(filePath);
        default:
          throw new Error(`Unsupported file type: ${mimetype}`);
      }
    } catch (error) {
      console.error(`Error processing file ${file.originalname}:`, error);
      throw new Error(`Failed to process file: ${file.originalname}`);
    }
  }

  private async processPDF(filePath: string): Promise<string> {
    try {
      const data = new Uint8Array(fs.readFileSync(filePath));
            pdfParse.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/build/pdf.worker.js';
      const doc = await pdfParse.getDocument({ data }).promise;
      
      let text = '';
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item: any) => item.str)
          .join(' ');
        text += pageText + '\n';
      }
      
      return text.trim();
    } catch (error) {
      console.error('Error processing PDF:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }

  private async processDOCX(filePath: string): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value.trim();
    } catch (error) {
      console.error('Error processing DOCX:', error);
      throw new Error('Failed to extract text from DOCX');
    }
  }

  private async processTextFile(filePath: string): Promise<string> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return content.trim();
    } catch (error) {
      console.error('Error processing text file:', error);
      throw new Error('Failed to read text file');
    }
  }
}