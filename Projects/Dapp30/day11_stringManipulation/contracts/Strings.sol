// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;

// using abi encoded has less execuation cost than the raw code in many cases
import "./StringsLibrary.sol";

contract Strings {
    using StringsLibrary for string;

    function getLength(string calldata _str) external pure returns (uint256) {
        return _str.length();
    }

    function reverse(string calldata _str)
        external
        pure
        returns (string memory)
    {
        return _str.reverse();
    }

    function cancatenate(string calldata _str1, string calldata _str2)
        external
        pure
        returns (string memory)
    {
        return _str1.concatenateUsingABI(_str2);
    }

    function compare(string calldata _str1, string calldata _str2)
        external
        pure
        returns (bool)
    {
        return _str1.compareUsignABI(_str2);
    }

    function isSubstring(string calldata _str1, string calldata _str2)
        external
        pure
        returns (int256)
    {
        return _str1.isSubstring(_str2);
    }
}
