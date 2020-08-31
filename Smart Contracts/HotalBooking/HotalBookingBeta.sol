// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

contract HotalBoking{
    
    // owner sets the inial no and types of rooms with prices, and  tell id ther are vacent or occupied
    // owner can add and remove those rooms
    // customer can check avaibilty
    // customer can book the rooms by sending transaction to owner address and will receice a digital key
    // key will we active only till the specific time
    
    // mapping(roomNo => rooms)
    // mapping (address => bookingRecieps)
    // bookingRecieps {roomNo ; timelimit; key:m custormer} // only for owner and the specific custormer
    // rooms {roomNo ; type; status[vacent, occupice], price }
    // key { isActive: ; roomNo: ; activationEndTime: ; }

    // you can use events and then u can subscribe to them in the front end 
    
    enum Status {AVAILABLE, BOOKED}
    address public owner;
    
    struct RoomDetails {
        uint roomPrice;
        uint totalRooms;
        uint available;
    }
    mapping(string => RoomDetails) roomType;
    string[] roomTypes;
    
    struct BookingReciept {
        bool active;
        uint noOfRooms;
        uint time;
    }
    // mapping(address => mapping(string => BookingReciept)) BookingReciepts;
    mapping(address => mapping(string => BookingReciept)) BookingReciepts;
    
    address[] customers;
    
    constructor(
        // uint _totalRooms, 
        string[] memory _roomTypes, 
        uint[] memory _roomPrices, 
        uint[] memory _totalRooms,
        uint[] memory _available) 
        {
            require(
                _roomTypes.length == _roomPrices.length && 
                _roomTypes.length == _roomTypes.length &&
                _roomTypes.length == _available.length,
                "length of the arrays dont match"
            );
            
            owner = msg.sender;
            
            for(uint i = 0; i < _roomTypes.length; i++) {
                roomType[_roomTypes[i]].roomPrice = _roomPrices[i];
                roomType[_roomTypes[i]].totalRooms = _totalRooms[i];
                roomType[_roomTypes[i]].available = _available[i];
            }
            roomTypes = _roomTypes;
    }
    
    function addRoomType(string memory _roomType, uint _roomPrice, uint _totalRooms, uint _available) external onlyOwner(){
        roomType[_roomType].roomPrice = _roomPrice;
        roomType[_roomType].totalRooms = _totalRooms;
        roomType[_roomType].available = _available;
        roomTypes.push(_roomType);
    }
    
    function updateRoom(string memory _roomType, uint _roomPrice, uint _totalRooms, uint _available) external onlyOwner(){
        roomType[_roomType].roomPrice = _roomPrice;
        roomType[_roomType].totalRooms = _totalRooms;
        roomType[_roomType].available = _available;
    }
    
    // daily run this function once or for pricious run before each booking
    // their may be better way to do this
    
    // or do it roon no wise
    // keep track of booked room no of each types and then update them when the time ends
    // also wpdate the bookRoomNo array
    function _updateAvailabe() external onlyOwner() {
        for(uint i = 0; i < customers.length; i++) {
            for(uint j = 0 ; j < roomTypes.length; i++) {
                if(
                    BookingReciepts[customers[i]][roomTypes[j]].active && 
                    BookingReciepts[customers[i]][roomTypes[j]].time < block.timestamp
                    ) {
                        BookingReciepts[customers[i]][roomTypes[j]].active = false;
                        roomType[roomTypes[i]].available += BookingReciepts[customers[i]][roomTypes[j]].noOfRooms;
                }    
            }
        }
    }
    
    function bookRoom(string memory _roomType, uint _noOfRoomsToBook, uint _time) external payable{
        require(roomType[_roomType].available >= _noOfRoomsToBook, "rooms are not available");
        require(roomType[_roomType].roomPrice * _noOfRoomsToBook == msg.value, "insufficient amount to book rooms");
        
        customers.push(msg.sender);
        BookingReciepts[msg.sender][_roomType].noOfRooms = _noOfRoomsToBook;
        BookingReciepts[msg.sender][_roomType].time = block.timestamp + _time;
        BookingReciepts[msg.sender][_roomType].active = true;
        _updateAvailabe(_roomType, _noOfRoomsToBook);
        
    }
    
    function _updateAvailabe(string memory _roomType, uint _booked) internal {
        roomType[_roomType].available = roomType[_roomType].available - _booked;
    }
    
    function balanceOf() external view onlyOwner() returns(uint){
        return address(this).balance;
    }
    
    function withDraw(uint _amount) external onlyOwner() {
        require(address(this).balance >= _amount, "insufficient balance");
        payable(owner).transfer(_amount);
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner!!");
        _;        
    }
    
}
