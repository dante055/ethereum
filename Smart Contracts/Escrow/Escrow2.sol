
// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;

contract Escrow {
    enum StateSender {HAVE_NOT_SEND_ASSET, ASSET_ALREADY_SENT, GOT_PAYMENT}
    enum StateBuyer {HAVE_NOT_SEND_PAYMENT, GOT_ASSET}

    StateSender public currentStateSender;
    StateBuyer public currentStateBuyer;

    address public escrowAgent;
    address payable public sender;
    address public buyer;
    uint256 public amount;

    constructor(address payable _sender, address _buyer) public {
        sender = _sender;
        buyer = _buyer;
    }

    function sendAsset(uint256 _amount) external {
        require(msg.sender == sender, "caller is not the sender");
        require(
            currentStateSender == StateSender.HAVE_NOT_SEND_ASSET,
            "asset has already been sent or the transfer has been completeed"
        );
        amount = _amount;
        currentStateSender = StateSender.ASSET_ALREADY_SENT;
    }

    function withdrawAsset() external {
        require(msg.sender == sender, "caller is not the sender");
        require(
            currentStateSender == StateSender.ASSET_ALREADY_SENT,
            "asset has not been sent or the transfer has already been completeed"
        );
        amount = 0;
        currentStateSender = StateSender.HAVE_NOT_SEND_ASSET;
    }

    function depositAndTransferAsset() external payable {
        require(msg.sender == buyer, "caller is not buyer");
        require(
            currentStateSender == StateSender.ASSET_ALREADY_SENT,
            "asset has not been sent or the transfer has already been completeed"
        );
        require(
            currentStateBuyer == StateBuyer.HAVE_NOT_SEND_PAYMENT,
            "payment has alreay sent or the the transfer has been comleted"
        );
        require(msg.value == amount, "not enough funds to buy to the asset");

        sender.transfer(amount);
        currentStateBuyer = StateBuyer.GOT_ASSET;
        currentStateSender = StateSender.GOT_PAYMENT;
    }
}
