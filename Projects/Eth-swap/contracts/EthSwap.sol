/*
    erc 20 tokens exchange

    contract 1: eth spaw
    contract 2: custom token

    1 custom coin = 1000 wei

    // add token
    // list token
    // admin will deposite token
    // buyer will buy
    // seller will sell
    // admin can withdraw 

*/

/*
    front end:
        - avatar for address (blockies or identicon)
*/

// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../node_modules/@openzeppelin/contracts/math/SafeMath.sol";

contract EthSwap {
    using SafeMath for uint;

    // admin address
    address public admin;

    // token detail struct
    struct Token {
        bytes ticker;
        address tokenAddress;
        uint conversionRate;    // 1 token = ? wei;
    }

    // token detail mapping
    mapping(bytes => Token) public tokens;

    // token list
    bytes[] public tokenList;

    // event buy
    event BuyTokens(address indexed buyer, bytes ticker ,uint ethSend,  uint amount, uint conversionRate);
    
    // event sell
    event SellTokens(address indexed seller, bytes ticker ,uint ethReceived, uint amount, uint conversionRate);

    constructor() {
        admin = msg.sender;
    }

    // add tokens in the eth swap
    function addTokens(bytes calldata _ticker, address _tokenAddress, uint _conversionRate) external onlyAdmin() {
        tokens[_ticker] = Token(_ticker, _tokenAddress, _conversionRate);
        tokenList.push(_ticker);
    }

    // list token ticker with their address;
    function listToken() external view returns(Token[] memory) {
        Token[] memory _tokens = new Token[](tokenList.length);
        for(uint i = 0; i < tokenList.length; i++) {
            _tokens[i] = tokens[tokenList[i]];
        }
        return _tokens;
    }

    // user can buy tokens
    function buyTokens(bytes calldata _ticker) external payable tokenExist(_ticker) {
        address _tokenAddress = tokens[_ticker].tokenAddress;
        uint _conversionRate = tokens[_ticker].conversionRate;
        uint tokenAmount = msg.value.div(_conversionRate);

        require(msg.value.mod(_conversionRate) == 0, "You have send wrong amount to buy the token, recheck the conversion rate!");
        require(IERC20(_tokenAddress).balanceOf(address(this)) >= tokenAmount, "Contract have insufficient supply of this types of tokens!");

        IERC20(_tokenAddress).transfer(msg.sender, tokenAmount);
        emit BuyTokens(msg.sender, _ticker, msg.value, tokenAmount, _conversionRate);
    }

    // users can sell tokens
    // user will do a delegate transfer (remember to approve the transfer first)
    // decreaseAllowance in the front end when u have approved the transaction but u are unable to sell due to an error
    function sellTokens(bytes calldata _ticker,uint _amount) external tokenExist(_ticker) {
        address _tokenAddress = tokens[_ticker].tokenAddress;
        uint _conversionRate = tokens[_ticker].conversionRate;
        uint sellingAmount = _amount * _conversionRate;
        address payable sellerAddress = msg.sender;

        require(IERC20(_tokenAddress).balanceOf(msg.sender) >= _amount, "You have insufficient funds to complete the transaction!");
        require(address(this).balance > sellingAmount, "Contract have insufficient funds to buy this amount of token!");

        IERC20(_tokenAddress).transferFrom(msg.sender, address(this), _amount);
        sellerAddress.transfer(sellingAmount);

        emit SellTokens(msg.sender, _ticker, sellingAmount, _amount, _conversionRate);
    }

    function shouldAllowSelling(bytes calldata _ticker, uint _amount) external view tokenExist(_ticker) returns(bool){
        address _tokenAddress = tokens[_ticker].tokenAddress;
        uint sellingAmount = _amount * tokens[_ticker].conversionRate;

        require(IERC20(_tokenAddress).balanceOf(msg.sender) >= _amount, "You have insufficient funds to complete the transaction!");
        require(address(this).balance > sellingAmount, "Contract have insufficient funds to buy this amount of token!");

        return true;
    }

    // admin can withDraw
    function withdrawToken(bytes calldata _ticker, uint _amount) external tokenExist(_ticker) onlyAdmin(){
        address _tokenAddress = tokens[_ticker].tokenAddress;

        require(IERC20(_tokenAddress).balanceOf(address(this)) >= _amount, "Contract have insufficient supply of this types of tokens!");

        IERC20(_tokenAddress).transfer(msg.sender, _amount);
    }

    function withdrawEth(uint _amount) external onlyAdmin(){
        require(address(this).balance >= _amount, "Contract have insufficient sypply oth ether!");

        msg.sender.transfer(_amount);
    } 

    // ether balance of contract
    function balanceOf() external view returns (uint256) {
        return address(this).balance;
    }

    // token balnce of cntract
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

