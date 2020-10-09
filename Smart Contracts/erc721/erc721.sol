// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

/*  
    representation 
        etherum address of erc721 token =  token id

    fnctions
        -> balanceOf(address owner) : no of diffrenst token this address has 
        -> ownerOf(address token)

        -> safeTransferOf(from, to, tokenId, bytes4 data ) -> internal, public
            - transer the ownership of nft to one address to anothr smart contract address
            - if recipient address is smart contract then it knowshow to handle the token
            - safegaurds from token locking in the samrt contract so than tey cant be lost
            - make sure that tokens are never struck in smart contract
            - bytes4 data identifies transanction, recipient SC can decide base on this value wheter to accept of reject this transaction 

        -> safeTransferOf(from, to, tokenId)

        [ if recipient is a person then use transferFrom ]

        -> transferFrom(address from, address to, uint tokenId) -> internal, public
             can be call by : current owner, authorized operator, approved address for token id

        -> approve(address _appeoved, uint tokenId)
            - for echanges
            - for specific toeken

        - setAprovalForAll(address _operator, bool _appoved)
            - approve all the tokens for this operator

        - getApprved(uint tokenId) -> address
            - Gets the approved address for a token ID, or zero if no address

        - isApprovedForAll(address owner, address operator) → bool

        - _exists(uint256 tokenId) → bool internal

        - _isApprovedOrOwner(address spender, uint256 tokenId) → bool
            - Returns whether the given spender can transfer a given token ID.

        - _safeMint(address to, uint256 tokenId) -> Internal
            Reverts if the given token ID already exists
             If the target address is a contract, it must implement onERC721Received, which is called upon a safe transfer, and return the magic value bytes4(keccak256("onERC721Received(address,address,uint256,bytes)")); otherwise, the transfer is reverted.

        - _safeMint(address to, uint256 tokenId, bytes _data) ->  Internal
            Reverts if the given token ID already exists
            bytes4(keccak256("onERC721Received(address,address,uint256,bytes)")); otherwise, the transfer is reverted.
        
        - _mint(address to, uint256 tokenId) -> internal 
        
        - _burn(uint256 tokenId) -> internal 

        - _checkOnERC721Received(address from, address to, uint256 tokenId, bytes _data) → bool
            Internal function to invoke IERC721Receiver.onERC721Received on a target address. The call is not executed if the target address is not a contract.

*/

import "./AddressUtils.sol";

// miniting, metata etension and enumeration extention  is not impelemted yet

// functions in interface are abstract by default
// abstract contract ERC721 {
interface ERC721 {
    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 indexed _tokenId
    );
    event Approval(
        address indexed _owner,
        address indexed _approved,
        uint256 indexed _tokenId
    );
    event ApprovalForAll(
        address indexed _owner,
        address indexed _operator,
        bool _approved
    );

    function balanceOf(address _owner) external view returns (uint256);

    // function balanceOf(address _owner) external virtual view returns (uint256);

    function ownerOf(uint256 _tokenId) external view returns (address);

    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId,
        bytes calldata data
    ) external payable;

    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) external payable;

    function transferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) external payable;

    function approve(address _approved, uint256 _tokenId) external;

    function getApproved(uint256 tokenId) external view returns (address);

    function setApprovalForAll(address _operator, bool _approved) external;

    function isApprovedForAll(address _owner, address _operator)
        external
        view
        returns (bool);
}

// interface ERC165 {
//     function supportsInterface(bytes4 interfaceID) external view returns (bool);
// }

// any contract that recievie erc721 token must implement this function
interface ERC721TokenReceiver {
    function onERC721Received(
        address _operator,
        address _from,
        uint256 _tokenId,
        bytes calldata _data
    ) external returns (bytes4);
}

