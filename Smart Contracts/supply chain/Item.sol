pragma solidity ^0.6.0;

import "./ItemManager.sol";


// Item have one index or our mapping reflected in wich we can pay
// For custormer payment
contract Item {
    uint256 public itemPriceInWei;
    uint256 public paidWei;
    uint256 public itemIndex;

    ItemManager parentContract;

    constructor(
        ItemManager _parentContract,
        uint256 _itemPriceInWei,
        uint256 _itemIndex
    ) public {
        itemPriceInWei = _itemPriceInWei;
        itemIndex = _itemIndex;
        parentContract = _parentContract;
    }

    receive() external payable {
        require(itemPriceInWei == msg.value, "We dont support partial payment");
        require(paidWei == 0, "Item is already paid!");

        paidWei += msg.value;

        // low level call because we need more gas;
        (bool success, ) = address(parentContract).call.value(msg.value)(
            abi.encodeWithSignature("triggerPayment(uint256)", itemIndex)
        );
        require(success, "Delivery did not work");
    }

    fallback() external {}
}
