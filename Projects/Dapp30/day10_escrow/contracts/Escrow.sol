// sender will lock 2x eth > buyer will lock 4x eth > sender will send the the asset > buyer will confirm
// 3x : amount is 2 / 4 - 6 / sender sent asset > now sender 4 eth  + assest (worth 2 eth is locked) = 6 eth / and buyer 6 eth - asset(2eth) = 4th > so sender is at more disadvantage if buyer dont confim the transction
// 4x : amount is 2 / 4 - 8 / sender sent asset > sender 4 eth + asset = 6th / buyer 8 eth - asset = 6 eth / now both have equal asset to loose

// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;

contract Escrow {
    enum StateSender {HAVE_NOT_LOCK_ETH, ALREADY_LOCK_ETH, GOT_PAYMENT}
    enum StateBuyer {HAVE_NOT_LOCK_ETH, ALREADY_LOCK_ETH, GOT_ASSET}

    StateSender public currentStateSender;
    StateBuyer public currentStateBuyer;

    address public escrowAgent;
    address payable public sender;
    address payable public buyer;
    uint256 public amount;

    bool public assetSent;
    bool public confirmTransfer;

    constructor(address payable _sender, address payable _buyer) public {
        escrowAgent = msg.sender;
        sender = _sender;
        buyer = _buyer;
    }

    function balanceOf() external view returns (uint256) {
        return address(this).balance;
    }

    function senderLockEth(uint256 _amount) external payable {
        require(msg.sender == sender, "caller is not the sender");
        require(
            currentStateBuyer == StateBuyer.HAVE_NOT_LOCK_ETH,
            "buyer has alrealy lock eth"
        );
        require(
            currentStateSender == StateSender.HAVE_NOT_LOCK_ETH,
            "sender has alrealy lock eth"
        );
        require(msg.value == 2 * _amount, "eth to lock is 2x time the amount");

        amount = _amount;
        assetSent = false;
        confirmTransfer = false;
        currentStateSender = StateSender.ALREADY_LOCK_ETH;
    }

    function senderUnlockEth() external {
        require(msg.sender == sender, "caller is not the sender");
        require(
            currentStateSender == StateSender.ALREADY_LOCK_ETH,
            "either you have not lock eth or you have already unlock it"
        );
        require(assetSent == false, "asset has already been sent");
        currentStateSender = StateSender.HAVE_NOT_LOCK_ETH;
        sender.transfer(2 * amount);
    }

    function buyerLockEth() external payable {
        require(msg.sender == buyer, "caller is not buyer");
        require(
            currentStateSender == StateSender.ALREADY_LOCK_ETH,
            "sender has not lock eth yet"
        );
        require(
            currentStateBuyer == StateBuyer.HAVE_NOT_LOCK_ETH,
            "alrealy lock eth"
        );
        require(
            msg.value == 4 * amount,
            "eth to be lock is 4x time the amount"
        );

        currentStateBuyer = StateBuyer.ALREADY_LOCK_ETH;
    }

    function buyerUnlockEth() external {
        require(msg.sender == buyer, "caller is not buyer");
        require(
            currentStateBuyer == StateBuyer.ALREADY_LOCK_ETH,
            "either eth has not been locked or it has been already unlocked"
        );
        require(assetSent == false, "asset has already been sent");

        currentStateBuyer = StateBuyer.HAVE_NOT_LOCK_ETH;
        buyer.transfer(4 * amount);
    }

    function senderSendAsset() external {
        require(msg.sender == sender, "caller is not the sender");
        require(
            currentStateSender == StateSender.ALREADY_LOCK_ETH,
            "sender has not yet lock the eth"
        );
        require(
            currentStateBuyer == StateBuyer.ALREADY_LOCK_ETH,
            "buyer has not yet lock the eth"
        );
        require(assetSent == false, "asset already sent");

        assetSent = true;
    }

    function buyerConfirmTranfer() external {
        require(msg.sender == buyer, "caller is not buyer");
        require(assetSent == true, "asset has not been sent");
        require(confirmTransfer == false, "transfer has already confirm");

        confirmTransfer = true;

        currentStateSender = StateSender.GOT_PAYMENT;
        currentStateBuyer = StateBuyer.GOT_ASSET;

        /*
        // If you want to reuse the escrow for the same sender and buyer after the transaction for the 1st asset is comfirmed
        currentStateSender = StateSender.HAVE_NOT_LOCK_ETH;
        currentStateBuyer = StateBuyer.HAVE_NOT_LOCK_ETH;
         */

        sender.transfer(3 * amount);
        buyer.transfer(3 * amount);

        // we can cut some amount from both sender and buyer and  to escrow agent here as fees
    }
}
