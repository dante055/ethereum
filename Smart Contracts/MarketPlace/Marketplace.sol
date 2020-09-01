// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

contract MarketPlace {
    // buyer can sell products
    // sell can buy the product

    struct Product {
        uint id;
        bytes name;
        uint price;
        bool baught;
        address seller;
        address buyer;
        address owner;
    }
    mapping(uint => Product) public products;
    uint public productId;

    function sell(string memory _name, uint _price) external {
        require(_price > 0, "Price should be greater than zero!");
        require (bytes(_name).length > 0 , "Product name length should be greater the 0");

        Product memory _product = Product(productId, bytes(_name), _price, false, msg.sender, address(0), msg.sender);
        products[productId] = _product;
        productId++;
    }

    function buy(uint _productId) external payable {
        Product memory _product = products[_productId];

        require(_product.baught == false, "Product has already baught!");
        require(msg.value == _product.price, "Amount sent to buy does not match with product price!");

        address seller = _product.seller;

        _product.buyer = msg.sender;
        _product.baught = true;
        _product.owner = msg.sender;

        products[_productId] = _product;

        payable(seller).transfer(msg.value);
    }
}
