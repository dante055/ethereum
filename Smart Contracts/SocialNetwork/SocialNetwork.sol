/*
    --> contract
        - create post
        - tip post
*/

/*
    --> front end
        - list all post (convert bytes to ascii char)
        - sort post
            - most tip post at the top
            - most liked
            - newest tops
        - icon for their account
*/

/*
    -> deployed on rinkney

        address: 0xc453F08E4deB17377560d8b4c42ac70851FF0182
*/

  /*
    --> contract analysis

        - 1 eth = 387$
        - gas price : 1 gas =  216 gwei = 0.000000216 eth
        - 1gwei = 10^9 wei
        - cost(gwei) = gas * price

        -> deployment
            gas                999500 gas
            transaction cost   999500 gas (in gwei)

            - gas used
                 999500 (total cost in gwei) / 200 (cost of 1 gwei) = 4997.5


            - 999500 gwei = 0.0009995 eth
            - 0.0009995 * 387 * 70 = 27.076455 rs  (transtion fees * doller * rs)

        -> create a post
            transaction cost   91154 gas

            - 91154 gwei = 0.000091154 eth
            - 0.000091154 * 387 * 70 = 2.46936186 rs


        -> toggleLikeDislike analysic
            -> like
                -  transaction cost     81667 gas
                - 81667 gwei = 0.000081667 eth
                - 0.000081667 * 387 * 70 = 2.21235903 rs

            -> dislike when their is like
                - transaction cost      71933 gas
                - 71933 gwei = 0.000071933 eth
                -  0.000071933 * 387 * 70 = 1.9486649700000003 rs
    */

// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

contract SocialNetWork {

    struct Post {
        uint postId;
        bytes postContent;
        address postCreater;
        uint noOfTips;
        uint totalTippedAmount;

        uint likes;
        uint dislikes;
    }
    mapping (uint => Post) public posts;
    uint public postId;
    mapping (address => mapping(uint => bool)) userLike;
    mapping (address => mapping(uint => bool)) userDislike;

    // users and how many post they have made
    // use can get their total earnings in frontend by looping the posts or can create a seplate struct for that
    // this shouldned be doen as you are just dublicating the data which u already have in the posts
    /*
        struct User {
            uint totalPosts;
            uint totalAmoutReceived;
        }
        mapping (address => User) public users;
    */


    function createPost(string memory _post) external {

        require (bytes(_post).length > 0, "Post length should be greater than zero!");

        posts[postId] = Post(postId, bytes(_post), msg.sender, 0, 0, 0, 0);
        postId++;
    }

    // _toggleType: 0 - like; 1- dislike
    function toggleLikeDislike(uint _postId, uint _toggleType) external postExist(_postId) {
        Post memory _post = posts[_postId];

        require (_toggleType == 0 || _toggleType == 1, "Invaid toggle type!");

        if( _toggleType == 0) {
            if(userLike[msg.sender][_postId] == false) {
                if(userDislike[msg.sender][_postId] == true) {
                    _post.dislikes--;
                    userDislike[msg.sender][_postId] = false;
                }
                _post.likes++;
                userLike[msg.sender][_postId] = true;
            } else {
                _post.likes--;
                userLike[msg.sender][_postId] = false;
            }
        } else {
            if(userDislike[msg.sender][_postId] == false) {
                if(userLike[msg.sender][_postId] == true) {
                    _post.likes--;
                    userLike[msg.sender][_postId] == false;
                }
                _post.dislikes++;
                userDislike[msg.sender][_postId] = true;
            } else {
                _post.dislikes--;
                userDislike[msg.sender][_postId] = false;
            }
        }

        posts[_postId] = _post;
    }

    function tip(uint _postId) external postExist(_postId) payable{
        Post memory _post = posts[_postId];

        _post.noOfTips++;
        _post.totalTippedAmount += msg.value;
        posts[_postId] = _post;

        payable(_post.postCreater).transfer(msg.value);
    }

    modifier postExist(uint _postId) {
        require (posts[_postId].postContent.length > 0, "Post does not exist!");
        _;
    }

}
