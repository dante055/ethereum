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
    
    // you can use events and then u can subscribe to htem in the front end 
    
    // havent taken into account what will happen id a cutomer booked fome same address, same type of room twice when the first booking isnt over
    // in this case the code wull run roperly but the poblem will arise  BookingReciepts mapping
    // solution: create a maping like - 
    // uint recieptNo;
    // byte32 recieptId = keccak256(roomType,recieptNo)
    // mapping(address=>mapping(bytes32=>BookingReciept)) BookingReciepts  

    enum Status {AVAILABLE, BOOKED}
    address public owner;
    
    struct RoomDetails {
        uint roomPrice;
        uint totalRooms;
        uint available;
        uint booked;
        bytes32[] bookedRoomNumbers;
    }
    mapping(string => RoomDetails) public roomType;
    string[] public roomTypes;
    
    struct BookingReciept {
        uint noOfRooms;
        uint time;
    }
    mapping(address => mapping(string => BookingReciept)) public BookingReciepts;
    
    struct RoomStatus {
        Status currentStatu;
        uint bookingEndTime;
    }
    mapping(bytes32 => RoomStatus) public room;
    // mapping(bytes32 => Status) RoomStatus;
    
    function getRoomTypes() external view returns(string[] memory){
        return roomTypes;
    }
    
    function getBookedRoomNo(string memory _roomType) external view returns(bytes32[] memory){
        return roomType[_roomType].bookedRoomNumbers;
    }
    
    // initially all roomsare available
    constructor(
        string[] memory _roomTypes, 
        uint[] memory _roomPrices, 
        uint[] memory _totalRooms) 
        {
            require(
                _roomTypes.length == _roomPrices.length && 
                _roomTypes.length == _roomTypes.length,
                "length of the arrays dont match"
            );
            
            owner = msg.sender;
            roomTypes = _roomTypes;
            
            for(uint i = 0; i < _roomTypes.length; i++) {
                roomType[_roomTypes[i]].roomPrice = _roomPrices[i];
                roomType[_roomTypes[i]].totalRooms = _totalRooms[i];
                roomType[_roomTypes[i]].available = _totalRooms[i];
            }
            
    }
    
    function addRoomType(string memory _roomType, uint _roomPrice, uint _totalRooms) external onlyOwner(){
        roomType[_roomType].roomPrice = _roomPrice;
        roomType[_roomType].totalRooms = _totalRooms;
        roomType[_roomType].available = _totalRooms;
        roomTypes.push(_roomType);
    }
    
    function updateRoom(string memory _roomType, uint _roomPrice, uint _totalRooms) external onlyOwner(){
        roomType[_roomType].roomPrice = _roomPrice;
        roomType[_roomType].totalRooms = _totalRooms;
        roomType[_roomType].available = _totalRooms - roomType[_roomType].booked;
    }
    
    // either owner can call this function daily or run this function at the time of booking room
    function freeRoomTypes(string memory _roomType) external onlyOwner() {
        bytes32[] storage _bookedRoomNo = roomType[_roomType].bookedRoomNumbers;
        uint _bookedLength = _bookedRoomNo.length;
        
        bytes32[] memory newBookedRooms = new bytes32[](_bookedLength);
        bytes32 _roomNo;
        uint tookCount;
        
        for(uint i = 0; i < _bookedLength; i++) {
            _roomNo = _bookedRoomNo[i];
            if(room[_roomNo].currentStatu == Status.BOOKED) {
                if(room[_roomNo].bookingEndTime <= block.timestamp) {
                    room[_roomNo].currentStatu = Status.AVAILABLE;
                    
                    // move last elemet to this place and then delete the last elemet
                    // // old way :  _bookedRoomNo[i] = _bookedRoomNo[_bookedLength - 1];
                    // _bookedRoomNo.pop();
                    // i--;
                } else {
                    newBookedRooms[tookCount] = _roomNo;
                    tookCount++;
                }
            }
        }
        // roomType[_roomType].booked = _bookedRoomNo.length;
        // roomType[_roomType].available = roomType[_roomType].totalRooms - roomType[_roomType].booked;
        
        bytes32[] memory trimmedResult = new bytes32[](tookCount);
        for (uint j = 0; j < trimmedResult.length; j++) {
            trimmedResult[j] = newBookedRooms[j];
        }
        
        if(trimmedResult.length != _bookedLength) {
            roomType[_roomType].booked = trimmedResult.length;
            roomType[_roomType].available = roomType[_roomType].totalRooms - roomType[_roomType].booked;
        
            roomType[_roomType].bookedRoomNumbers = trimmedResult;
             roomType[_roomType].length = roomType[_roomType].bookedRoomNumbers.length;
        }        
    }
    
    // there may be better way to do this
    function bookRoom(string memory _roomType, uint _noOfRoomsToBook, uint _time) external payable{
        require(roomType[_roomType].available >= _noOfRoomsToBook, "rooms are not available");
        require(roomType[_roomType].roomPrice * _noOfRoomsToBook == msg.value, "insufficient amount to book rooms");
        
        BookingReciepts[msg.sender][_roomType].noOfRooms = _noOfRoomsToBook;
        BookingReciepts[msg.sender][_roomType].time = block.timestamp + _time;
        
        for(uint i = roomType[_roomType].booked + 1 ; i <= roomType[_roomType].booked + _noOfRoomsToBook; i++) {
            bytes32 _roomNo = keccak256(abi.encode(_roomType, i));
            roomType[_roomType].bookedRoomNumbers.push(_roomNo);
            room[_roomNo].currentStatu = Status.BOOKED;
            room[_roomNo].bookingEndTime = block.timestamp + _time;
        }
        _updateAvailabe(_roomType, _noOfRoomsToBook);
    }
    
    function currentTime() external view returns(uint) {
        return block.timestamp;
    }
    
    function _updateAvailabe(string memory _roomType, uint _booked) internal {
        roomType[_roomType].booked += _booked; 
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
