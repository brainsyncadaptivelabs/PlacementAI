import fs from 'fs';
import path from 'path';

// Forbidden client bundle markers
const FORBIDDEN_MARKERS = [
  'ATS_WEIGHTS',
  'PLACEMENT_READINESS_FORMULA',
  'SYSTEM_PROMPT_TEMPLATE',
  'ATS_CALIBRATION_COEFFICIENTS',
  'AptitudeQuestionEngine',
  'quantTemplates',
  'logicalTemplates',
  'verbalTemplates',
  'englishTemplates',
  'selectCATQuestion',
  'calculateIIF'
];

function scanDirectory(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      scanDirectory(filePath, fileList);
    } else if (file.endsWith('.js')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

function runScanner() {
  console.log('Starting client proprietary bundle leakage security scan...');

  // Search Next.js build output directory (.next/static)
  const nextDir = path.join(process.cwd(), '.next', 'static');
  if (!fs.existsSync(nextDir)) {
    console.error('Error: .next/static build directory does not exist. Run "npm run build" first.');
    process.exit(1);
  }

  const clientFiles = scanDirectory(nextDir);
  if (clientFiles.length === 0) {
    console.error('Error: No client JavaScript artifacts found to scan.');
    process.exit(1);
  }

  console.log(`Scanned ${clientFiles.length} client JavaScript artifacts.`);

  let leaksFound = 0;

  for (const file of clientFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const relativePath = path.relative(process.cwd(), file);

    for (const marker of FORBIDDEN_MARKERS) {
      if (content.includes(marker)) {
        console.error(`[SECURITY FAILURE] Found forbidden proprietary marker "${marker}" in client file: ${relativePath}`);
        leaksFound++;
      }
    }
  }

  if (leaksFound > 0) {
    console.error(`Bundle scan completed with ${leaksFound} violations. Failing build.`);
    process.exit(1);
  }

  console.log('Bundle scan completed successfully. No proprietary leaks found.');
}

runScanner();
