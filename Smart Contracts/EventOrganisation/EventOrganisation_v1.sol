// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

/*
    admin will create the contracte
    event organiser will create event and give some incentiive to the admin
    event: event id, name,  data, no of ticktets, type of tickets price
    customer can buy tickets

    sell their tickets (in version 2)
    later u can add logic for handelling ticket ids (in version 3)
*/

contract EventOrganisation {
    address public admin;
    address[] private eventAddress;

    function createEvent(
        string calldata _name,
        string[] calldata _ticketTypes,
        uint256[] calldata _totalTickets,
        uint256[] calldata _ticketPrice,
        uint _date
    ) external payable {
        uint _eventCreationPrice = _calEventCreatiionPrice(_ticketTypes, _totalTickets, _ticketPrice);
        require(msg.value ==  _eventCreationPrice, "You are not paying correct event creation price!!");

        EventContract newEvent = new EventContract(eventAddress.length + 1, _name, _ticketTypes, _totalTickets, _ticketPrice, block.timestamp + _date, msg.sender);
        eventAddress.push(address(newEvent));
    }

    function _calEventCreatiionPrice(
        string[] calldata _ticketTypes,
        uint256[] calldata _totalTickets,
        uint256[] calldata _ticketPrice
    ) public pure returns(uint) {    
        require(
            _ticketTypes.length == _totalTickets.length && _totalTickets.length == _ticketPrice.length,
             "Length of ticket types, total tickets or ticket price dont match!!  "
        );

        uint _price;
        for(uint i = 0; i < _ticketTypes.length; i++) {
            _price += _totalTickets[i] * _ticketPrice[i];
        }

        return ( _price / 100 ) * 5; // 5% of ticket price
    }

    function allEventAddress() external view returns(address[] memory) {
        return eventAddress;
    }
}

contract EventContract {
    address public organiser;

    struct Ticket {
        uint totalTicket;
        uint ticketSold;
        uint ticketPrice;
    }
    struct Event {
        uint eventId;
        string eventName;
        string[] ticketTypes;
        mapping(string => bool) ticketTypeExist;
        mapping(string => Ticket) ticketDetails;
        uint eventDate;
    }
    mapping(uint => Event) public eventDetails;

    mapping(address => mapping(uint => mapping(string => uint))) public customerDetails;

    constructor(
        uint _eventId,
        string memory _name,
        string[] memory _ticketTypes,
        uint256[] memory _totalTickets,
        uint256[] memory _ticketPrice,
        uint _eventDate,
        address _organiser
    ) {
        organiser = _organiser;
        eventDetails[_eventId].eventId = _eventId;
        eventDetails[_eventId].eventName = _name;
        eventDetails[_eventId].ticketTypes = _ticketTypes;

        for(uint i = 0; i < _ticketTypes.length; i++) {
            eventDetails[_eventId].ticketDetails[_ticketTypes[i]] = Ticket(_totalTickets[i], 0, _ticketPrice[i]);
            eventDetails[_eventId].ticketTypeExist[_ticketTypes[i]] = true;
        }
        eventDetails[_eventId].eventDate = _eventDate;
    }

    function ticketDetail(uint _eventId) external view eventExist(_eventId) returns(string memory, string[] memory, uint[] memory, uint[] memory) {
        Event storage _event = eventDetails[_eventId];
        uint[] memory _ticketsLeft = new uint[](_event.ticketTypes.length);
        uint[] memory _ticketsPrice = new uint[](_event.ticketTypes.length);
        
        
        for(uint i = 0; i< _event.ticketTypes.length; i++) {
            _ticketsLeft[i] = _event.ticketDetails[_event.ticketTypes[i]].totalTicket - _event.ticketDetails[_event.ticketTypes[i]].ticketSold;
            _ticketsPrice[i] = _event.ticketDetails[_event.ticketTypes[i]].ticketPrice;
        } 
        
        return (_event.eventName, _event.ticketTypes, _ticketsPrice, _ticketsLeft);
    }

    function buyTickets(uint _eventId, string calldata _ticketType, uint _ticketsNo) external payable eventExist(_eventId) ticketTypeExist(_eventId, _ticketType){
        Event storage _event = eventDetails[_eventId];
        require(block.timestamp <= _event.eventDate, "Event has already started!!");
        require(
            _event.ticketDetails[_ticketType].totalTicket - _event.ticketDetails[_ticketType].ticketSold >= _ticketsNo,
            "All tickets have already been sold, contact 3rd paty to buy tickets!!"
        );
        require(msg.value == _ticketsNo * _event.ticketDetails[_ticketType].ticketPrice, "Insuffecient amout send to buy the ticket, recheck the price!!");

        _event.ticketDetails[_ticketType].ticketSold += _ticketsNo;
        customerDetails[msg.sender][_eventId][_ticketType] = _ticketsNo;
    }

    modifier eventExist(uint _eventId) {
        require(eventDetails[_eventId].eventId != 0, "Event with this id does not exist!!");
        _;
    }

    modifier ticketTypeExist(uint _eventId, string memory _ticketType) {
        require(eventDetails[_eventId].ticketTypeExist[_ticketType] == true, "Tictet type does not exist!!");
        _;
    }
}
