require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: "cancun"
    }
  },
  networks: {
    hardhat: {},
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    amoy: {
      url: process.env.BLOCKCHAIN_RPC_URL || "",
      accounts: process.env.BLOCKCHAIN_PRIVATE_KEY
        ? [process.env.BLOCKCHAIN_PRIVATE_KEY]
        : [],
      chainId: 80002
    },
    polygon: {
      url: process.env.BLOCKCHAIN_RPC_URL_MAINNET || "",
      accounts: process.env.BLOCKCHAIN_PRIVATE_KEY
        ? [process.env.BLOCKCHAIN_PRIVATE_KEY]
        : [],
      chainId: 137
    }
  },
  etherscan: {
    apiKey: {
      polygonAmoy: process.env.POLYGONSCAN_API_KEY || "",
      polygon: process.env.POLYGONSCAN_API_KEY || ""
    }
  }
};
