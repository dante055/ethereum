// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

contract Crud {
    struct User {
        uint256 id;
        string name;
        bool active;
    }

    User[] private users;
    uint256 private nextId;

    function create(string calldata _name) external {
        users.push(User(nextId, _name, true));
        nextId++;
    }

    function read(uint256 _id)
        external
        view
        userExist(_id)
        returns (User memory)
    {
        uint256 index = find(_id);
        return users[index];
    }

    function getAllUsers() external view returns (User[] memory) {
        return users;
    }

    function update(uint256 _id, string calldata _name)
        external
        userExist(_id)
    {
        uint256 index = find(_id);
        users[index].name = _name;
    }

    function destroy(uint256 _id) external userExist(_id) {
        uint256 index = find(_id);
        delete users[index];
    }

    function find(uint256 _id) internal view returns (uint256) {
        for (uint256 i = 0; i < users.length; i++) {
            if (users[i].id == _id && users[i].active) return i;
        }
        // if you dont want to use modifier and next id starts from 1 and we dont need to use the 2nd revert
        // revert("User does not exist");

        // when id has been deleted then the default value will be present so modifier wornt work
        revert("User has been deleted so it does not exist");
        // require(false, "User has been deleted so it does not exist");
    }

    modifier userExist(uint256 _id) {
        require(
            users.length != 0 && (_id >= 0 && _id < users.length),
            "User does not exist"
        );
        _;
    }

}
