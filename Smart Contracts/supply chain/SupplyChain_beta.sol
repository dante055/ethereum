 pragma solidity ^0.6.0;

contract Ownable {
    address public _owner;
    
    constructor () internal {
        _owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(isOwner(), "Ownable: caller is not the owner");
        _;
    }
    
    function isOwner() public view returns (bool) {
        return (msg.sender == _owner);
    }
}

// Item have one index or our mapping reflected in wich we can pay
// For custormer payment
contract Item {
    uint public itemPriceInWei;
    uint public paidWei;
    uint public itemIndex;
    
    ItemManager_Beta parentContract;
    
    constructor(ItemManager_Beta _parentContract, uint _itemPriceInWei, uint _itemIndex) public {
        itemPriceInWei = _itemPriceInWei;
        itemIndex = _itemIndex;
        parentContract = _parentContract;
    }
    
    receive() external payable {
        require(itemPriceInWei == msg.value, "We dont support partial payment");
        require(paidWei == 0, "Item is already paid!");
        
        paidWei += msg.value;
        
        // low level call because we need more gas;
        (bool success, ) = address(parentContract).call.value(msg.value)(abi.encodeWithSignature("triggerPayment(uint256)", itemIndex));
        require(success, "Delivery did not work");
    }
    
    fallback () external {
        
    }
}

// Only For manger
contract ItemManager_Beta is Ownable {
    
    enum SupplyChainSteps{Created, Paid, Delivered}
    
    struct S_Item {
        Item item;
        ItemManager_Beta.SupplyChainSteps step;
        string identifier;
        uint itemPriceInWei;
    }
    
    mapping(uint => S_Item) public items;
    uint itemIndex;
    
    event SupplyChainStep(uint _itemIndex, uint _step, address _address);
    
    function createItem(string memory _identifier, uint _itemPriceInWei) public onlyOwner{
        Item _item = new Item(this, _itemPriceInWei, itemIndex);
        
        items[itemIndex].item = _item;
        items[itemIndex].identifier = _identifier;
        items[itemIndex].itemPriceInWei = _itemPriceInWei;
        items[itemIndex].step = SupplyChainSteps.Created;
        
        emit SupplyChainStep(itemIndex, uint(items[itemIndex].step), address(_item));
        itemIndex++;
    }
    
    function triggerPayment(uint _itemIndex) public payable {
        Item _item = items[_itemIndex].item;
        
        require(address(_item) == msg.sender, "Only items are allowed to update themselves");
        require(items[_itemIndex].itemPriceInWei == msg.value, "Not fully Paid");
        require(items[_itemIndex].step == SupplyChainSteps.Created, "Item is futher ahead in Suppy chain");
        
        items[_itemIndex].step = SupplyChainSteps.Paid;
        emit SupplyChainStep(_itemIndex, uint(items[itemIndex].step), address(_item));
    }
    
    function triggerDelivery(uint _itemIndex) public onlyOwner {
        require(items[_itemIndex].step == SupplyChainSteps.Paid, "Item is futher ahead in Suppy chain");
        
        items[_itemIndex].step = SupplyChainSteps.Delivered;
        emit SupplyChainStep(_itemIndex, uint(items[itemIndex].step), address(items[_itemIndex].item));
    }
}
