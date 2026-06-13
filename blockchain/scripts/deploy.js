const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "MATIC");

  // The backend server wallet that will call mint/record functions.
  // In production, set MINTER_ADDRESS in env to a dedicated hot wallet address.
  const minterAddress = process.env.MINTER_ADDRESS || deployer.address;
  console.log("Minter/Recorder address:", minterAddress);

  // 1. Deploy CiviToken
  const CiviToken = await hre.ethers.getContractFactory("CiviToken");
  const civiToken = await CiviToken.deploy(minterAddress);
  await civiToken.waitForDeployment();
  const civiTokenAddr = await civiToken.getAddress();
  console.log("CiviToken deployed to:", civiTokenAddr);

  // 2. Deploy CiviBadge
  const badgeBaseURI = process.env.BADGE_BASE_URI || "https://citizora.app/badge-metadata/";
  const CiviBadge = await hre.ethers.getContractFactory("CiviBadge");
  const civiBadge = await CiviBadge.deploy(minterAddress, badgeBaseURI);
  await civiBadge.waitForDeployment();
  const civiBadgeAddr = await civiBadge.getAddress();
  console.log("CiviBadge deployed to:", civiBadgeAddr);

  // 3. Deploy CiviAudit
  const CiviAudit = await hre.ethers.getContractFactory("CiviAudit");
  const civiAudit = await CiviAudit.deploy(minterAddress);
  await civiAudit.waitForDeployment();
  const civiAuditAddr = await civiAudit.getAddress();
  console.log("CiviAudit deployed to:", civiAuditAddr);

  // Write contract addresses to a JSON file consumed by the server
  const addresses = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      CiviToken: civiTokenAddr,
      CiviBadge: civiBadgeAddr,
      CiviAudit: civiAuditAddr,
    },
  };

  const outDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  const outFile = path.join(outDir, `${hre.network.name}.json`);
  fs.writeFileSync(outFile, JSON.stringify(addresses, null, 2));
  console.log("\nDeployment addresses saved to:", outFile);

  // Copy ABIs to server/src/blockchain/
  const abiSrc = path.join(__dirname, "..", "artifacts", "contracts");
  const abiDest = path.join(__dirname, "..", "..", "server", "src", "blockchain");
  if (!fs.existsSync(abiDest)) fs.mkdirSync(abiDest, { recursive: true });

  ["CiviToken", "CiviBadge", "CiviAudit"].forEach((name) => {
    const artifact = require(path.join(abiSrc, `${name}.sol`, `${name}.json`));
    fs.writeFileSync(
      path.join(abiDest, `${name}.json`),
      JSON.stringify({ abi: artifact.abi }, null, 2)
    );
  });
  console.log("ABIs copied to server/src/blockchain/");

  console.log("\n=== Add these to server/.env ===");
  console.log(`CONTRACT_CIVI_TOKEN=${civiTokenAddr}`);
  console.log(`CONTRACT_CIVI_BADGE=${civiBadgeAddr}`);
  console.log(`CONTRACT_CIVI_AUDIT=${civiAuditAddr}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
