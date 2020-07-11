// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;
pragma experimental ABIEncoderV2;

// import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol";
// import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/math/SafeMath.sol";

import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../node_modules/@openzeppelin/contracts/math/SafeMath.sol";

contract Dex {
    // to use a library
    using SafeMath for uint256;

    // limit order type
    // enum can be casted into integer, (0 = BUY, 1 = SELL )
    enum Side {BUY, SELL}

    // token detail struct
    struct Token {
        bytes32 ticker;
        address tokenAddress;
    }

    // struct to represent each limit order
    struct Order {
        uint256 id;
        address trader;
        bytes32 ticker;
        Side side;
        uint256 amount; // total amount of token
        uint256 filled; // how much amount is filled
        uint256 price; // price of one token
        uint256 date;
    }

    // token detail mapping
    mapping(bytes32 => Token) public tokens;

    // address to token token balance mapping
    mapping(address => mapping(bytes32 => uint256)) public traderBalances;

    // token list
    bytes32[] public tokenList;

    // order book mapping
    // enum as a mapping key is not implemented so cast enum into uint
    // ticker => (Side = Order array)
    // BUY lmit order array is sorted in decending order
    // SELL lmit order array is sorted in assecending order
    // same price the oldest order is rank first
    // Reason of sorting in this way :
    // market order of type buy will get the limit order of type sell which has least price (ascending order)
    // market order of type sell will sell the limit order of type buy which has highest price (decending order)
    mapping(bytes32 => mapping(uint256 => Order[])) public orderBook;

    // current order id
    uint256 public nextOrderId;

    // trade id
    uint256 public nextTradeId;

    // admin address
    address public admin;

    // Dai ticker constant
    // saves gas as it computed during compile time not run time
    bytes32 constant DAI = bytes32("DAI");

    event NewTrade(
        uint256 tradeId,
        uint256 orderId,
        bytes32 indexed ticker,
        address indexed trader1,
        address indexed trader2,
        uint256 amount,
        uint256 price,
        uint256 date
    );

    constructor() public {
        admin = msg.sender;
    }

    // list orders
    function getOrders(bytes32 _ticker, Side _side)
        external
        view
        returns (Order[] memory)
    {
        return orderBook[_ticker][uint256(_side)];
    }

    // list tokens
    function getTokens() external view returns (Token[] memory) {
        // new temporary Token struc array
        Token[] memory _tokens = new Token[](tokenList.length);
        for (uint256 i = 0; i < tokenList.length; i++) {
            _tokens[i] = Token(
                tokens[tokenList[i]].ticker,
                tokens[tokenList[i]].tokenAddress
            );
        }
        return _tokens;
    }

    // add token function
    function addToken(bytes32 _ticker, address _tokenAddress)
        external
        onlyAdmin()
    {
        tokens[_ticker] = Token(_ticker, _tokenAddress);
        tokenList.push(_ticker);
    }

    // deposit to wallet
    function deposit(bytes32 _ticker, uint256 _amount)
        external
        tokenExist(_ticker)
    {
        // IERC20 interface requires token address other wise it will casue error
        // approve during testing and in frontend
        address tokenAddress = tokens[_ticker].tokenAddress;
        require(
            IERC20(tokenAddress).balanceOf(msg.sender) >= _amount,
            "Not enough token to transfer"
        );
        IERC20(tokenAddress).transferFrom(msg.sender, address(this), _amount);
        traderBalances[msg.sender][_ticker] = traderBalances[msg
            .sender][_ticker]
            .add(_amount);
    }

    // withdraw from wallet
    function withdraw(bytes32 _ticker, uint256 _amount)
        external
        tokenExist(_ticker)
    {
        require(
            traderBalances[msg.sender][_ticker] >= _amount,
            "Not enough funds to withdraw"
        );
        traderBalances[msg.sender][_ticker] = traderBalances[msg
            .sender][_ticker]
            .sub(_amount);
        IERC20(tokens[_ticker].tokenAddress).transfer(msg.sender, _amount);
    }

    // create limit order
    // buy or sell at a specific max or min price
    function createLimitOrder(
        bytes32 _ticker,
        uint256 _amount,
        uint256 _price,
        Side _side
    ) external tokenExist(_ticker) tokenIsNotDai(_ticker) {
        if (_side == Side.SELL) {
            require(
                traderBalances[msg.sender][_ticker] >= _amount,
                "Not enough tokens to fufill the order"
            );
        } else {
            require(
                traderBalances[msg.sender][DAI] >= _amount * _price,
                "Not enough DAI tokens to buy the order"
            );
        }
        // get the order array of particular ticker
        Order[] storage orders = orderBook[_ticker][uint256(_side)];

        //push the new order in the array
        orders.push(
            Order(
                nextOrderId,
                msg.sender,
                _ticker,
                _side,
                _amount,
                0,
                _price,
                now
            )
        );

        // sort the array (bubble sort)
        // condition the previos array is already sorted so just put the last order in correct position
        uint256 i = orders.length > 0 ? orders.length - 1 : 0;
        while (i > 0) {
            if (_side == Side.BUY && orders[i - 1].price >= orders[i].price) {
                break;
            }
            if (_side == Side.SELL && orders[i - 1].price <= orders[i].price) {
                break;
            }

            // swap
            Order memory previousOder = orders[i - 1];
            orders[i - 1] = orders[i];
            orders[i] = previousOder;
            i--;
        }
        nextOrderId++;
    }

    // create market orders
    // buy or sell at any price
    // order mataching algo : match this market order with best limit sell order
    // Matches incoming market orders against existing limit orders
    function createMarketOrder(
        bytes32 _ticker,
        uint256 _amount,
        Side _side
    ) external tokenExist(_ticker) tokenIsNotDai(_ticker) {
        if (_side == Side.SELL) {
            require(
                traderBalances[msg.sender][_ticker] >= _amount,
                "Not enough tokens to fufill the order"
            );
        }

        // for else condition we dont have order price
        // so we will do it after we get the pice from lmit order

        // matching algo
        // id this is market buy order we need to have list of sell order
        Order[] storage orders = orderBook[_ticker][uint256(
            _side == Side.BUY ? Side.SELL : Side.BUY
        )];

        // variale to iterate
        uint256 i;

        // remaining portion of order to be filled
        uint256 remaining = _amount;

        // matching process
        //iterate till the end of order book or till when order is not fully matched
        while (i < orders.length && remaining > 0) {
            // know available liquidity for each of the order of the orderBook
            uint256 available = orders[i].amount - orders[i].filled;

            // amount that will be matched against our market order
            // remaining > available : the limit order will be mathched
            // remaining < available : then market order will be matched
            uint256 matched = (remaining > available) ? available : remaining;

            // decrement the remaining order
            remaining = remaining.sub(matched);

            // increment what has been matched
            orders[i].filled = orders[i].filled.add(matched);

            // emit NewTrade event
            // trader1 = trader who created lmit orders
            // trader2 = trader who create the matched orders
            // price = price of lmit order
            emit NewTrade(
                nextTradeId,
                orders[i].id,
                _ticker,
                orders[i].trader,
                msg.sender,
                matched,
                orders[i].price,
                now
            );

            // update token balance for two of the trader involved
            if (_side == Side.SELL) {
                // sender will always have something to sender

                traderBalances[msg.sender][_ticker] = traderBalances[msg
                    .sender][_ticker]
                    .sub(matched);
                traderBalances[msg.sender][DAI] = traderBalances[msg
                    .sender][DAI]
                    .add(matched.mul(orders[i].price));
                traderBalances[orders[i]
                    .trader][_ticker] = traderBalances[orders[i]
                    .trader][_ticker]
                    .add(matched);
                traderBalances[orders[i].trader][DAI] = traderBalances[orders[i]
                    .trader][DAI]
                    .sub(matched.mul(orders[i].price));
            }
            if (_side == Side.BUY) {
                // check if buyer have enought DAI to pay
                require(
                    traderBalances[msg.sender][DAI] >=
                        matched.mul(orders[i].price),
                    "Not enough DAI to buy tokens"
                );

                traderBalances[msg.sender][_ticker] = traderBalances[msg
                    .sender][_ticker]
                    .add(matched);
                traderBalances[msg.sender][DAI] = traderBalances[msg
                    .sender][DAI]
                    .sub(matched.mul(orders[i].price));
                traderBalances[orders[i]
                    .trader][_ticker] = traderBalances[orders[i]
                    .trader][_ticker]
                    .sub(matched);
                traderBalances[orders[i].trader][DAI] = traderBalances[orders[i]
                    .trader][DAI]
                    .add(matched.mul(orders[i].price));
            }
            nextTradeId++;
            i++;
        }

        // prune/remove the finished getOrders
        // way is to check the first orders as it is processed and filled first
        i = 0;
        // stop when current order is not filled, if filled then prune
        while (i < orders.length && orders[i].filled == orders[i].amount) {
            for (uint256 j = i; j < orders.length - 1; j++) {
                orders[j] = orders[j + 1];
            }
            orders.pop();
            i++;
        }
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can add tokens");
        _;
    }

    modifier tokenExist(bytes32 _ticker) {
        require(
            tokens[_ticker].tokenAddress != address(0),
            "Token does not exist"
        );
        _;
    }

    modifier tokenIsNotDai(bytes32 _ticker) {
        require(_ticker != DAI, "Cannot trade DAI");
        _;
    }
}
