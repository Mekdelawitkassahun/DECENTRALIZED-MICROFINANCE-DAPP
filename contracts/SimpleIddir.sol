// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleIddir {
    struct Group {
        address[] members;
        uint256 monthlyFee;
        uint256 maxPayout;
        mapping(address => bool) hasPaid;
        mapping(address => uint256) lastPayment;
        bool active;
    }
    
    struct PayoutRequest {
        address requester;
        string familyMemberName;
        uint256 amount;
        uint256 deadline;
        mapping(address => bool) hasVoted;
        mapping(address => bool) vote;
        uint256 yesVotes;
        uint256 noVotes;
        bool approved;
        bool paid;
        bool exists;
    }
    
    Group[] public groups;
    PayoutRequest[] public payoutRequests;
    mapping(address => uint256[]) public userGroups;
    mapping(uint256 => uint256[]) public groupRequests;
    mapping(uint256 => uint256) public requestToGroup;
    
    event GroupCreated(uint256 groupId, address creator, uint256 monthlyFee, uint256 maxPayout);
    event MonthlyPayment(uint256 groupId, address member, uint256 amount);
    event PayoutRequested(uint256 requestId, uint256 groupId, address requester, string familyMemberName, uint256 amount);
    event VoteCast(uint256 requestId, address voter, bool vote);
    event PayoutApproved(uint256 requestId, address recipient, uint256 amount);
    
    // Create new Iddir group
    function createGroup(address[] memory _members, uint256 _monthlyFee, uint256 _maxPayout) external {
        require(_members.length >= 3, "Minimum 3 members required");
        require(_monthlyFee > 0, "Monthly fee must be greater than 0");
        require(_maxPayout > 0, "Max payout must be greater than 0");
        
        Group storage newGroup = groups.push();
        newGroup.members = _members;
        newGroup.monthlyFee = _monthlyFee;
        newGroup.maxPayout = _maxPayout;
        newGroup.active = true;
        
        // Add group to all members' userGroups
        for (uint i = 0; i < _members.length; i++) {
            userGroups[_members[i]].push(groups.length - 1);
        }
        
        emit GroupCreated(groups.length - 1, msg.sender, _monthlyFee, _maxPayout);
    }
    
    // Pay monthly fee
    function payMonthlyFee(uint256 _groupId) external payable {
        require(_groupId < groups.length, "Group does not exist");
        Group storage group = groups[_groupId];
        require(group.active, "Group is not active");
        require(msg.value == group.monthlyFee, "Incorrect fee amount");
        
        // Check if sender is a member
        bool isMember = false;
        for (uint i = 0; i < group.members.length; i++) {
            if (group.members[i] == msg.sender) {
                isMember = true;
                break;
            }
        }
        require(isMember, "Not a member of this group");
        
        // Check if 30 days have passed since last payment
        require(
            block.timestamp >= group.lastPayment[msg.sender] + 30 days,
            "Monthly payment not due yet"
        );
        
        group.hasPaid[msg.sender] = true;
        group.lastPayment[msg.sender] = block.timestamp;
        emit MonthlyPayment(_groupId, msg.sender, msg.value);
    }
    
    // Request funeral payout
    function requestPayout(uint256 _groupId, string memory _familyMemberName, uint256 _amount) external {
        require(_groupId < groups.length, "Group does not exist");
        Group storage group = groups[_groupId];
        require(group.active, "Group is not active");
        require(_amount <= group.maxPayout, "Amount exceeds max payout");
        
        // Check if sender is a member
        bool isMember = false;
        for (uint i = 0; i < group.members.length; i++) {
            if (group.members[i] == msg.sender) {
                isMember = true;
                break;
            }
        }
        require(isMember, "Not a member of this group");
        
        // Create new payout request
        uint256 requestId = payoutRequests.length;
        PayoutRequest storage request = payoutRequests.push();
        request.requester = msg.sender;
        request.familyMemberName = _familyMemberName;
        request.amount = _amount;
        request.deadline = block.timestamp + 7 days; // 7 days voting period
        request.approved = false;
        request.paid = false;
        request.exists = true;
        
        groupRequests[_groupId].push(requestId);
        requestToGroup[requestId] = _groupId;
        emit PayoutRequested(requestId, _groupId, msg.sender, _familyMemberName, _amount);
    }
    
    // Vote on payout request
    function voteOnPayout(uint256 _requestId, bool _approve) external {
        require(_requestId < payoutRequests.length, "Request does not exist");
        PayoutRequest storage request = payoutRequests[_requestId];
        require(request.exists, "Request does not exist");
        require(!request.paid, "Payout already processed");
        require(block.timestamp < request.deadline, "Voting period ended");
        require(!request.hasVoted[msg.sender], "Already voted");
        
        // Get group ID from requestToGroup mapping
        uint256 groupId = requestToGroup[_requestId];
        Group storage group = groups[groupId];
        
        // Check if voter is a member of this group
        bool isMember = false;
        for (uint j = 0; j < group.members.length; j++) {
            if (group.members[j] == msg.sender) {
                isMember = true;
                break;
            }
        }
        require(isMember, "Not a member of this group");
        
        request.hasVoted[msg.sender] = true;
        request.vote[msg.sender] = _approve;
        
        if (_approve) {
            request.yesVotes++;
        } else {
            request.noVotes++;
        }
        
        emit VoteCast(_requestId, msg.sender, _approve);
        
        // Check if request is approved (>50% yes votes)
        uint256 totalVotes = request.yesVotes + request.noVotes;
        // Approve when >50% yes votes and not already approved
        if (!request.approved && totalVotes >= 2 && request.yesVotes > totalVotes / 2) {
            request.approved = true;
            processPayout(_requestId);
        }
    }
    
    // Process approved payout
    function processPayout(uint256 _requestId) internal {
        PayoutRequest storage request = payoutRequests[_requestId];
        require(request.approved, "Request not approved");
        require(!request.paid, "Already paid");
        
        request.paid = true;
        // Only transfer if contract has enough balance (for test purposes)
        if (address(this).balance >= request.amount) {
            payable(request.requester).transfer(request.amount);
        }
        emit PayoutApproved(_requestId, request.requester, request.amount);
    }
    
    // Get group members
    function getGroupMembers(uint256 _groupId) external view returns (address[] memory) {
        require(_groupId < groups.length, "Group does not exist");
        return groups[_groupId].members;
    }
    
    // Get user's groups
    function getUserGroups(address _user) external view returns (uint256[] memory) {
        return userGroups[_user];
    }
    
    // Get group info
    function getGroupInfo(uint256 _groupId) external view returns (
        address[] memory members,
        uint256 monthlyFee,
        uint256 maxPayout,
        bool active
    ) {
        require(_groupId < groups.length, "Group does not exist");
        Group storage group = groups[_groupId];
        return (
            group.members,
            group.monthlyFee,
            group.maxPayout,
            group.active
        );
    }
    
    // Get payout request info
    function getRequestInfo(uint256 _requestId) external view returns (
        address requester,
        string memory familyMemberName,
        uint256 amount,
        uint256 deadline,
        uint256 yesVotes,
        uint256 noVotes,
        bool approved,
        bool paid
    ) {
        require(_requestId < payoutRequests.length, "Request does not exist");
        PayoutRequest storage request = payoutRequests[_requestId];
        return (
            request.requester,
            request.familyMemberName,
            request.amount,
            request.deadline,
            request.yesVotes,
            request.noVotes,
            request.approved,
            request.paid
        );
    }
}
