import puppeteer from 'puppeteer';

export interface ExportOptions {
  html: string;
  margin?: { top: string, right: string, bottom: string, left: string };
}

export class PdfExportService {
  /**
   * Generates a PDF from a raw HTML string.
   * This HTML should represent the rendered React template.
   */
  static async generatePdfFromHtml({ html, margin }: ExportOptions): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Set the HTML content
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Emulate print media to enforce background colors and specific print styles
    await page.emulateMediaType('print');

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: margin || { top: '0', right: '0', bottom: '0', left: '0' }
    });

    await browser.close();
    
    // Explicitly converting Uint8Array to Buffer to satisfy standard Node return types
    return Buffer.from(pdfBuffer);
  }
}
