// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.8.0;

contract InvestmentHolderContract {
    address owner;

    constructor(address _owner) {
        owner = _owner;
    }

    function balanceOf() external view returns(uint){
        return address(this).balance;
    }

    function withdraw(address payable _to, uint _amount) external onlyOwner {
        require(_amount <= address(this).balance);
        _to.transfer(_amount);
    }

    function transferOwnership(address _newOwner) external onlyOwner{
        owner = _newOwner;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
}