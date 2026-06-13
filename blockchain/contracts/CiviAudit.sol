// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title CiviAudit
 * @notice Immutable audit trail for Citizora civic reports.
 *         Every report status change is recorded as an on-chain event,
 *         allowing any party to independently verify the full history
 *         of a report without relying solely on the Citizora database.
 *
 *         Events are indexed by reportId (off-chain MongoDB _id as string),
 *         enabling efficient log queries via reportId filter.
 */
contract CiviAudit is AccessControl {
    bytes32 public constant RECORDER_ROLE = keccak256("RECORDER_ROLE");

    event ReportEvent(
        string indexed reportId,
        bytes32 contentHash,
        string status,
        address indexed updatedBy,
        uint256 timestamp
    );

    event ReportCreated(
        string indexed reportId,
        bytes32 contentHash,
        address indexed submittedBy,
        string category,
        uint256 timestamp
    );

    constructor(address recorderAddress) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(RECORDER_ROLE, recorderAddress);
    }

    /**
     * @notice Record the creation of a new civic report.
     * @param reportId  MongoDB _id of the report (as hex string)
     * @param contentHash  keccak256(reportId + title + description + category)
     * @param submittedBy  wallet address of the citizen (or zero if not connected)
     * @param category  report category string
     */
    function recordCreate(
        string calldata reportId,
        bytes32 contentHash,
        address submittedBy,
        string calldata category
    ) external onlyRole(RECORDER_ROLE) {
        emit ReportCreated(reportId, contentHash, submittedBy, category, block.timestamp);
    }

    /**
     * @notice Record a status change on an existing report.
     * @param reportId  MongoDB _id of the report
     * @param contentHash  keccak256(reportId + newStatus + timestamp)
     * @param status  new status string
     * @param updatedBy  wallet address of the actor (or zero if not connected)
     */
    function recordStatusChange(
        string calldata reportId,
        bytes32 contentHash,
        string calldata status,
        address updatedBy
    ) external onlyRole(RECORDER_ROLE) {
        emit ReportEvent(reportId, contentHash, status, updatedBy, block.timestamp);
    }

    function addRecorder(address recorder) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(RECORDER_ROLE, recorder);
    }
}