contract ERC721Token is ERC721 {
    using AddressUtils for address;

    // bytes4 private constant _INTERFACE_ID_ERC721 = 0x80ac58cd;
    // bytes4 private constant _INTERFACE_ID_ERC721_METADATA = 0x5b5e139f;

    // Equals to `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`
    // which can be also obtained as `IERC721Receiver(0).onERC721Received.selector`
    bytes4 private constant _ERC721_RECEIVED = 0x150b7a02;

    mapping(address => uint256) private ownerToTokenCount;
    mapping(uint256 => address) private tokenIdToOwner;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    function balanceOf(address _owner) public override view returns (uint256) {
        return ownerToTokenCount[_owner];
    }

    function ownerOf(uint256 _tokenId) public override view returns (address) {
        return tokenIdToOwner[_tokenId];
    }

    function approve(address to, uint256 tokenId) external virtual override {
        address owner = ownerOf(tokenId);
        require(to != owner, "ERC721: approval to current owner");

        require(
            msg.sender == owner || isApprovedForAll(owner, msg.sender),
            "ERC721: approve caller is not owner nor approved for all"
        );

        _approve(to, tokenId);
    }

    function getApproved(uint256 tokenId)
        public
        override
        view
        returns (address)
    {
        require(
            _exists(tokenId),
            "ERC721: approved query for nonexistent token"
        );

        return _tokenApprovals[tokenId];
    }

    function setApprovalForAll(address operator, bool approved)
        external
        virtual
        override
    {
        require(operator != msg.sender, "ERC721: approve to caller");

        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function isApprovedForAll(address owner, address operator)
        public
        override
        view
        returns (bool)
    {
        return _operatorApprovals[owner][operator];
    }

    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId,
        bytes calldata data
    ) public override payable {
        require(
            _isApprovedOrOwner(msg.sender, _tokenId),
            "ERC721: transfer caller is not owner nor approved"
        );
        _safeTransferFrom(_from, _to, _tokenId, data);
    }

    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) external override payable {
        safeTransferFrom(_from, _to, _tokenId, "");
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) external override payable {
        require(
            _isApprovedOrOwner(msg.sender, _tokenId),
            "ERC721: transfer caller is not owner nor approved"
        );
        _transfer(_from, _to, _tokenId);
    }

    function _exists(uint256 _tokenId) internal view returns (bool) {
        if (ownerOf(_tokenId) != address(0)) {
            return true;
        }
        return false;
    }

    function _approve(address to, uint256 tokenId) private {
        _tokenApprovals[tokenId] = to;
        emit Approval(ownerOf(tokenId), to, tokenId);
    }

    function _isApprovedOrOwner(address spender, uint256 tokenId)
        internal
        view
        returns (bool)
    {
        require(
            _exists(tokenId),
            "ERC721: operator query for nonexistent token"
        );
        address owner = ownerOf(tokenId);
        return (spender == owner ||
            getApproved(tokenId) == spender ||
            isApprovedForAll(owner, spender));
    }

    function _safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId,
        bytes memory _data
    ) internal {
        _transfer(_from, _to, _tokenId);

        require(
            _checkOnERC721Received(_from, _to, _tokenId, _data),
            "ERC721: transfer to non ERC721Receiver implementer"
        );
    }

    function _transfer(
        address _from,
        address _to,
        uint256 _tokenId
    ) internal {
        require(
            tokenIdToOwner[_tokenId] == _from,
            "ERC721: transfer of token that is not own"
        );
        require(_to != address(0), "ERC721: transfer to the zero address");

        ownerToTokenCount[_from]--;
        ownerToTokenCount[_to]++;
        tokenIdToOwner[_tokenId] = _to;

        emit Transfer(_from, _to, _tokenId);
    }

    function _checkOnERC721Received(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) private returns (bool) {
        /* 
        
        // if address is SC address not a EOA
        if (_to.isContract()) {
            // call thesc, execute a pre define  function

            bytes4 retval = ERC721TokenReceiver(_to).onERC721Received(
                msg.sender,
                _from,
                _tokenId,
                data
            );

            // compare this value with a pre define value
            require(
                retval == _INTERFACE_ID_ERC721_METADATA,
                "Recipient smart contract can not handle erc721 tokens"
            );
        }
         */

        if (!to.isContract()) {
            return true;
        }

        bytes memory returndata = to.functionCall(
            abi.encodeWithSelector(
                ERC721TokenReceiver(to).onERC721Received.selector,
                msg.sender,
                from,
                tokenId,
                _data
            ),
            "ERC721: transfer to non ERC721Receiver implementer"
        );
        bytes4 retval = abi.decode(returndata, (bytes4));
        return (retval == _ERC721_RECEIVED);
    }
}
