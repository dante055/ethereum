// SPDX-License-Identifier:MIT
pragma solidity >=0.6.0 <0.7.0;

library StringsLibrary {
    function length(string memory _str) internal pure returns (uint256) {
        bytes memory _strBytes = bytes(_str);
        return _strBytes.length;
    }

    function reverse(string memory _str) internal pure returns (string memory) {
        bytes memory _strBytes = bytes(_str);
        bytes memory _reverseBytes = bytes(new string(_strBytes.length));

        for (uint256 i = 0; i < _strBytes.length; i++) {
            _reverseBytes[_strBytes.length - 1 - i] = _strBytes[i];
        }

        return string(_reverseBytes);
    }

    function concatenate(string memory _str1, string memory _str2)
        internal
        pure
        returns (string memory)
    {
        bytes memory _str1Bytes = bytes(_str1);
        bytes memory _str2Bytes = bytes(_str2);

        string memory _str = new string(_str1Bytes.length + _str2Bytes.length);
        bytes memory _strBytes = bytes(_str);

        uint256 i;
        uint256 j;

        for (i = 0; i < _str1Bytes.length; i++) {
            _strBytes[j++] = _str1Bytes[i];
        }

        for (i = 0; i < _str2Bytes.length; i++) {
            _strBytes[j++] = _str2Bytes[i];
        }

        return string(_strBytes);
    }

    function concatenateUsingABI(string memory _str1, string memory _str2)
        internal
        pure
        returns (string memory)
    {
        return string(abi.encodePacked(_str1, _str2));
    }

    function compare(string memory _str1, string memory _str2)
        internal
        pure
        returns (bool)
    {
        bytes memory _str1Bytes = bytes(_str1);
        bytes memory _str2Bytes = bytes(_str2);

        if (_str1Bytes.length != _str2Bytes.length) return false;

        for (uint256 i = 0; i < _str1Bytes.length; i++) {
            if (_str1Bytes[i] != _str2Bytes[i]) return false;
        }

        return true;
    }

    function compareUsignABI(string memory _str1, string memory _str2)
        internal
        pure
        returns (bool)
    {
        return keccak256(abi.encode(_str1)) == keccak256(abi.encode(_str2));
    }

    function isSubstring(string memory _base, string memory _value)
        internal
        pure
        returns (int256)
    {
        bytes memory _baseBytes = bytes(_base);
        bytes memory _valueBytes = bytes(_value);

        uint256 i;
        uint256 j;
        for (i = 0; i <= _baseBytes.length - _valueBytes.length; i++) {
            for (j = 0; j < _valueBytes.length; j++) {
                if (_baseBytes[i + j] != _valueBytes[j]) break;
            }
            if (j == _valueBytes.length) return int256(i + 1);
        }

        return -1;
    }
}
