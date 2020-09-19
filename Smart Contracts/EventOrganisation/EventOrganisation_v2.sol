// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

/*
    admin will create the contracte
    event organiser will create event and give some incentiive to the admin
    event: event id, name,  data, no of ticktets, type of tickets price
    customer can buy and sell their tickets

    later u can add logic for handelling ticket ids 
 */

contract EventOrganisation {
  address public admin;
  address[] private eventAddress;

  function createEvent(
    string calldata _name,
    string[] calldata _ticketTypes,
    uint256[] calldata _totalTickets,
    uint256[] calldata _ticketPrice,
    uint256 _date
  ) external payable {
    require(
      _date > block.timestamp,
      'Event can only be organise in the future!!'
    );

    uint256 _ticketCount;
    for (uint256 i = 0; i < _totalTickets.length; i++) {
      _ticketCount += _totalTickets[0];
    }
    require(_ticketCount > 0, 'Can only create event with one ticket!!');

    uint256 _eventCreationPrice = _calEventCreatiionPrice(
      _ticketTypes,
      _totalTickets,
      _ticketPrice
    );
    require(
      msg.value == _eventCreationPrice,
      'You are not paying correct event creation price!!'
    );

    EventContract newEvent = new EventContract(
      eventAddress.length + 1,
      _name,
      _ticketTypes,
      _totalTickets,
      _ticketPrice,
      _date,
      msg.sender
    );
    eventAddress.push(address(newEvent));
  }

  function _calEventCreatiionPrice(
    string[] calldata _ticketTypes,
    uint256[] calldata _totalTickets,
    uint256[] calldata _ticketPrice
  ) public pure returns (uint256) {
    require(
      _ticketTypes.length == _totalTickets.length &&
        _totalTickets.length == _ticketPrice.length,
      'Length of ticket types, total tickets or ticket price dont match!!  '
    );

    uint256 _price;
    for (uint256 i = 0; i < _ticketTypes.length; i++) {
      _price += _totalTickets[i] * _ticketPrice[i];
    }

    return (_price / 100) * 5; // 5% of ticket price
  }

  function allEventAddress() external view returns (address[] memory) {
    return eventAddress;
  }
}

