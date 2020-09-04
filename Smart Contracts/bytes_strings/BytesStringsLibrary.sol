// SPDX-License-Identifier:MIT
pragma solidity >=0.6.0 <0.7.0;

library BytesStringsLibrary {
    function returnBytes32() internal pure returns (bytes32) {
        return bytes32("a");
    }

    function returnBytes() internal pure returns (bytes memory) {
        return bytes("b");
    }

    function bytesToString(bytes memory _bytes)
        internal
        pure
        returns (string memory)
    {
        return string(_bytes);
    }

    function stringToBytes(string memory _str)
        internal
        pure
        returns (bytes memory)
    {
        return bytes(_str);
    }

    /* bytes32 to byte */
    function bytes32ToBytes(bytes32 _bytes32)
        public
        pure
        returns (bytes memory)
    {
        // string memory str = string(_bytes32);
        // TypeError: Explicit type conversion not allowed from "bytes32" to "string storage pointer"

        // bytes memory bytesArray = new bytes(_bytes32);
        // TypeError: Invalid type for argument in function call. Invalid implicit conversion from bytes32 to uint256 requested.

        bytes memory bytesArray = new bytes(32);
        for (uint256 i; i < 32; i++) {
            bytesArray[i] = _bytes32[i];
        }
        return bytesArray;
    }

    /* bytes to bytes32 */
    function bytesToBytes32(bytes memory _bytes)
        public
        pure
        returns (bytes32 result)
    {
        require(bytes(_bytes).length <= 32, "bytes have to be max 32 chars");
        assembly {
            result := mload(add(_bytes, 32))
        }
    }

    /* byte32 to string */
    function bytes32ToString(bytes32 _bytes32)
        internal
        pure
        returns (string memory)
    {
        // return string(_bytes32);
        //  Explicit type conversion not allowed from "bytes32" to "string memory".

        bytes memory bytesArray = bytes32ToBytes(_bytes32);
        return string(bytesArray);
    }

    /* string to byte32 */
    function stringToBytes32(string memory _str)
        public
        pure
        returns (bytes32 result)
    {
        // return string(_bytes32);
        // Explicit type conversion not allowed from "string memory" to "bytes32

        // https://ethereum.stackexchange.com/questions/9603/understanding-mload-assembly-function
        // http://solidity.readthedocs.io/en/latest/assembly.html
        require(bytes(_str).length <= 32, "string have to be max 32 chars");
        assembly {
            result := mload(add(_str, 32))
        }
    }

    /* uint to string */
    function uintToString(uint256 interger)
        internal
        pure
        returns (string memory str)
    {
        // return string(interger);
        // Explicit type conversion not allowed from "uint256" to "string memory".

        uint256 _interger = interger;
        uint256 maxlength = 100;
        bytes memory reversed = new bytes(maxlength);
        uint256 i = 0;
        while (_interger != 0) {
            uint256 remainder = _interger % 10;
            _interger = _interger / 10;
            reversed[i++] = bytes1(uint8(48 + remainder));
        }
        bytes memory s = new bytes(i + 1);
        for (uint256 j = 0; j <= i; j++) {
            s[j] = reversed[i - j];
        }
        return string(s);
    }

    /* uint to bytes */
    function uintToBytes(uint256 interger)
        internal
        pure
        returns (bytes memory)
    {
        // return bytes(interger);
        //  Explicit type conversion not allowed from "uint256" to "bytes memory".

        uint256 _interger = interger;
        uint256 maxlength = 100;
        bytes memory reversed = new bytes(maxlength);
        uint256 i = 0;
        while (_interger != 0) {
            uint256 remainder = _interger % 10;
            _interger = _interger / 10;
            reversed[i++] = bytes1(uint8(48 + remainder));
        }
        bytes memory s = new bytes(i);
        for (uint256 j = 0; j <= i; j++) {
            if (i - j != i) s[j - 1] = reversed[i - j];
        }
        return s;
    }

    /* bytes to uint */
    function bytesToUint(bytes memory _bytes) internal pure returns (uint256) {
        uint256 i;
        uint256 result = 0;
        for (i = 0; i < _bytes.length; i++) {
            uint256 c = uint256(uint8(_bytes[i]));
            if (c >= 48 && c <= 57) {
                result = result * 10 + (c - 48);
            }
        }
        return result;
    }

    /* string to bytes */
    function stringToUint(string memory _str) internal pure returns (uint256) {
        bytes memory _bytes = bytes(_str);
        uint256 i;
        uint256 result = 0;
        for (i = 0; i < _bytes.length; i++) {
            uint256 c = uint256(uint8(_bytes[i]));
            if (c >= 48 && c <= 57) {
                result = result * 10 + (c - 48);
            }
        }
        return result;
    }

    /* address to bytes */
    function addressToBytes(address a) internal pure returns (bytes memory) {
        // using assembly
        // bytes memory b;
        // assembly {
        //     let m := mload(0x40)
        //     a := and(a, 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF)
        //     mstore(add(m, 20), xor(0x140000000000000000000000000000000000000000, a))
        //     mstore(0x40, add(m, 52))
        //     b := m
        // }
        // return b;  s

        // using abi.encodePacked
        return abi.encodePacked(a);
    }

    /* address to string */
    function addressToAsciiString(address x)
        internal
        pure
        returns (string memory)
    {
        bytes memory s = new bytes(40);
        for (uint256 i = 0; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint256(x) / (2**(8 * (19 - i)))));
            bytes1 hi = bytes1(uint8(b) / 16);
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
            s[2 * i] = char(hi);
            s[2 * i + 1] = char(lo);
        }
        return string(s);
    }

    function char(bytes1 b) internal pure returns (bytes1 c) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }

    /* bytes to address */
    function bytesToAddress(bytes memory _bytes)
        internal
        pure
        returns (address)
    {
        bytes20 _result;
        assembly {
            _result := mload(add(_bytes, 0x20))
        }
        return address(_result);
    }

    /* string to address */
}
