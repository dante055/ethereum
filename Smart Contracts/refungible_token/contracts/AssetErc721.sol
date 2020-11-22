// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.8.0;

import '.././node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol';
import './InvestmentContract.sol';

contract Asset is ERC721{
    address public assetManger;        // push in token id arr

    uint[] tokenIdsArr;
    mapping(uint => address) public investmentContractAddressMapping;

    constructor (string memory _name, string memory _symbol) ERC721(_name, _symbol) {
        assetManger = msg.sender;
    }

    // for minting u have to give some king of proof tha u onw the asset and that the shareSupply and price is correct
    // you also have to see how u will chante the share supply and share price
    // we can create logic to dynamiacally create rft name and symbol
    function mint(
        address _to, 
        uint _tokenId, 
        string calldata _rftName, 
        string calldata _rftSymbol, 
        uint _shareSupply, 
        uint _sharePrice
    ) 
        external 
        onlyAssetManager 
    {   
        // mint
        _mint(_to, _tokenId);

        // create investment contract
        InvestmentContract _investmentContract = new InvestmentContract(
            _rftName,
            _rftSymbol,
            _tokenId,
            _shareSupply,
            _sharePrice,
            address(this)
        );
        investmentContractAddressMapping[_tokenId] = address(_investmentContract);

        // push in token id arr
        tokenIdsArr.push(_tokenId);

    }

    function listTokenIds() external view returns(uint[] memory) {
        return tokenIdsArr;
    }

    modifier onlyAssetManager() {
        require(msg.sender == assetManger);
        _;
    }

}

