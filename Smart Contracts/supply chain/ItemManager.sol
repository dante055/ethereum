pragma solidity ^0.6.0;

import "./Ownable.sol";
import "./Item.sol";


// Only For manger
contract ItemManager is Ownable {
    enum SupplyChainSteps {Created, Paid, Delivered}

    struct S_Item {
        Item item;
        ItemManager.SupplyChainSteps step;
        string identifier;
        uint256 itemPriceInWei;
    }

    mapping(uint256 => S_Item) public items;
    uint256 itemIndex;

    event SupplyChainStep(uint256 _itemIndex, uint256 _step, address _address);

    function createItem(string memory _identifier, uint256 _itemPriceInWei)
        public
        onlyOwner
    {
        Item _item = new Item(this, _itemPriceInWei, itemIndex);

        items[itemIndex].item = _item;
        items[itemIndex].identifier = _identifier;
        items[itemIndex].itemPriceInWei = _itemPriceInWei;
        items[itemIndex].step = SupplyChainSteps.Created;

        emit SupplyChainStep(
            itemIndex,
            uint256(items[itemIndex].step),
            address(_item)
        );
        itemIndex++;
    }

    function triggerPayment(uint256 _itemIndex) public payable {
        Item _item = items[_itemIndex].item;

        require(
            address(_item) == msg.sender,
            "Only items are allowed to update themselves"
        );
        require(
            items[_itemIndex].itemPriceInWei == msg.value,
            "Not fully Paid"
        );
        require(
            items[_itemIndex].step == SupplyChainSteps.Created,
            "Item is futher ahead in Suppy chain"
        );

        items[_itemIndex].step = SupplyChainSteps.Paid;
        emit SupplyChainStep(
            _itemIndex,
            uint256(items[itemIndex].step),
            address(_item)
        );
    }

    function triggerDelivery(uint256 _itemIndex) public onlyOwner {
        require(
            items[_itemIndex].step == SupplyChainSteps.Paid,
            "Item is futher ahead in Suppy chain"
        );

        items[_itemIndex].step = SupplyChainSteps.Delivered;
        emit SupplyChainStep(
            _itemIndex,
            uint256(items[itemIndex].step),
            address(items[_itemIndex].item)
        );
    }
}
