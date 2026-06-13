const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Granting roles to:", deployer.address);

  const deployment = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../deployments/localhost.json"))
  );

  const CiviToken = await hre.ethers.getContractAt("CiviToken", deployment.contracts.CiviToken);
  const CiviBadge = await hre.ethers.getContractAt("CiviBadge", deployment.contracts.CiviBadge);
  const CiviAudit = await hre.ethers.getContractAt("CiviAudit", deployment.contracts.CiviAudit);

  const MINTER_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("MINTER_ROLE"));
  const RECORDER_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("RECORDER_ROLE"));

  await (await CiviToken.grantRole(MINTER_ROLE, deployer.address)).wait();
  console.log("CiviToken MINTER_ROLE granted to", deployer.address);

  await (await CiviBadge.grantRole(MINTER_ROLE, deployer.address)).wait();
  console.log("CiviBadge MINTER_ROLE granted to", deployer.address);

  await (await CiviAudit.grantRole(RECORDER_ROLE, deployer.address)).wait();
  console.log("CiviAudit RECORDER_ROLE granted to", deployer.address);

  console.log("\nAll roles granted. Server can now mint tokens.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
