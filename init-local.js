import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname);

function run(cmd, cwd) {
  console.log(`\nExecuting: ${cmd} (in ${path.relative(root, cwd) || '.'})`);
  const output = execSync(cmd, { cwd, encoding: 'utf8' });
  process.stdout.write(output);
  return output;
}

try {
  console.log("=== STARTING KOHALOCK BLOCKCHAIN & DATABASE INITIALIZATION ===");

  // 1. Deploy Contract
  const contractsDir = path.join(root, 'packages/contracts');
  const deployOutput = run('npx hardhat run scripts/deploy.ts --network localhost', contractsDir);

  // Extract address
  const match = deployOutput.match(/DanaDesaLedger deployed to:\s+(0x[a-fA-F0-9]{40})/i);
  if (!match) {
    throw new Error("Could not extract deployed contract address from output.");
  }
  const deployedAddress = match[1];
  console.log(`\nExtracted Deployed Address: ${deployedAddress}`);

  // Update apps/api/.env
  const envPath = path.join(root, 'apps/api/.env');
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Replace CONTRACT_ADDRESS line
    if (envContent.includes('CONTRACT_ADDRESS=')) {
      envContent = envContent.replace(/CONTRACT_ADDRESS=.*/g, `CONTRACT_ADDRESS="${deployedAddress}"`);
    } else {
      envContent += `\nCONTRACT_ADDRESS="${deployedAddress}"\n`;
    }
    
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log(`Successfully updated apps/api/.env with CONTRACT_ADDRESS="${deployedAddress}"`);
  } else {
    console.warn(`Warning: ${envPath} not found! Cannot write CONTRACT_ADDRESS.`);
  }

  // 2. Copy ABI
  run('npm run copy-abi', contractsDir);

  // 3. Reset database transactional data
  const apiDir = path.join(root, 'apps/api');
  run('npx ts-node scripts/reset-onchain-data.ts', apiDir);

  // 4. Seed database
  run('npx prisma db seed', apiDir);

  console.log("\n=== SETUP SUCCESSFUL! READY FOR DEVELOPMENT ===");
} catch (error) {
  console.error("\n=== SETUP FAILED ===");
  console.error(error.message);
  process.exit(1);
}
