// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.8.0;

import ".././node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import ".././node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./AssetErc721.sol";

// each assset will have its own set of erc20 token
// so that one asset do not affet the othee

// RefungibleToken to represent the divided protion of the asset asset
  
// you dont need to store shareholder details they can sell ther token on 3rd party dexs

// Refungible token
  
contract InvestmentContract is ERC20 {

    struct AssetDetails {
        uint256 shareSupply;    // 1 token = 1 share
        uint256 sharePrice;     // in dai
        uint256 shareToSold;
        // uint256 totalShareSold;   // equal to toal supply of token
        uint256 shareSoldInCurrentRound;
        uint256 investmentStartTime;
        uint256 investmentEndTime;
        // uint256 maxSharesPermitedToBuy;
        // bool kycRequired;
    }
    AssetDetails public assetDetails;
    
    uint256 public nftId;
    Asset public nftAsset;

    address daiAddress;
    IERC20 public dai = IERC20(daiAddress);

    // daiAdress and ntf token addres can be preprogemned
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _nftId,
        uint256 _shareSupply,
        uint256 _sharePrice,
        address _ntfAddress
    )
    ERC20(_name, _symbol) 
    {
        nftId = _nftId;
        assetDetails.shareSupply = _shareSupply;
        assetDetails.sharePrice = _sharePrice;
        nftAsset = Asset(_ntfAddress);
    }

    // we can add the min amount for shares that have to sold in order for the sccess otherwise return the investors their money
    // you can also tranfer tokens after the investment period ends, so that they cannot be sold in the secondary market becore periods end 
    
    // added logic for multiple round of funding
    function setDetails(
        uint256 _investmentStartTime,
        uint256 _investmentEndTime,
        uint256 _shareToSold
    ) external onlyOwner
    {
        require(block.timestamp > assetDetails.investmentEndTime);
        require(_shareToSold <= assetDetails.shareSupply - dai.totalSupply());
        
        assetDetails.investmentStartTime = block.timestamp + _investmentStartTime;
        assetDetails.investmentEndTime = block.timestamp + _investmentEndTime;
        assetDetails.shareToSold = _shareToSold;
        assetDetails.shareSoldInCurrentRound = 0;
    }
    
    function buyShare(uint256 _nShare) external{
        require(
            assetDetails.investmentStartTime > block.timestamp && 
            assetDetails.investmentEndTime < block.timestamp
        );
        require(assetDetails.shareToSold - assetDetails.shareSoldInCurrentRound >= _nShare);
        
        uint256 _daiAmount = _nShare * assetDetails.sharePrice;
        require(dai.balanceOf(msg.sender) >= _daiAmount);

        assetDetails.shareSoldInCurrentRound += _nShare;
        dai.transferFrom(msg.sender, address(this), _daiAmount);
        _mint(msg.sender, _nShare);
    }

    // we can make the withdraw fuction such tat i can witdreaw immidiety or after investiom period is over
    function withdrawProfits() external onlyOwner {
        require(block.timestamp > assetDetails.investmentEndTime);
        
        uint256 _contractDaiBalance = dai.balanceOf(address(this));
        if(_contractDaiBalance > 0) {
            dai.transfer(msg.sender, _contractDaiBalance);
        }
    }   

    // for admin to mint personat rtfs before and after the investment
    function convertShareToToken(uint256 _nShare) external onlyOwner{
        require(block.timestamp > assetDetails.investmentEndTime);
        require(assetDetails.shareSupply - dai.totalSupply() >= _nShare);

        _mint(msg.sender, _nShare);
    }

    function getOwner() public view returns(address) {
        return nftAsset.ownerOf(_tokenId);
    }

    modifier onlyOwner() {
        require(msg.sender == nftAsset.ownerOf(_tokenId));
        _;
    }
}
