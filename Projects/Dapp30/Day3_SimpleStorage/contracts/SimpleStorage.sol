// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

contract SimpleStorage {
    string private data;

    function setData(string calldata _data) external {
        data = _data;
    }

    function getData() external view returns (string memory) {
        return data;
    }
}
