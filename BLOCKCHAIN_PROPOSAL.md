# Citizora — Blockchain Integration & Civic Reward System
## Technical Proposal & Implementation Report
**Prepared by:** Ranjan Kumar (Intern, Dot Ventures)
**Date:** June 13, 2026
**Status:** Implemented & Tested (Local) — Awaiting Mentor Approval for Production Deployment

---

## 1. Executive Summary

Citizora is a civic engagement platform where citizens report public infrastructure issues (roads, water, electricity, waste), field workers resolve them, and administrators manage the workflow. While the core platform was already functional, it lacked any mechanism to:
- **Incentivize citizen participation** (why keep reporting if nothing changes?)
- **Prove data integrity** (how do we know reports haven't been tampered with?)
- **Give citizens ownership** of their civic contributions

To solve these problems, we integrated a **blockchain layer** on top of the existing MongoDB + Node.js + React stack. The result is a hybrid architecture where:
- MongoDB continues to store all application data (reports, images, users)
- The Polygon blockchain stores cryptographic proofs, token rewards, and achievement NFTs

All features have been implemented and tested locally. This document describes what was built, how it works, and what is proposed next.

---

## 2. Platform Overview

### Existing Stack (Before Blockchain)
| Layer | Technology |
|---|---|
| Frontend | React + Vite (3 apps: Users, Employees, Admin) |
| Backend | Node.js + Express |
| Database | MongoDB (Atlas) |
| Auth | JWT tokens, role-based (user / employee / admin) |
| Hosting | Render (backend), Vercel/Netlify (frontend) |

### User Roles
- **Citizen (user)** — submits reports, votes, gives feedback
- **Field Worker (employee)** — receives assigned reports, updates status
- **Admin** — manages all reports, assigns workers, views analytics

---

## 3. Why Blockchain?

### Problems with the Current Architecture
```
Problem 1: No incentive
  → Citizens submit reports but get nothing back
  → Engagement drops over time

Problem 2: Trust gap
  → Citizens have no way to verify their report wasn't silently edited or deleted
  → No tamper-proof audit trail

Problem 3: No ownership
  → All civic contribution history lives only in Citizora's database
  → If the platform shuts down, citizen history disappears
```

### How Blockchain Solves Each Problem
```
Solution 1: CIVI Token Rewards
  → Citizens earn tokens for every civic action
  → Creates measurable proof of civic contribution

Solution 2: On-chain Audit Trail
  → Every report event (creation, status changes) is hashed and recorded on blockchain
  → Any tampering in MongoDB is detectable by comparing hashes

Solution 3: Self-sovereign Identity
  → Wallet address = citizen identity
  → NFT badges = permanent proof of achievements (owned by citizen, not by Citizora)
```

---

## 4. Architecture: Hybrid Blockchain Design

```
┌─────────────────────────────────────────────────────────┐
│                    CITIZORA SYSTEM                      │
│                                                         │
│  ┌──────────────┐    ┌──────────────┐                  │
│  │   React UI   │    │  Node.js API │                  │
│  │  (Citizens)  │◄──►│   (Express)  │                  │
│  └──────────────┘    └──────┬───────┘                  │
│                             │                           │
│               ┌─────────────┴──────────────┐           │
│               │                            │           │
│        ┌──────▼──────┐           ┌─────────▼────────┐  │
│        │   MongoDB   │           │ Blockchain Layer  │  │
│        │  (Primary)  │           │  (Polygon/EVM)    │  │
│        │             │           │                   │  │
│        │ • Reports   │           │ • CIVI Tokens     │  │
│        │ • Users     │           │ • NFT Badges      │  │
│        │ • Images    │           │ • Audit Hashes    │  │
│        │ • Full data │           │ • Proofs only     │  │
│        └─────────────┘           └───────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Key Design Principle:** Blockchain stores only *cryptographic proofs*, not raw data. This keeps costs low, protects privacy (GDPR-friendly), and makes verification fast.

---

## 5. Smart Contracts (Solidity)

Three smart contracts were written and deployed, located in `blockchain/contracts/`.

### 5.1 CiviToken.sol — ERC-20 Civic Reward Token

| Property | Value |
|---|---|
| Token Name | CiviToken |
| Symbol | CIVI |
| Standard | ERC-20 with OpenZeppelin AccessControl |
| Max Supply | 1,000,000,000 CIVI (1 billion) |
| Network | Polygon (Amoy Testnet → Mainnet) |

**How it works:**
- Only the Citizora backend server wallet (with `MINTER_ROLE`) can mint tokens
- Citizens cannot mint tokens themselves — all minting is triggered by verified civic actions
- Every mint records a `reason` string on-chain (e.g., `"report_submitted"`, `"report_resolved_reporter"`)
- Tokens are standard ERC-20 and can eventually be used in DeFi, traded, or redeemed

**Events emitted:**
```
TokensMinted(address indexed to, uint256 amount, string reason)
TokensBurned(address indexed from, uint256 amount)
```

---

### 5.2 CiviBadge.sol — Soulbound Achievement NFT

| Property | Value |
|---|---|
| Standard | ERC-721 (non-transferable / soulbound) |
| Symbol | CVBDG |
| Total Badge Types | 7 |

**Soulbound = permanently tied to the earner.** Badges cannot be transferred, sold, or traded. They are proof of the citizen's own civic record.

**7 Badge Types:**

| ID | Badge Name | Icon | Trigger |
|---|---|---|---|
| 0 | First Report | 📋 | Submit your first civic report |
| 1 | Dedicated Reporter | 📝 | 10+ reports submitted |
| 2 | Community Champion | 🏆 | 50+ reports submitted |
| 3 | Issue Closer | 🔧 | Field worker resolves 25+ reports |
| 4 | Verified Citizen | ✅ | Identity verified |
| 5 | Top Voter | 👍 | 100+ community votes cast |
| 6 | Feedback Provider | 💬 | 10+ feedback submissions |

**Key feature:** `hasBadge(address, badgeType)` prevents duplicate minting — a citizen can only earn each badge once.

---

### 5.3 CiviAudit.sol — Immutable Report Audit Trail

| Property | Value |
|---|---|
| Purpose | Tamper-proof record of all report events |
| Storage | Events only (no on-chain storage = low gas cost) |
| Role required | `RECORDER_ROLE` (backend server wallet) |

**How it works:**
```
Report created in MongoDB
        ↓
Server computes:
  contentHash = keccak256(reportId + title + description + category)
        ↓
CiviAudit.recordCreate(reportId, contentHash, submitterWallet, category)
        ↓
Blockchain emits ReportCreated event (permanent, indexed by reportId)

Later verification:
  Re-compute hash from current MongoDB data
  Compare with blockchain hash
  Match = data is authentic | No match = data was tampered
```

**Events emitted:**
```
ReportCreated(reportId, contentHash, submittedBy, category, timestamp)
ReportEvent(reportId, contentHash, status, updatedBy, timestamp)
```

---

### 5.4 Deployment Configuration

| Network | Chain ID | Purpose |
|---|---|---|
| Hardhat (local) | 31337 | Development & testing |
| Polygon Amoy | 80002 | Testnet |
| Polygon Mainnet | 137 | Production |

**Compiler:** Solidity 0.8.24, EVM: Cancun, Optimizer: 200 runs
**Framework:** Hardhat 2.22.19 + OpenZeppelin v5 contracts

---

## 6. Backend Integration

### 6.1 Blockchain Service (`server/src/api/services/blockchain.service.js`)

A singleton service that handles all blockchain communication. Key design decisions:

**Transaction Queue:** All blockchain writes go through a serial queue to prevent nonce collisions (a common bug when multiple concurrent API requests try to send transactions simultaneously).

```
Request A (report submitted)  ──┐
Request B (vote cast)           ├──► TX Queue ──► Blockchain (sequential)
Request C (feedback given)    ──┘
```

**Fire-and-forget pattern:** Blockchain calls never block the API response. If the blockchain is slow or down, the core app continues working normally.

```javascript
// Report is saved to MongoDB and response sent immediately
// Blockchain operations happen in the background
setImmediate(async () => {
  await blockchain.recordReportCreated(...)
  await blockchain.rewardReportSubmitted(...)
})
```

### 6.2 Reward Triggers in Report Lifecycle

| User Action | MongoDB Update | Blockchain Action |
|---|---|---|
| Submit report | reportCount +1 | Mint 10 CIVI + record audit + check badges |
| Report resolved (reporter) | civiTokensEarned +25 | Mint 25 CIVI |
| Report resolved (employee) | resolvedCount +1, civiTokensEarned +20 | Mint 20 CIVI + check Issue Closer badge |
| Community vote | voteCount +1 | Mint 1 CIVI + check Top Voter badge |
| Provide feedback | feedbackCount +1, civiTokensEarned +5 | Mint 5 CIVI + check Feedback Provider badge |

### 6.3 New API Endpoints

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/blockchain/balance/:wallet` | GET | No | Get CIVI token balance for any wallet |
| `/api/blockchain/badges/:wallet` | GET | No | Get badge ownership for any wallet |
| `/api/blockchain/audit/:reportId` | GET | No | Get tamper-proof audit trail for a report |
| `/api/blockchain/me` | GET | Yes | Get logged-in user's full rewards profile |
| `/api/blockchain/connect-wallet` | POST | Yes | Link MetaMask wallet to account (signature-verified) |
| `/api/blockchain/disconnect-wallet` | DELETE | Yes | Unlink wallet from account |
| `/api/reports/my-stats` | GET | Yes | Get real total report counts by status |
| `/api/reports/:id/vote` | POST | Yes | Toggle community vote (earns 1 CIVI) |

### 6.4 Wallet Connection Security

When a citizen connects MetaMask, the server verifies ownership cryptographically:

```
1. Frontend requests: eth_requestAccounts (MetaMask)
2. Frontend signs: personal_sign("Citizora wallet link: {userId}")
3. Backend calls: ethers.utils.verifyMessage(message, signature)
4. If recovered address === submitted walletAddress → link confirmed
5. Otherwise → reject (prevents wallet spoofing)
```

### 6.5 Database Schema Changes

**User model additions:**
| Field | Type | Purpose |
|---|---|---|
| `walletAddress` | String (unique, sparse) | Connected Ethereum wallet |
| `civiTokensEarned` | Number (default: 0) | Lifetime CIVI earned (off-chain mirror) |
| `reportCount` | Number (default: 0) | Total reports submitted |
| `resolvedCount` | Number (default: 0) | Total reports resolved (employees) |
| `feedbackCount` | Number (default: 0) | Total feedback submissions |
| `voteCount` | Number (default: 0) | Total community votes cast |

**Report model additions:**
| Field | Type | Purpose |
|---|---|---|
| `votes` | Number (default: 0) | Community vote count |
| `votedBy` | [ObjectId] | Prevents duplicate voting |

---

## 7. Frontend Integration

### 7.1 WalletConnect Component
**Location:** `users/src/components/WalletConnect.jsx`
**Shown:** Right sidebar of Dashboard (when no report is selected)

**Flow:**
```
[Connect MetaMask button]
        ↓ Click
MetaMask popup → user approves
        ↓
Sign challenge message (proves wallet ownership)
        ↓
Backend verifies signature → links wallet to account
        ↓
Shows: wallet address | CIVI balance | badge count
        ↓
[Disconnect wallet] option available
```

### 7.2 RewardsPanel Component
**Location:** `users/src/components/RewardsPanel.jsx`
**Shown:** Below WalletConnect in Dashboard sidebar

Three tabs:

**Overview Tab:**
- On-chain CIVI token balance (large, highlighted)
- Total earned (lifetime, off-chain counter)
- Badge progress (X of 7 earned)

**Badges Tab:**
- All 7 badges displayed
- Earned: full colour, "Earned" green label
- Locked: greyscale, 50% opacity

**How to Earn Tab:**
- Full reward table with token amounts per action
- Explanation of Polygon blockchain verification

### 7.3 Dashboard Enhancements

**Pagination:** Reports are fetched 10 per page with Prev/Next/Page-number controls. Total count shows across all pages.

**Real stats cards:** Total Reports, In Progress, Resolved, Pending — all fetched from `/api/reports/my-stats` (counts entire database, not just current page).

**No auto-selection:** Dashboard no longer auto-selects the first report, showing the blockchain wallet panel by default.

### 7.4 ActiveCitizens Leaderboard
Shows `🪙 {civiTokensEarned} CIVI` badge next to each citizen, sorted by CIVI earned (highest first). Creates visible civic reputation.

---

## 8. Reward System Design

### Token Economics

| Action | CIVI Earned | Rationale |
|---|---|---|
| Submit a report | +10 | Core action — encourage participation |
| Report gets resolved | +25 | Highest reward — citizen waited and followed up |
| Field worker resolves | +20 | Incentivise employee quality and speed |
| Community upvote | +1 | Low value — prevents gaming |
| Provide feedback | +5 | Closes the loop, helps quality tracking |
| Refer a new citizen | +15 | Growth mechanic |

### Badge Achievement System

Badges use a `>=` threshold check with `hasBadge` deduplication — so a citizen who reaches 10 reports will always get the Dedicated Reporter badge on their next submission, even if they missed the exact 10th.

### Dual-counter Design

| Counter | Storage | Purpose |
|---|---|---|
| `civiTokensEarned` | MongoDB | Fast leaderboard queries, lifetime total |
| On-chain balance | Polygon blockchain | Actual spendable tokens (only when wallet connected) |

This means citizens build a civic score even before connecting a wallet, and can claim their full balance retroactively.

---

## 9. Security Features

### 9.1 What Is Already Secured by Blockchain

| Feature | How |
|---|---|
| Report integrity | keccak256 hash of report content stored on-chain at creation |
| Status change audit | Every status update hashed and recorded on-chain with actor wallet |
| Wallet ownership | Signature verification prevents impersonation |
| Badge authenticity | Soulbound NFTs cannot be transferred or faked |
| Minting authority | Only server's hot wallet (MINTER_ROLE) can issue tokens |

### 9.2 Proposed Next Feature: Citizen Profile Integrity

**Problem:** Currently, citizen profile data (name, email, phone) exists only in MongoDB. A database breach or insider threat could silently modify user records with no trace.

**Proposed Solution:** Hash citizen profile data on registration and every update, store on-chain.

```
Registration:
  profileHash = keccak256(userId + email + firstName + lastName)
  CiviAudit.recordCreate(userId, profileHash, walletAddress, "profile")

Profile Update:
  newHash = keccak256(userId + newEmail + newFirstName + newLastName)
  CiviAudit.recordStatusChange(userId, newHash, "profile_updated", actorWallet)

Verification (anytime):
  currentHash = keccak256(current MongoDB data)
  blockchainHash = query CiviAudit events for userId
  Match? → Data is genuine | No match? → Tampering detected
```

**What this achieves:**
- Any modification to a citizen's profile leaves a permanent blockchain trace
- Citizens can independently verify their own data has not been altered
- Platform builds trust with regulators and the public
- Zero change to current UX — all hashing happens silently in the background

---

## 10. Technical Stack Summary

| Component | Technology |
|---|---|
| Smart Contracts | Solidity 0.8.24, OpenZeppelin v5 |
| Contract Framework | Hardhat 2.22.19 |
| Blockchain Network | Polygon (EVM-compatible, low gas fees) |
| Backend Library | ethers.js v5 (server), ethers.js v6 (Hardhat scripts) |
| Wallet Integration | MetaMask, `window.ethereum`, `personal_sign` |
| Token Standard | ERC-20 (CIVI), ERC-721 soulbound (CiviBadge) |
| Contract Verification | Polygonscan API |

---

## 11. Testing & Verification (Completed Locally)

All features were tested end-to-end on a local Hardhat node:

| Test | Result |
|---|---|
| Deploy all 3 contracts | Passed |
| Mint 10 CIVI on report submission | Passed (balance confirmed via API) |
| Badge minted on first report | Passed |
| Wallet connect with MetaMask signature | Passed |
| Balance visible in UI (RewardsPanel) | Passed |
| Nonce collision prevention (tx queue) | Passed |
| Pagination (10 per page, page buttons) | Passed |
| Stats cards show real totals | Passed |
| Page persists on browser refresh | Passed |
| All 7 commits pushed to GitHub | Pushed |

---

## 12. Proposed Next Steps (Pending Approval)

### Priority 1 — Production Deployment
- Obtain sufficient MATIC on Polygon Amoy testnet (~0.05 MATIC)
- Deploy all 3 contracts to Amoy testnet
- Update server environment variables with real contract addresses
- Verify contracts on Polygonscan for public transparency

### Priority 2 — Citizen Profile Integrity (Security)
- Extend CiviAudit to record profile hashes on registration and update
- Add profile verification endpoint: `GET /api/blockchain/verify-profile/:userId`
- Zero UX change for citizens — fully transparent background operation

### Priority 3 — Future Features
- **Civic DAO Governance:** CIVI token holders vote on community issue priorities
- **AI Issue Triage:** Auto-categorise reports and detect duplicates on submission
- **Public Transparency Dashboard:** City-wide stats accessible without login
- **Report Deduplication:** Detect nearby similar reports, prompt upvote instead of duplicate

---

## 13. Repository

**GitHub:** https://github.com/Ranj8521Kumar/Citizora

**Key directories:**
```
blockchain/                          ← Hardhat project
  contracts/
    CiviToken.sol                    ← ERC-20 reward token
    CiviBadge.sol                    ← Soulbound achievement NFTs
    CiviAudit.sol                    ← Immutable audit trail
  scripts/
    deploy.js                        ← Deployment script
    grant-roles.js                   ← Role assignment script

server/src/api/
  services/blockchain.service.js     ← Core blockchain integration
  controllers/blockchain.controller.js
  routes/blockchain.routes.js

users/src/components/
  WalletConnect.jsx                  ← MetaMask connect UI
  RewardsPanel.jsx                   ← Token & badge display UI
```

---

*This document was prepared as part of the Citizora blockchain integration internship project at Dot Ventures.*
