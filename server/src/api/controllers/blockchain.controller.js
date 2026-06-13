const { ethers } = require("ethers");
const blockchainService = require("../services/blockchain.service");
const User = require("../models/user.model");

// GET /api/blockchain/balance/:walletAddress
exports.getTokenBalance = async (req, res) => {
  try {
    const { walletAddress } = req.params;
    if (!ethers.utils.isAddress(walletAddress)) {
      return res.status(400).json({ status: "error", message: "Invalid wallet address" });
    }
    const balance = await blockchainService.getTokenBalance(walletAddress);
    res.json({ status: "success", data: { walletAddress, balance, symbol: "CIVI" } });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// GET /api/blockchain/badges/:walletAddress
exports.getUserBadges = async (req, res) => {
  try {
    const { walletAddress } = req.params;
    if (!ethers.utils.isAddress(walletAddress)) {
      return res.status(400).json({ status: "error", message: "Invalid wallet address" });
    }
    const badgeNames = [
      "First Report",
      "Dedicated Reporter",
      "Community Champion",
      "Issue Closer",
      "Verified Citizen",
      "Top Voter",
      "Feedback Provider",
    ];
    const owned = await blockchainService.getUserBadges(walletAddress);
    const badges = badgeNames.map((name, i) => ({ id: i, name, owned: owned[i] }));
    res.json({ status: "success", data: { walletAddress, badges } });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// GET /api/blockchain/audit/:reportId
exports.getReportAudit = async (req, res) => {
  try {
    const { reportId } = req.params;
    const trail = await blockchainService.getReportAuditTrail(reportId);
    res.json({ status: "success", data: { reportId, trail } });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// POST /api/blockchain/connect-wallet   (auth required)
// Body: { walletAddress, signature }
// The frontend signs a challenge nonce with MetaMask; we verify before saving.
exports.connectWallet = async (req, res) => {
  try {
    const { walletAddress, signature } = req.body;
    const userId = req.user._id;

    if (!walletAddress || !signature) {
      return res.status(400).json({ status: "error", message: "walletAddress and signature required" });
    }
    if (!ethers.utils.isAddress(walletAddress)) {
      return res.status(400).json({ status: "error", message: "Invalid wallet address" });
    }

    // Verify the user signed the canonical challenge message
    const message = `Citizora wallet link: ${userId}`;
    const recovered = ethers.utils.verifyMessage(message, signature);
    if (recovered.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(401).json({ status: "error", message: "Signature verification failed" });
    }

    // Check no other account already uses this wallet
    const conflict = await User.findOne({ walletAddress: walletAddress.toLowerCase(), _id: { $ne: userId } });
    if (conflict) {
      return res.status(409).json({ status: "error", message: "Wallet already linked to another account" });
    }

    await User.findByIdAndUpdate(userId, { walletAddress: walletAddress.toLowerCase() });
    res.json({ status: "success", message: "Wallet connected successfully", data: { walletAddress } });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// DELETE /api/blockchain/disconnect-wallet   (auth required)
exports.disconnectWallet = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { walletAddress: null });
    res.json({ status: "success", message: "Wallet disconnected" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// GET /api/blockchain/me   (auth required) — full rewards profile for current user
exports.getMyRewards = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("walletAddress civiTokensEarned badges");
    if (!user.walletAddress) {
      return res.json({
        status: "success",
        data: { walletConnected: false, balance: "0", badges: [], civiTokensEarned: user.civiTokensEarned },
      });
    }
    const [balance, ownedBadges] = await Promise.all([
      blockchainService.getTokenBalance(user.walletAddress),
      blockchainService.getUserBadges(user.walletAddress),
    ]);
    const badgeNames = [
      "First Report", "Dedicated Reporter", "Community Champion",
      "Issue Closer", "Verified Citizen", "Top Voter", "Feedback Provider",
    ];
    const badges = badgeNames.map((name, i) => ({ id: i, name, owned: ownedBadges[i] }));
    res.json({
      status: "success",
      data: { walletConnected: true, walletAddress: user.walletAddress, balance, badges, civiTokensEarned: user.civiTokensEarned },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
