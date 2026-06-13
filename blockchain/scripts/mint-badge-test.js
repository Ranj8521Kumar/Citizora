const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const deployment = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../deployments/localhost.json"))
  );

  const CiviBadge = await hre.ethers.getContractAt("CiviBadge", deployment.contracts.CiviBadge);

  // Mint First Report badge (0) to MetaMask wallet
  const target = "0x1393487FD6cF86B8C7C17dBC51f8F2b54c5876e0";

  for (let badgeType = 0; badgeType <= 1; badgeType++) {
    const has = await CiviBadge.hasBadge(target, badgeType);
    if (!has) {
      const tx = await CiviBadge.mint(target, badgeType);
      await tx.wait();
      console.log(`Badge ${badgeType} minted to ${target}`);
    } else {
      console.log(`Badge ${badgeType} already owned`);
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
