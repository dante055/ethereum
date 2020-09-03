// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;   

import '../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol';

/* 
    stake dai tokens 

    
    issue customCoin token :  10% of the stake amount: 10dai = 10 * 10//100 = 1 customCoin
        for issuing tokens we can add a function which will issue some amount of tokens on regular interval
    
    unstaking tokens
        we can add  some thing like min time limit to unstake and and the penelitu if u unstake it too soo
*/

contract TOkenStake {
    address public admin;
    address public customCoinAddress;
    uint public rewardTime;

    struct Token {
        bytes ticker;
        address tokenAddress;
        address[] stakersArray;
    }
    mapping(bytes => Token) public tokens;
    bytes[] public tokenList;

    struct Staker {
        bool isStaker;
        uint stakingBalance;
        uint nextRewadTime;
    }
    mapping(address => Staker) public stakersMapping;

    constructor(address _customCoinAddress, uint _rewardTime) {
        admin = msg.sender;
        customCoinAddress = _customCoinAddress;
        rewardTime = _rewardTime;
    }

    function addTokens(bytes calldata _ticker, address _tokenAddress) external onlyAdmin() {
        address[] memory stakersArray;
        tokens[_ticker] = Token(_ticker, _tokenAddress, stakersArray);
        tokenList.push(_ticker);
    }

    function listToken() external view returns(Token[] memory) {
        Token[] memory _tokens = new Token[](tokenList.length);
        for(uint i = 0; i < tokenList.length; i++) {
            _tokens[i] = tokens[tokenList[i]];
        }
        return _tokens;
    }

    // stake dai tokens and issue customCoin token 
    // remember to approve the transfer in testing, migration and frontend
    function stake(bytes calldata _ticker, uint _amount) external tokenExist(_ticker){
        address tokenAddress = tokens[_ticker].tokenAddress;

        require(IERC20(tokenAddress).balanceOf(msg.sender) >= _amount, "Insufficient balance of tokens in the user wallet!");

        if(!stakersMapping[msg.sender].isStaker) {
            tokens[_ticker].stakersArray.push(msg.sender);
        }
        stakersMapping[msg.sender].isStaker = true;
        stakersMapping[msg.sender].stakingBalance += _amount;
        stakersMapping[msg.sender].nextRewadTime = block.timestamp + rewardTime;

        IERC20(tokenAddress).transferFrom(msg.sender, address(this), _amount);
    }

    // unstake token
    function unstake(bytes calldata _ticker, uint _amount) external tokenExist(_ticker){
        address tokenAddress = tokens[_ticker].tokenAddress;

        require(stakersMapping[msg.sender].isStaker == true, "Caller is not a staker!");
        require(stakersMapping[msg.sender].stakingBalance > 0, "Caller staking balnce should be greater than zero!");

        stakersMapping[msg.sender].stakingBalance -= _amount;

        if(stakersMapping[msg.sender].stakingBalance == 0) {
            stakersMapping[msg.sender].isStaker = false;
        }

        IERC20(tokenAddress).transfer(msg.sender, _amount);
    }

    // issue: see how to tun this function on regular intervals 
    // also remove the unstaker fron the array here
    // think about how to check that the contract has availabe balance/liquidity of each type of token
    function issue() external {

        for(uint i = 0; i < tokenList.length; i++) {
            for(uint j = 0; j < tokens[tokenList[i]].stakersArray.length; i++) {

                address staker = tokens[tokenList[i]].stakersArray[j];

                if(stakersMapping[staker].isStaker) {
                    if(stakersMapping[staker].nextRewadTime <= block.timestamp) {
                        uint256 eligibleRewadPayouts = block.timestamp - stakersMapping[staker].nextRewadTime == 0 
                            ? 1 
                            : (block.timestamp - stakersMapping[staker].nextRewadTime) / rewardTime;

                        // rewad payout is 10% of tokens stake
                        uint payoutAmout = ((stakersMapping[staker].stakingBalance * 10) / 100) * eligibleRewadPayouts;
                
                        IERC20(customCoinAddress).transfer(address(this), payoutAmout);

                        stakersMapping[staker].nextRewadTime = block.timestamp + (block.timestamp / rewardTime);
                    }
                } else {
                    // remove this address form the array

                    // way 1: create a new staker array
                    // way 2: move the last user to this postion, delete the last element and reduce the size of the array
                }
            }
        }

    }


    function balanceOf() external view returns (uint256) {
        return address(this).balance;
    }

    function balanceOfToken(bytes calldata _ticker) external view tokenExist(_ticker) returns (uint256) {
        address _tokenAddress = tokens[_ticker].tokenAddress;

        return IERC20(_tokenAddress).balanceOf(address(this));
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Caller is not admin!");
        _;
    }

    modifier tokenExist(bytes calldata _ticker) {
        require(
            tokens[_ticker].tokenAddress != address(0),
            "Token does not exist!"
        );
        _;
    }
}