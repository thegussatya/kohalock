import * as fs from 'fs';
import * as path from 'path';

const sourcePath = path.join(__dirname, '../artifacts/contracts/DanaDesaLedger.sol/DanaDesaLedger.json');
const targetDir = path.join(__dirname, '../../../apps/api/src/config');
const targetPath = path.join(targetDir, 'DanaDesaLedger.json');

async function copyAbi() {
  try {
    // Ensure the target directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      console.log(`Created directory: ${targetDir}`);
    }

    // Check if source ABI exists
    if (!fs.existsSync(sourcePath)) {
      console.error(`Error: Source ABI file not found at ${sourcePath}`);
      console.error('Please run "npx hardhat compile" first.');
      process.exit(1);
    }

    // Copy the file
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`Successfully copied ABI to: ${targetPath}`);
  } catch (error) {
    console.error('Error copying ABI:', error);
    process.exit(1);
  }
}

copyAbi();
