pragma solidity ^0.6.0;

import "./Crowdsale.sol";
import "./KycContract.sol";


contract MyTokenSale is Crowdsale {
    KycContract kyc;

    constructor(
        uint256 rate, // rate in TKNbits  (1 wei = 1 token)
        address payable wallet, // address which gets th money
        IERC20 token,   // token address
        KycContract _kyc
    ) public Crowdsale(rate, wallet, token) {
        kyc = _kyc;
    }

    function _preValidatePurchase(address beneficiary, uint256 weiAmount)
        internal view override
    {
        super._preValidatePurchase(beneficiary, weiAmount);
        require(
            kyc.kycCompleted(beneficiary),
            "KYC Not completed, purchase not allowed"
        );
    }
}
