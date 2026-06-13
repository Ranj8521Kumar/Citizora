// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title CiviBadge
 * @notice Soulbound (non-transferable) ERC-721 achievement badges for Citizora.
 *         Each badge type represents a civic milestone. Tokens cannot be transferred
 *         once minted — they are permanently tied to the earning address.
 *
 * Badge types (uint8):
 *   0 = First Report
 *   1 = Dedicated Reporter (10 reports)
 *   2 = Community Champion (50 reports)
 *   3 = Issue Closer (field worker, 25 resolved)
 *   4 = Verified Citizen
 *   5 = Top Voter (100 votes)
 *   6 = Feedback Provider (10 feedbacks)
 */
contract CiviBadge is ERC721, AccessControl {
    using Strings for uint256;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint256 private _nextTokenId;
    string private _baseTokenURI;

    // user address => badge type => already owns it
    mapping(address => mapping(uint8 => bool)) private _hasBadge;
    // tokenId => badge type
    mapping(uint256 => uint8) public badgeType;

    event BadgeMinted(address indexed to, uint256 tokenId, uint8 badgeType, string badgeName);

    string[7] private BADGE_NAMES = [
        "First Report",
        "Dedicated Reporter",
        "Community Champion",
        "Issue Closer",
        "Verified Citizen",
        "Top Voter",
        "Feedback Provider"
    ];

    constructor(address minterAddress, string memory baseURI) ERC721("CiviBadge", "CVBDG") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, minterAddress);
        _baseTokenURI = baseURI;
    }

    function mint(address to, uint8 _badgeType) external onlyRole(MINTER_ROLE) returns (uint256) {
        require(_badgeType < 7, "CiviBadge: invalid badge type");
        require(!_hasBadge[to][_badgeType], "CiviBadge: badge already owned");

        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        badgeType[tokenId] = _badgeType;
        _hasBadge[to][_badgeType] = true;

        emit BadgeMinted(to, tokenId, _badgeType, BADGE_NAMES[_badgeType]);
        return tokenId;
    }

    function hasBadge(address user, uint8 _badgeType) external view returns (bool) {
        return _hasBadge[user][_badgeType];
    }

    function getUserBadges(address user) external view returns (bool[7] memory owned) {
        for (uint8 i = 0; i < 7; i++) {
            owned[i] = _hasBadge[user][i];
        }
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return string(abi.encodePacked(_baseTokenURI, uint256(badgeType[tokenId]).toString(), ".json"));
    }

    function setBaseURI(string calldata baseURI) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _baseTokenURI = baseURI;
    }

    // Soulbound: block all transfers except mint (from == address(0))
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        require(from == address(0), "CiviBadge: soulbound - transfers disabled");
        return super._update(to, tokenId, auth);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
