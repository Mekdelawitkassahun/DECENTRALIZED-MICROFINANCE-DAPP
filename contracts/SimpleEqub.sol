// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleEqub {
    struct Group {
        address[] members;
        uint256 fee;
        uint256 cycleDuration;
        uint256 lastPayout;
        uint256 currentIndex;
        mapping(address => bool) paid;
        bool active;
    }
    
    Group[] public groups;
    mapping(address => uint256[]) public userGroups;
    
    event GroupCreated(uint256 groupId, address creator, uint256 fee, uint256 cycleDuration);
    event PaymentMade(uint256 groupId, address member, uint256 amount);
    event PayoutSent(uint256 groupId, address winner, uint256 amount);
    
    // Create new Equb group
    function createGroup(address[] memory _members, uint256 _fee, uint256 _cycleDuration) external {
        require(_members.length >= 2, "Minimum 2 members required");
        require(_fee > 0, "Fee must be greater than 0");
        require(_cycleDuration > 0, "Cycle duration must be greater than 0");
        
        Group storage newGroup = groups.push();
        newGroup.members = _members;
        newGroup.fee = _fee;
        newGroup.cycleDuration = _cycleDuration;
        newGroup.lastPayout = block.timestamp;
        newGroup.currentIndex = 0;
        newGroup.active = true;
        
        // Add group to all members' userGroups
        for (uint i = 0; i < _members.length; i++) {
            userGroups[_members[i]].push(groups.length - 1);
        }
        
        emit GroupCreated(groups.length - 1, msg.sender, _fee, _cycleDuration);
    }
    
    // Pay fee for current cycle
    function payFee(uint256 _groupId) external payable {
        require(_groupId < groups.length, "Group does not exist");
        Group storage group = groups[_groupId];
        require(group.active, "Group is not active");
        require(msg.value == group.fee, "Incorrect fee amount");
        require(!group.paid[msg.sender], "Already paid for this cycle");
        
        // Check if sender is a member
        bool isMember = false;
        for (uint i = 0; i < group.members.length; i++) {
            if (group.members[i] == msg.sender) {
                isMember = true;
                break;
            }
        }
        require(isMember, "Not a member of this group");
        
        group.paid[msg.sender] = true;
        emit PaymentMade(_groupId, msg.sender, msg.value);
        
        // Check if all members have paid
        if (allMembersPaid(_groupId)) {
            distributePayout(_groupId);
        }
    }
    
    // Check if all members have paid
    function allMembersPaid(uint256 _groupId) internal view returns (bool) {
        Group storage group = groups[_groupId];
        for (uint i = 0; i < group.members.length; i++) {
            if (!group.paid[group.members[i]]) {
                return false;
            }
        }
        return true;
    }
    
    // Distribute payout to current winner
    function distributePayout(uint256 _groupId) internal {
        Group storage group = groups[_groupId];
        address winner = group.members[group.currentIndex];
        uint256 totalAmount = group.fee * group.members.length;
        
        // Reset payment status for next cycle
        for (uint i = 0; i < group.members.length; i++) {
            group.paid[group.members[i]] = false;
        }
        
        // Update to next winner
        group.currentIndex = (group.currentIndex + 1) % group.members.length;
        group.lastPayout = block.timestamp;
        
        // Send payout
        payable(winner).transfer(totalAmount);
        emit PayoutSent(_groupId, winner, totalAmount);
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
        uint256 fee,
        uint256 cycleDuration,
        uint256 lastPayout,
        uint256 currentIndex,
        bool active
    ) {
        require(_groupId < groups.length, "Group does not exist");
        Group storage group = groups[_groupId];
        return (
            group.members,
            group.fee,
            group.cycleDuration,
            group.lastPayout,
            group.currentIndex,
            group.active
        );
    }
}
