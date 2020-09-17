// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

contract AdvanceStorage {
    uint256[] private ids;

    function addId(uint256 _id) external {
        ids.push(_id);
    }

    function getId(uint256 _index) external view returns (uint256) {
        return ids[_index];
    }

    function getAllIds() external view returns (uint256[] memory) {
        return ids;
    }

    function getLength() external view returns (uint256) {
        return ids.length;
    }
}
