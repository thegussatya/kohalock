import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname);

function run(cmd, cwd) {
  console.log(`\nExecuting: ${cmd} (in ${path.relative(root, cwd) || '.'})`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

try {
  console.log("=== STARTING KOHALOCK BLOCKCHAIN & DATABASE INITIALIZATION ===");

  // 1. Deploy Contract
  const contractsDir = path.join(root, 'packages/contracts');
  run('npx hardhat run scripts/deploy.ts --network localhost', contractsDir);

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
