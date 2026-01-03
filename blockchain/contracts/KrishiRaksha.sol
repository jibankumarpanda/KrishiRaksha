// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract KrishiRaksha {
    struct Claim {
        address farmer;
        string farmerId;
        string cropType;
        uint256 damagePercentage;
        uint256 claimAmount;
        string ipfsHash;
        bool approved;
        bool paid;
        uint256 timestamp;
    }
    
    mapping(uint256 => Claim) public claims;
    uint256 public claimCounter;
    address public owner;
    
    event ClaimSubmitted(uint256 claimId, address farmer, string farmerId);
    event ClaimApproved(uint256 claimId, uint256 amount);
    event PayoutAuthorized(uint256 claimId, address farmer, uint256 amount);
    
    constructor() {
        owner = msg.sender;
    }
    
    function submitClaim(
        string memory _farmerId,
        string memory _cropType,
        uint256 _damagePercentage,
        uint256 _claimAmount,
        string memory _ipfsHash
    ) public returns (uint256) {
        claimCounter++;
        claims[claimCounter] = Claim({
            farmer: msg.sender,
            farmerId: _farmerId,
            cropType: _cropType,
            damagePercentage: _damagePercentage,
            claimAmount: _claimAmount,
            ipfsHash: _ipfsHash,
            approved: false,
            paid: false,
            timestamp: block.timestamp
        });
        
        emit ClaimSubmitted(claimCounter, msg.sender, _farmerId);
        return claimCounter;
    }
    
    function approveClaim(uint256 _claimId) public {
        require(msg.sender == owner, "Only owner can approve");
        require(!claims[_claimId].approved, "Already approved");
        
        claims[_claimId].approved = true;
        emit ClaimApproved(_claimId, claims[_claimId].claimAmount);
        emit PayoutAuthorized(_claimId, claims[_claimId].farmer, claims[_claimId].claimAmount);
    }
    
    function markAsPaid(uint256 _claimId) public {
        require(msg.sender == owner, "Only owner can mark as paid");
        require(claims[_claimId].approved, "Claim not approved");
        
        claims[_claimId].paid = true;
    }
    
    function getClaim(uint256 _claimId) public view returns (Claim memory) {
        return claims[_claimId];
    }
}