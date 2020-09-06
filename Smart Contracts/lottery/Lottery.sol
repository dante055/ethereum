pragma solidity ^0.4.17;

contract Lottery {
    address public manager;
    address[] public players;
    
    // constructor called imidiately after contract in made
    function Lottery() public {
        manager = msg.sender;
    }
    
    // to enter Lottery players has to sent in some amount of ether
    function enter() public payable {
        require(msg.value > .01 ether ); // use for validation returns true or false 
        // if false the function is exited
        // does not give proper error msg so use debbuger
        // ether converts it to wei
        
        players.push(msg.sender);
    }
    
    function getPlayers() public view returns (address[]) {
        return players;
    }
    
    function random() private view returns (uint) {
        return uint(keccak256(block.difficulty, now, players));  
        // keccak256 is a class of algos and sha3() is a particula instance of it
        // unit() converts hexadecimal hash to unsigned int
    } // only for education purpose not save function as int not pure random

    function pickWinner() public {
        require(msg.sender == manager); // omly manager can run pickWinner
        
        uint index = random() % players.length;
        players[index].transfer(this.balance); 
        // address : 0x12312312l312312
        // players[index] will return address, which is like a obj and have some properties tied to it
        // transfer() function takes som amount of money and give it to this address
        // transfer(1) : will send 1 wei
        // transfer(this.balance) : transfer all the money.
        // this : is the instance of our contract
        
        //new address[](2) : [0x00000, 0x00000] default address
        players =  new address[](0); // create new dyamic array of initial size 0
    }
}