contract EventContract {
  address public organiser;

  struct Ticket {
    uint256 totalTicket;
    uint256 ticketSold;
    uint256 ticketPrice;
  }
  struct Event {
    uint256 eventId;
    string eventName;
    string[] ticketTypes;
    mapping(string => bool) ticketTypeExist;
    mapping(string => Ticket) ticketDetails;
    uint256 eventDate;
  }
  mapping(uint256 => Event) public eventDetails;

  mapping(address => mapping(uint256 => mapping(string => uint256)))
    public customerDetails;

  struct TicketSell {
    address sellerAddress;
    uint256 ticketCount;
    uint256 ticketPrice;
  }
  struct Seller {
    address[] seller;
    mapping(address => TicketSell) ticketSell;
  }
  mapping(uint256 => mapping(string => Seller)) seller;

  constructor(
    uint256 _eventId,
    string memory _name,
    string[] memory _ticketTypes,
    uint256[] memory _totalTickets,
    uint256[] memory _ticketPrice,
    uint256 _eventDate,
    address _organiser
  ) {
    organiser = _organiser;
    eventDetails[_eventId].eventId = _eventId;
    eventDetails[_eventId].eventName = _name;
    eventDetails[_eventId].ticketTypes = _ticketTypes;

    for (uint256 i = 0; i < _ticketTypes.length; i++) {
      eventDetails[_eventId].ticketDetails[_ticketTypes[i]] = Ticket(
        _totalTickets[i],
        0,
        _ticketPrice[i]
      );
      eventDetails[_eventId].ticketTypeExist[_ticketTypes[i]] = true;
    }
    eventDetails[_eventId].eventDate = _eventDate;
  }

  function ticketDetail(uint256 _eventId)
    external
    view
    eventExist(_eventId)
    returns (
      string memory,
      string[] memory,
      uint256[] memory,
      uint256[] memory
    )
  {
    Event storage _event = eventDetails[_eventId];
    uint256[] memory _ticketsLeft = new uint256[](_event.ticketTypes.length);
    uint256[] memory _ticketsPrice = new uint256[](_event.ticketTypes.length);

    for (uint256 i = 0; i < _event.ticketTypes.length; i++) {
      _ticketsLeft[i] =
        _event.ticketDetails[_event.ticketTypes[i]].totalTicket -
        _event.ticketDetails[_event.ticketTypes[i]].ticketSold;
      _ticketsPrice[i] = _event.ticketDetails[_event.ticketTypes[i]]
        .ticketPrice;
    }

    return (_event.eventName, _event.ticketTypes, _ticketsPrice, _ticketsLeft);
  }

  function buyTickets(
    uint256 _eventId,
    string calldata _ticketType,
    uint256 _ticketCount
  )
    external
    payable
    eventExist(_eventId)
    ticketTypeExist(_eventId, _ticketType)
    eventActive(_eventId)
  {
    require(_ticketCount > 0, 'Must buy atleat one ticket!!');

    Event storage _event = eventDetails[_eventId];
    require(
      _event.ticketDetails[_ticketType].totalTicket -
        _event.ticketDetails[_ticketType].ticketSold >=
        _ticketCount,
      'All tickets have already been sold, contact 3rd paty to buy tickets!!'
    );
    require(
      msg.value == _ticketCount * _event.ticketDetails[_ticketType].ticketPrice,
      'Insuffecient amout send to buy the ticket, recheck the price!!'
    );

    _event.ticketDetails[_ticketType].ticketSold += _ticketCount;
    customerDetails[msg.sender][_eventId][_ticketType] = _ticketCount;
  }

  function sellTickets(
    uint256 _eventId,
    string calldata _ticketType,
    uint256 _ticketCount,
    uint256 _ticketPrice
  )
    external
    eventExist(_eventId)
    ticketTypeExist(_eventId, _ticketType)
    eventActive(_eventId)
  {
    require(_ticketCount > 0, 'Must sell atleat one ticket!!');
    require(
      customerDetails[msg.sender][_eventId][_ticketType] >= _ticketCount,
      'You dont have any tickets to sell!!'
    );
    Seller storage _sellerStruct = seller[_eventId][_ticketType];
    // address[] memory  _sellers = seller[_eventId][_ticketType].seller;

    if (seller[_eventId][_ticketType].ticketSell[msg.sender].ticketCount == 0) {
      seller[_eventId][_ticketType].seller.push(msg.sender);
    }
    _sellerStruct.ticketSell[msg.sender].sellerAddress = msg.sender;
    _sellerStruct.ticketSell[msg.sender].ticketCount += _ticketCount;
    _sellerStruct.ticketSell[msg.sender].ticketPrice = _ticketPrice; // pricess of previous ticket will also change
    customerDetails[msg.sender][_eventId][_ticketType] -= _ticketCount;

    if (_sellerStruct.ticketSell[msg.sender].ticketCount == 0) {
      _sellerStruct.seller.push(msg.sender);
    }

    /*    
        // condition the previos array is already sorted so just put the last order in correct position

        if(seller[_eventId][_ticketType].ticketSell[msg.sender].ticketCount == 0 ) {
             _sellerStrct.seller.push(msg.sender);
            
            uint256 i = _sellers.length > 0 ? _sellers.length - 1 : 0;
            while (i > 0) {
                if (_sellerStrct.ticketSell[_sellers[i-1]].ticketPrice <= _sellerStrct.ticketSell[_sellers[i]].ticketPrice) {
                    break;
                }
                // swap
                address prevSeller = _sellers[i-1];
                _sellers[i - 1] = _sellers[i];
                _sellers[i] = prevSeller;
                i--;
            }
            _sellerStrct.seller = _sellers;
        } else {
            //get to tahat inges and the sort it to correct posiion
        }
    */
  }

  function reClaimTickets(
    uint256 _eventId,
    string calldata _ticketType,
    uint256 _ticketCount
  )
    external
    eventExist(_eventId)
    ticketTypeExist(_eventId, _ticketType)
    eventActive(_eventId)
  {
    require(_ticketCount > 0, 'Must reclaim atleat one ticket!!');
    require(
      seller[_eventId][_ticketType].ticketSell[msg.sender].ticketCount >
        _ticketCount,
      'You dont have this amount of tickets to reclaim!!'
    );
    seller[_eventId][_ticketType].ticketSell[msg.sender]
      .ticketCount -= _ticketCount;
    customerDetails[msg.sender][_eventId][_ticketType] += _ticketCount;
  }

  function seeSellersDetails(uint256 _eventId, string calldata _ticketType)
    external
    view
    eventExist(_eventId)
    ticketTypeExist(_eventId, _ticketType)
    eventActive(_eventId)
    returns (TicketSell[] memory)
  {
    Seller storage _sellerStrct = seller[_eventId][_ticketType];
    TicketSell[] memory ticketDetails = new TicketSell[](
      _sellerStrct.seller.length
    );

    for (uint256 i = 0; i < _sellerStrct.seller.length; i++) {
      ticketDetails[i] = TicketSell(
        _sellerStrct.seller[i],
        _sellerStrct.ticketSell[_sellerStrct.seller[i]].ticketCount,
        _sellerStrct.ticketSell[_sellerStrct.seller[i]].ticketPrice
      );
    }

    return (ticketDetails);
  }

  // you can do the orderbook logic here like loot theru seeler and prument them till the _ticket count does not become 0 and also create a walletlike functionality
  // but lets keep it simple and do check from the first sellers if he has not sufficient tickets then we will tell him to rechek the availibity and call the function again

  // for keeping it more simple we will also give the seller address as a parameter
  function buyTicketFrom3rdParty(
    uint256 _eventId,
    string calldata _ticketType,
    uint256 _ticketCount,
    address _seller
  )
    external
    payable
    eventExist(_eventId)
    ticketTypeExist(_eventId, _ticketType)
    eventActive(_eventId)
  {
    TicketSell storage ticketStrct = seller[_eventId][_ticketType]
      .ticketSell[_seller];

    require(_ticketCount > 0, 'Must buy atleat one ticket!!');
    require(
      ticketStrct.ticketCount >= _ticketCount,
      'Seller does not have the sufficient tikets to sell!!'
    );

    uint256 _ticketPrice = _ticketCount * ticketStrct.ticketPrice;
    require(
      msg.value == _ticketPrice,
      'You are sending insufficient eth to buy the tickets'
    );

    seller[_eventId][_ticketType].ticketSell[_seller]
      .ticketCount -= _ticketCount;
    customerDetails[msg.sender][_eventId][_ticketType] += _ticketCount;

    payable(_seller).transfer(_ticketPrice);
  }

  modifier eventExist(uint256 _eventId) {
    require(
      eventDetails[_eventId].eventId != 0,
      'Event with this id does not exist!!'
    );
    _;
  }

  modifier ticketTypeExist(uint256 _eventId, string memory _ticketType) {
    require(
      eventDetails[_eventId].ticketTypeExist[_ticketType] == true,
      'Tictet type does not exist!!'
    );
    _;
  }

  modifier eventActive(uint256 _eventId) {
    require(
      block.timestamp < eventDetails[_eventId].eventDate,
      'Event has already started!!'
    );
    _;
  }
}

/* 
["a", "b", "c"], [10, 20, 30], [100, 200, 300]
"testEvent1", ["a", "b", "c"], [10, 20, 30], [100, 200, 300], 120
 */
 
