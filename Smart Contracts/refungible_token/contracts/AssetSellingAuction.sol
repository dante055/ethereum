// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.8.0;

import ".././node_modules/@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract AssetSellingAuction {
    struct TokenSelling {
        uint256 _price;
        bool _sold;
    }
    mapping(uint256 => TokenSelling) public tokenSellingDetails;

    struct Auction {
        uint256 _startingPrice;
        uint256 _auctionStartTime;
        uint256 _auctionEndTime;
        uint256 _currentPrice;
        address _currentLeader;
        mapping(address => uint256) _bids;
    }
    mapping(uint256 => Auction) public auctionDetails;

    address assetTokenAddress;

    constructor(address _assetTokenAddress) {
        assetTokenAddress = _assetTokenAddress;
    }

    // we can add the requient that before selling or auction u have to take approval og majarity investors
    function sellToken(uint256 _tokenId, uint256 _price) external tokenExist(_tokenId){
        require(IERC721(assetTokenAddress).ownerOf(_tokenId) == msg.sender);

        tokenSellingDetails[_tokenId]._price = _price;
        IERC721(assetTokenAddress).approve(address(this), _tokenId);
    }

    function buyToken(uint256 _tokenId) external payable tokenExist(_tokenId){
        require(!tokenSellingDetails[_tokenId]._sold);
        require(msg.value == tokenSellingDetails[_tokenId]._price);

        tokenSellingDetails[_tokenId]._sold = true;

        address _tokenOwner = IERC721(assetTokenAddress).ownerOf(_tokenId);

        // send the money to the owner
        payable(_tokenOwner).transfer(tokenSellingDetails[_tokenId]._price);

        // tranfer the token
        IERC721(assetTokenAddress).transferFrom(_tokenOwner, msg.sender, _tokenId);
    }

    // can also add kyc logic
    function setAuctionDetails(
        uint256 _tokenId,
        uint256 _startingPrice,
        uint256 _auctionStartTime,
        uint256 _auctionEndTime
    ) external tokenExist(_tokenId) {
        require(IERC721(assetTokenAddress).ownerOf(_tokenId) == msg.sender);

        auctionDetails[_tokenId]._startingPrice = _startingPrice;
        auctionDetails[_tokenId]._auctionStartTime =
            block.timestamp +
            _auctionStartTime;
        auctionDetails[_tokenId]._auctionEndTime =
            block.timestamp +
            _auctionEndTime;

        IERC721(assetTokenAddress).approve(address(this), _tokenId);
    }

    // currently we are kepping the stakes in this conctract, but  can seprate int selling/auctioning token logic
    function makeBid(uint256 _tokenId) external payable tokenExist(_tokenId) {
        Auction storage auctionToken = auctionDetails[_tokenId];

        require(
            auctionToken._auctionStartTime < block.timestamp &&
                auctionToken._auctionEndTime > block.timestamp
        );

        uint256 _bid = msg.value + auctionToken._bids[msg.sender];
        require(
            _bid >= auctionToken._startingPrice &&
                _bid > auctionToken._currentPrice
        );

        auctionToken._currentLeader = msg.sender;
        auctionToken._bids[msg.sender] = _bid;
    }

    // later check the optimization in case we create seprate function without if
    // for auction
    function claimBack(uint256 _tokenId) external tokenExist(_tokenId) {
        Auction storage auctionToken = auctionDetails[_tokenId];

        require(auctionToken._auctionEndTime < block.timestamp);

        if (msg.sender == auctionToken._currentLeader) {
            IERC721(assetTokenAddress).transferFrom(IERC721(assetTokenAddress).ownerOf(_tokenId), msg.sender, _tokenId);
        } else {
            uint256 _bid = auctionToken._bids[msg.sender];
            auctionToken._bids[msg.sender] = 0;
            msg.sender.transfer(_bid);
        }
    }

    // if the token does not exit it will trow a erroe
    modifier tokenExist(uint _tokenId) {
        address _dummy = IERC721(assetTokenAddress).ownerOf(_tokenId);
        _;
    }
}
