// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Reputation {
    struct PaymentRecord {
        uint256 timestamp;
        uint256 amount;
        bool onTime;
        string paymentType; // "equb" or "iddir"
    }
    
    mapping(address => uint256) public reputationScores;
    mapping(address => PaymentRecord[]) public paymentHistory;
    mapping(address => uint256) public lastPaymentTime;
    
    event ReputationUpdated(address user, uint256 newScore, string reason);
    event PaymentRecorded(address user, uint256 amount, bool onTime, string paymentType);
    
    // Get user's reputation score
    function getReputationScore(address _user) external view returns (uint256) {
        return reputationScores[_user];
    }
    
    // Get user's payment history
    function getPaymentHistory(address _user) external view returns (PaymentRecord[] memory) {
        return paymentHistory[_user];
    }
    
    // Record on-time payment and increase reputation
    function recordOnTimePayment(address _user, uint256 _amount, string memory _paymentType) external {
        // Only authorized contracts can call this
        require(msg.sender == tx.origin || isAuthorizedContract(), "Not authorized");
        
        reputationScores[_user] = reputationScores[_user] + 5;
        if (reputationScores[_user] > 100) {
            reputationScores[_user] = 100; // Cap at 100
        }
        
        PaymentRecord memory record = PaymentRecord({
            timestamp: block.timestamp,
            amount: _amount,
            onTime: true,
            paymentType: _paymentType
        });
        
        paymentHistory[_user].push(record);
        lastPaymentTime[_user] = block.timestamp;
        
        emit ReputationUpdated(_user, reputationScores[_user], "On-time payment");
        emit PaymentRecorded(_user, _amount, true, _paymentType);
    }
    
    // Record late/missed payment and decrease reputation
    function recordMissedPayment(address _user, string memory _paymentType) external {
        // Only authorized contracts can call this
        require(msg.sender == tx.origin || isAuthorizedContract(), "Not authorized");
        
        reputationScores[_user] = reputationScores[_user] - 20;
        if (reputationScores[_user] < 0) {
            reputationScores[_user] = 0; // Floor at 0
        }
        
        PaymentRecord memory record = PaymentRecord({
            timestamp: block.timestamp,
            amount: 0,
            onTime: false,
            paymentType: _paymentType
        });
        
        paymentHistory[_user].push(record);
        
        emit ReputationUpdated(_user, reputationScores[_user], "Missed payment");
        emit PaymentRecorded(_user, 0, false, _paymentType);
    }
    
    // Initialize new user with default score
    function initializeUser(address _user) external {
        require(reputationScores[_user] == 0, "User already initialized");
        reputationScores[_user] = 50; // Start with neutral score
        emit ReputationUpdated(_user, 50, "User initialized");
    }
    
    // Check if user has good reputation (>= 70)
    function hasGoodReputation(address _user) external view returns (bool) {
        return reputationScores[_user] >= 70;
    }
    
    // Check if user has excellent reputation (>= 90)
    function hasExcellentReputation(address _user) external view returns (bool) {
        return reputationScores[_user] >= 90;
    }
    
    // Get payment statistics for a user
    function getPaymentStats(address _user) external view returns (
        uint256 totalPayments,
        uint256 onTimePayments,
        uint256 missedPayments,
        uint256 reputationScore
    ) {
        PaymentRecord[] memory history = paymentHistory[_user];
        uint256 onTime = 0;
        uint256 missed = 0;
        
        for (uint i = 0; i < history.length; i++) {
            if (history[i].onTime) {
                onTime++;
            } else {
                missed++;
            }
        }
        
        return (
            history.length,
            onTime,
            missed,
            reputationScores[_user]
        );
    }
    
    // Get days since last payment
    function getDaysSinceLastPayment(address _user) external view returns (uint256) {
        if (lastPaymentTime[_user] == 0) {
            return type(uint256).max; // Never paid
        }
        return (block.timestamp - lastPaymentTime[_user]) / 86400; // Convert to days
    }
    
    // Check if caller is authorized (simplified for demo)
    function isAuthorizedContract() internal view returns (bool) {
        // In a real implementation, you would check against a list of authorized contracts
        // For this demo, we'll allow any contract to call these functions
        return true;
    }
    
    // Manual reputation adjustment (for admin use)
    function adjustReputation(address _user, int256 _adjustment, string memory _reason) external {
        // In a real implementation, this would be restricted to admin addresses
        if (_adjustment > 0) {
            reputationScores[_user] = reputationScores[_user] + uint256(_adjustment);
            if (reputationScores[_user] > 100) {
                reputationScores[_user] = 100;
            }
        } else {
            if (uint256(-_adjustment) > reputationScores[_user]) {
                reputationScores[_user] = 0;
            } else {
                reputationScores[_user] = reputationScores[_user] - uint256(-_adjustment);
            }
        }
        
        emit ReputationUpdated(_user, reputationScores[_user], _reason);
    }
}
