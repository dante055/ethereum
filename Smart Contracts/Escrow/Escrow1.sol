
// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;

contract Escrow {
    enum StateSender {HAVE_NOT_SEND_ASSET, ASSET_ALREADY_SENT, GOT_PAYMENT}
    enum StateBuyer {HAVE_NOT_SEND_PAYMENT, PAYMENT_ALREADY_SENT, GOT_ASSET}

    StateSender public currentStateSender;
    StateBuyer public currentStateBuyer;

    address public escrowAgent;
    address payable public sender;
    address payable public buyer;
    uint256 public amount;

    constructor(address payable _sender, address payable _buyer) public {
        sender = _sender;
        buyer = _buyer;
    }

    function balanceOf() external view returns (uint256) {
        return address(this).balance;
    }

    function sendAsset(uint256 _amount) external {
        require(msg.sender == sender, "caller is not the sender");
        require(currentStateSender == StateSender.HAVE_NOT_SEND_ASSET);
        
        amount = _amount;
        currentStateSender = StateSender.ASSET_ALREADY_SENT;
    }

    function withdrawAsset() external {
        require(msg.sender == sender, "caller is not the sender");
        require(currentStateSender == StateSender.ASSET_ALREADY_SENT);

        amount = 0;
        currentStateSender = StateSender.HAVE_NOT_SEND_ASSET;
    }

    function deposit() external payable {
        require(msg.sender == buyer, "caller is not buyer");
        require(currentStateSender == StateSender.ASSET_ALREADY_SENT);
        require(currentStateBuyer == StateBuyer.HAVE_NOT_SEND_PAYMENT);
        require(msg.value == amount, "not enough funds to buy to the asset");

        currentStateBuyer = StateBuyer.PAYMENT_ALREADY_SENT;

        // if we want to allow the buyer to make multiple deposites till  it reaches amount (also change the enum require statement)
        // require(address(this).balnce <= amount, "already deposited funds to buy the asset");
    }

    function withdrawDeposite() external {
        require(msg.sender == buyer, "caller is not buyer");
        require(currentStateBuyer == StateBuyer.PAYMENT_ALREADY_SENT);

        buyer.transfer(amount);
        currentStateBuyer = StateBuyer.HAVE_NOT_SEND_PAYMENT;
    }

    function transferAsset() external {
        require(msg.sender == buyer, "caller is not buyer");
        require (currentStateSender == StateSender.ASSET_ALREADY_SENT);
        require(currentStateBuyer == StateBuyer.PAYMENT_ALREADY_SENT);
        
        sender.transfer(amount);
        currentStateBuyer = StateBuyer.GOT_ASSET;
        currentStateSender = StateSender.GOT_PAYMENT;
    }
}
