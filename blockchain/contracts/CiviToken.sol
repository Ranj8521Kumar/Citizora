// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title CiviToken
 * @notice ERC-20 reward token for Citizora civic engagement.
 *         Citizens and field workers earn CIVI by participating in the platform.
 *         Only the designated backend minter wallet can mint tokens.
 */
contract CiviToken is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10 ** 18; // 1 billion CIVI

    event TokensMinted(address indexed to, uint256 amount, string reason);
    event TokensBurned(address indexed from, uint256 amount);

    constructor(address minterAddress) ERC20("CiviToken", "CIVI") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, minterAddress);
    }

    function mint(address to, uint256 amount, string calldata reason) external onlyRole(MINTER_ROLE) {
        require(totalSupply() + amount <= MAX_SUPPLY, "CiviToken: max supply exceeded");
        _mint(to, amount);
        emit TokensMinted(to, amount, reason);
    }

    function burn(address from, uint256 amount) external onlyRole(MINTER_ROLE) {
        _burn(from, amount);
        emit TokensBurned(from, amount);
    }

    function addMinter(address minter) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(MINTER_ROLE, minter);
    }

    function removeMinter(address minter) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(MINTER_ROLE, minter);
    }
}
