import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const PROJECT_ROOT = 'c:/Users/wwefi/OneDrive/\u03a5\u03c0\u03bf\u03bb\u03bf\u03b3\u03b9\u03c3\u03c4\u03ae\u03c2/bioinformatics/biopipeline-app';
const OUT_DIR = path.join(PROJECT_ROOT, 'docs', 'screenshots');
const ROOT_OUT_DIR = path.join(PROJECT_ROOT, '..', 'docs', 'screenshots');
const BASE_URL = 'http://localhost:5173';

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(ROOT_OUT_DIR, { recursive: true });

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  console.log('Navigating to', BASE_URL);
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // 1. Landing Page
  console.log('Capturing Landing Page...');
  const saveShot = async (filename) => {
    const p1 = path.join(OUT_DIR, filename);
    const p2 = path.join(ROOT_OUT_DIR, filename);
    await page.screenshot({ path: p1 });
    fs.copyFileSync(p1, p2);
  };

  await saveShot('stage0_landing.png');

  // 2. Enter Pipeline
  await page.getByText('Start Discovering', { exact: false }).first().click();
  await page.waitForTimeout(2500);
  console.log('Entered pipeline (Step 1).');

  // 3. Stage 1 Screenshot
  await saveShot('stage1_sequence_analysis.png');

  // 4. Click "Analyze & Decode DNA Sequence" or "Next Step"
  console.log('Running Step 1 & moving to Step 2...');
  const nextBtn1 = page.getByText('Next Step: Predict 3D Protein Shape', { exact: false }).first();
  if (await nextBtn1.isVisible()) {
    await nextBtn1.click();
  } else {
    const btn = page.getByText('Analyze & Decode DNA Sequence', { exact: false }).first();
    await btn.click();
    await page.waitForTimeout(2000);
    await page.getByText('Next Step: Predict 3D Protein Shape', { exact: false }).first().click();
  }
  await page.waitForTimeout(3000);

  // 5. Stage 2 Screenshot
  console.log('Capturing Stage 2...');
  await saveShot('stage2_protein_structure.png');

  // 6. Run Step 2 -> Step 3
  console.log('Running Step 2 & moving to Step 3...');
  const nextBtn2 = page.getByText('Next Step: Check if this is a Good Drug Target', { exact: false }).first();
  if (await nextBtn2.isVisible()) {
    await nextBtn2.click();
  } else {
    await page.getByText('Run ESMFold 3D Prediction', { exact: false }).first().click();
    await page.waitForTimeout(3000);
    await page.getByText('Next Step: Check if this is a Good Drug Target', { exact: false }).first().click();
  }
  await page.waitForTimeout(3000);

  // 7. Stage 3 Screenshot
  console.log('Capturing Stage 3...');
  await saveShot('stage3_validation_gate.png');

  // 8. Run Step 3 -> Step 4
  console.log('Running Step 3 & moving to Step 4...');
  const checkBtn3 = page.getByText('Run Drug Target Suitability Check', { exact: false }).first();
  if (await checkBtn3.isVisible()) {
    await checkBtn3.click();
    await page.waitForTimeout(2000);
  }
  const nextBtn3 = page.getByText('Proceed to Screen Drug Molecules', { exact: false }).first();
  await nextBtn3.click();
  await page.waitForTimeout(3000);

  // 9. Stage 4 Screenshot
  console.log('Capturing Stage 4...');
  await saveShot('stage4_cheminformatics.png');

  // 10. Run Step 4 -> Step 5
  console.log('Running Step 4 & moving to Step 5...');
  const nextBtn4 = page.getByText('Continue to Drug Ranking', { exact: false }).first();
  if (await nextBtn4.isVisible()) {
    await nextBtn4.click();
  } else {
    // Click Step 5 in StepperBar directly
    const step5Btn = page.getByTitle('Find Best Drug', { exact: false }).first();
    await step5Btn.click();
  }
  await page.waitForTimeout(3000);

  // 11. Stage 5 Screenshot
  console.log('Capturing Stage 5...');
  await saveShot('stage5_drug_ranking.png');

  // 12. Run QSAR model on Step 5 and re-capture final podium state!
  console.log('Running AI Drug Ranking...');
  const runQsarBtn = page.getByText('Run AI Drug Ranking', { exact: false }).first();
  if (await runQsarBtn.isVisible()) {
    await runQsarBtn.click();
    await page.waitForTimeout(3000);
    await saveShot('stage5_drug_ranking_results.png');
  }

  await browser.close();
  console.log('\nSUCCESS! All screenshots captured and saved to:', OUT_DIR, 'and', ROOT_OUT_DIR);
}

main().catch(err => { console.error('FATAL:', err); process.exit(1); });
