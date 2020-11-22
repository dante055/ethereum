// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.8.0;

import ".././node_modules/@openzeppelin/contracts/token/ERC721/IERC721.sol";
import './InvestmentHolderContract.sol';

contract InvetmentMarket {
    // struct can be optimize by specifing the bytes fr each type
    struct Assets {
        uint256 _assetValue;
        uint256 _shares;
        uint256 _sharesPublic; // how many share are been sold
        uint256 _sharesSold;
        uint256 _maxSharesPermitedToBuy; // how many share a individiual can buy
        bool _kycRequired;
        bool _investmentPermited;
    }
    mapping(uint256 => Assets) public assetDetails;

    struct ShareHolders {
        mapping(address => uint256) _shareHoldersMapping;
        address[] _shareHoldersArr;
    }
    mapping(uint256 => ShareHolders) shareHoldersDetails;

    mapping(uint => address) public investmentHolderCntractmapping;

    address assetTokenAddress;

    constructor(address _assetTokenAddress) {
        assetTokenAddress = _assetTokenAddress;
    }


    // mordify the logic for this so the the owner can not incerese asset vales according to its benift
    // use some kind of oracle to check the value then modiy it
    function setAssetDetails(
        uint256 _tokenId,
        uint256 _assetValue,
        uint256 _shares
    ) external {
        require(IERC721(assetTokenAddress).ownerOf(_tokenId) == msg.sender);
        assetDetails[_tokenId]._assetValue = _assetValue;
        assetDetails[_tokenId]._shares = _shares;
    }

    function beginInvestment(
        uint256 _tokenId,
        uint256 _sharesPublic,
        uint256 _maxSharesPermitedToBuy,
        bool _kycRequired
    ) external {
        require(IERC721(assetTokenAddress).ownerOf(_tokenId) == msg.sender);

        assetDetails[_tokenId]._sharesPublic = _sharesPublic;
        assetDetails[_tokenId]
            ._maxSharesPermitedToBuy = _maxSharesPermitedToBuy;
        assetDetails[_tokenId]._kycRequired = _kycRequired;

        // we can create a dummy contract to hold money for each contract or hold all the eth for all tokens in one single transaction
        // create investment holder contract
        address investmentContracAddess = address(new InvestmentHolderContract(msg.sender));
        investmentHolderCntractmapping[_tokenId] = investmentContracAddess;

        assetDetails[_tokenId]._investmentPermited = true;
    }

    // we can add condition in which the investment can be stopped
    // like return the invester their money, includng the gains
    function stopInvestment(uint256 _tokenId) external {
        require(IERC721(assetTokenAddress).ownerOf(_tokenId) == msg.sender);
        require(assetDetails[_tokenId]._investmentPermited);

        assetDetails[_tokenId]._investmentPermited = false;
    }

    function invest(uint _tokenId, uint _nshares) external payable tokenExist(_tokenId){
        uint singleSharevalue = assetDetails[_tokenId]._assetValue / assetDetails[_tokenId]._shares ;
        require(assetDetails[_tokenId]._investmentPermited);
        require(msg.value / singleSharevalue == _nshares);
        require(assetDetails[_tokenId]._shares - assetDetails[_tokenId]._sharesSold == _nshares);
        require(
            _nshares + shareHoldersDetails[_tokenId]._shareHoldersMapping[msg.sender] == 
            assetDetails[_tokenId]._maxSharesPermitedToBuy
        );
        
        payable(investmentHolderCntractmapping[_tokenId]).transfer(msg.value);
        shareHoldersDetails[_tokenId]._shareHoldersMapping[msg.sender] += _nshares;

        // optimise the logich to getting all the shareholder details
        if(shareHoldersDetails[_tokenId]._shareHoldersMapping[msg.sender] != 0) {
            shareHoldersDetails[_tokenId]._shareHoldersArr.push(msg.sender);
        }
    }

    // buy and sell using order books
    // function sellShares() external {}
    // function buyShares() external {}

    // if the token does not exit it will trow a erroe
    modifier tokenExist(uint _tokenId) {
        address _dummy = IERC721(assetTokenAddress).ownerOf(_tokenId);
        _;
    }
}
