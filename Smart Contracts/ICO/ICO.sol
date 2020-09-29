// SPDX-License-Identifier: MIT

pragma solidity ^0.7.0;

import "./ERC20/IERC20.sol";
import "./IcoToken.sol";
import "./ERC20/SafeMath.sol";

/* 
    use chainlink alarm to open, close and to run transferToken (at the end) 
    according to start and end time of ico

    chainlink smart contracts are in versionn 0.6.0;
*/

contract ICO {
    using SafeMath for uint;

    address public admin;
    address public icoTokenAddress;
    // IcoToken private icoToken;

    // enum IcoState {INACTIVE, READY, OPEN, FINISHED}
    enum IcoState {INACTIVE, ACTIVE, FINISHED}
    IcoState public icoState;

    uint256 public totalTokenSupply;
    uint256 public availableTokens;
    uint256 public tokenPrice;
    uint256 public minPurchaseAllowed;
    uint256 public maxPurchaseAllowed;
    uint256 public icoStartTime;
    uint256 public icoEndTime;

    struct Investors {
        bool isApproved;    // kyc is done
        bool isInvestor;
        uint256 tokens;
    }
    address[] private investorsArray;
    mapping(address => Investors) public investorsMap;

    constructor(uint256 _totalSupply) {
        IcoToken _icoToken = new IcoToken(_totalSupply);
        icoTokenAddress = address(_icoToken);

        admin = msg.sender;
    }

    function startIco(
        uint256 _icoStartTime, 
        uint256 _icoEndTime, 
        uint256 _availabeTokens, 
        uint256 _tokenPrice,
        uint256 _minPurchaseAllowed,
        uint256 _maxPurchaseAllowed
    ) 
        external
        onlyAdmin()
        checkState(IcoState.INACTIVE)
    {
        totalTokenSupply = IERC20(icoTokenAddress).totalSupply();
        require(_icoStartTime > 0, "Give investors some ime to get ready!!");
        require(_icoEndTime > 0, "End time should be greater than zero!!");
        require(
            _availabeTokens <= totalTokenSupply, 
            "Tokens available to buy should be less than equal to total supply of the token!!"
        );
        require(_tokenPrice > 0, "Token price should be greater than zero!!");
        require(
            _minPurchaseAllowed > 0 && _minPurchaseAllowed <= _maxPurchaseAllowed,
            "MinTokenPurchaseAllowed should be greater than zero and less than MaxTokenPurchaseAllowed!!"
        );
        require(
            _maxPurchaseAllowed <= _availabeTokens,
            "MaxTokenPurchaseAllowed should be greater than MinTokenPurchaseAllowed and less than or equal availabe tokens!!"
        );

        icoStartTime = block.timestamp.add(_icoStartTime);
        icoEndTime = icoStartTime.add(_icoEndTime);
        availableTokens = _availabeTokens;
        tokenPrice = _tokenPrice;
        minPurchaseAllowed = _minPurchaseAllowed;
        maxPurchaseAllowed = _maxPurchaseAllowed;

        icoState = IcoState.ACTIVE;
    }

    /* 
        empty address: 0x0000000000000000000000000000000000000000
        empty arrat: []
    */
    function kyc(address _investor, address[] memory _investors) 
        external 
        onlyAdmin() 
    {
        require(icoState != IcoState.FINISHED , "The ico is finished so there is no need to approved more investors!!");
        
        if(_investor != address(0)) {
            investorsMap[_investor].isApproved = true;
        }

        if(_investors.length > 0) {
            for(uint i=0; i < _investors.length; i++) {
                investorsMap[_investors[i]].isApproved = true;
            }
        }
    }

    function invest() 
        external 
        payable
        checkState(IcoState.ACTIVE)
    {
        require(
            block.timestamp >= icoStartTime, 
            "The ico is active but the investion period has not begin yet, check the investement start time again!!"
        );
        require(
            icoEndTime >= block.timestamp || availableTokens == 0, 
            "The ico is finished!!"
        );
        require(investorsMap[msg.sender].isApproved == true, "You are not an approved investor!!");
        require(tokenPrice.mod(msg.value) == 0, "Send a multiple of the token price as the value!");

        uint _tokens = tokenPrice.div(msg.value);
        require(availableTokens >= _tokens, "Insuffecient supply of tokens, check how much amount o tokes are available!!");
        require(
            _tokens > 0 &&
            _tokens.add(investorsMap[msg.sender].tokens) > minPurchaseAllowed, 
            "You are not buying the miniumum no of tokens required!!"
        );
        require(
            maxPurchaseAllowed >= _tokens.add(investorsMap[msg.sender].tokens), 
            "You have already bought the max amoumout of tokens allocated to single investor!!"
        );

        if(!investorsMap[msg.sender].isInvestor) {
            investorsArray.push(msg.sender);
            investorsMap[msg.sender].isInvestor = true;
        }
        availableTokens = availableTokens.sub(_tokens);
        investorsMap[msg.sender].tokens = investorsMap[msg.sender].tokens.add(_tokens);
        
        /*
            you have to send the tokens at the end of the ice so that no one can manipulate token prices in the seconddary market
            IERC20(icoTokenAddress).transfer(msg.sender, _tokens);
        */
    }

    function transferTokens()
        external
        onlyAdmin()
        checkState(IcoState.ACTIVE)
    {
        require(
            icoEndTime < block.timestamp || availableTokens == 0, 
            "The ico is not finished yet!!"
        );

        icoState = IcoState.FINISHED;

        for(uint i = 0; i < investorsArray.length; i++) {
            IERC20(icoTokenAddress).transfer(investorsArray[i], investorsMap[investorsArray[i]].tokens);
        } 
    }

    function withDrawEth(address payable _recipient, uint _amount) 
        external
        onlyAdmin() 
    {
        require(address(this).balance >= _amount);
        _recipient.transfer(_amount);
    }

    function withDrawIcoToken(address _recipient, uint _amount) 
        external
        onlyAdmin() 
        checkState(IcoState.FINISHED)
    {
        require(IERC20(icoTokenAddress).balanceOf(address(this)) >= _amount);
        IERC20(icoTokenAddress).transfer(_recipient, _amount);
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Caller is not admin!!");
        _;
    }

    modifier checkState(IcoState _state) {
        require(icoState == _state, "The ico is not is correct state!!");
        _;
    }

    

}