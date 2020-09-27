// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

contract Crud {
    struct User {
        uint256 id;
        string name;
    }

    User[] private users;
    uint256 private nextId = 1;

    function create(string calldata _name) external {
        users.push(User(nextId, _name));
        nextId++;
    }

    function read(uint256 _id) external view returns (User memory) {
        uint256 index = find(_id);
        return users[index];
    }

    // function read(uint256 _id) external view returns (uint256, string memory) {
    //     uint256 index = find(_id);
    //     return (users[index].id, users[index].name);
    // }

    function getAllUsers() external view returns (User[] memory) {
        return users;
    }

    function update(uint256 _id, string calldata _name) external {
        uint256 index = find(_id);
        users[index].name = _name;
    }

    function destroy(uint256 _id) external {
        uint256 index = find(_id);
        delete users[index];
    }

    function find(uint256 _id) internal view returns (uint256) {
        for (uint256 i = 0; i < users.length; i++) {
            if (users[i].id == _id) return i;
        }
        revert("User does not exist");
    }
}
