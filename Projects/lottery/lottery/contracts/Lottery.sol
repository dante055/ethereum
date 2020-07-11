pragma solidity ^0.4.17;

contract Lottery {
    address public manager;
    address[] public players;

    function Lottery() public {
        manager = msg.sender;
    }

    function enter() public payable {
        require(msg.value > .01 ether ); // use for validation returns true or false

        players.push(msg.sender);
    }

    function getPlayers() public view returns (address[]) {
        return players;
    }

    function random() private view returns (uint) {
        return uint(keccak256(block.difficulty, now, players));
        // keccak256 is a class of algos and sha3() is a particula instance of it
        // uint() converts hexadecimal hash to unsigned int
    }

    function pickWinner() public restricted {

        uint index = random() % players.length;
        players[index].transfer(this.balance);
        /* lastWinner = players[index]; // to see who won */
        players =  new address[](0); // create new dyamic array of initial size 0
    }

    modifier restricted() {
      require(msg.sender == manager); // omly manager can run pickWinner
       _;
   }
}
