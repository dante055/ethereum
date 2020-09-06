 pragma solidity >=0.6.0 <0.7.0;
pragma experimental ABIEncoderV2;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/math/SafeMath.sol";

contract Allowance {
    
    using SafeMath for uint;
    
    struct AllowanceHolders {
        bool exist;
        uint allowance;
        uint totalBalance;
        uint createdDate;
        uint nextInterval;
    }
    address public owner;
    mapping(address => AllowanceHolders) internal holders;
    
    event WithdrawEvent(address indexed, uint amount, uint timestamp);
    
    constructor() public {
        owner = msg.sender;
    }
    
    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner.");
        _;
    }
    
    modifier holderExist(address _address) {
        require(holders[_address].exist, "holder does not exist");
        _;
    }
    
    function getAllownceDetails(address _address) external view returns(AllowanceHolders memory) {
        return holders[_address];
    }
    
    function setAllownceHolder(address _address, uint _allownce, uint _interval) external isOwner {
        holders[_address].exist = true;
        holders[_address].allowance = _allownce;
        holders[_address].nextInterval = _interval;
    }
    
    function changeAllownceAmount(address _address, uint _amount) external isOwner holderExist(_address) {
        holders[_address].allowance = _amount;
    }
    
    function changeAllownceInterval(address _address, uint _interval) external isOwner holderExist(_address) {
        holders[_address].nextInterval = _interval;
    }
    
    function giveAllowance(address _address) external payable isOwner holderExist(_address) {
        require(msg.value == holders[_address].allowance, "Allowance amount do not match");
        
        if(holders[_address].createdDate != 0) {
            require(
                holders[_address].createdDate >= holders[_address].nextInterval * 1 weeks + now,
                "Already alloted allownce for this week"
            ); 
        }
        
        holders[_address].createdDate = now;
        holders[_address].totalBalance = holders[_address].totalBalance.add(msg.value); 
    }
    
    function withdrawAllowance(uint _amount) external holderExist(msg.sender) {
        require(holders[msg.sender].totalBalance >= _amount, "insufficient banance");
        holders[msg.sender].totalBalance = holders[msg.sender].totalBalance.sub(_amount);
        msg.sender.transfer(_amount);
        emit WithdrawEvent(msg.sender, _amount, now);
    }
}
