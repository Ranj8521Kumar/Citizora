const express = require("express");
const router = express.Router();
const { authMiddleware: protect } = require("../middleware/auth.middleware");
const {
  getTokenBalance,
  getUserBadges,
  getReportAudit,
  connectWallet,
  disconnectWallet,
  getMyRewards,
} = require("../controllers/blockchain.controller");

// Public — anyone can query a wallet's token balance or badges
router.get("/balance/:walletAddress", getTokenBalance);
router.get("/badges/:walletAddress", getUserBadges);
router.get("/audit/:reportId", getReportAudit);

// Private — requires JWT
router.use(protect);
router.get("/me", getMyRewards);
router.post("/connect-wallet", connectWallet);
router.delete("/disconnect-wallet", disconnectWallet);

module.exports = router;
