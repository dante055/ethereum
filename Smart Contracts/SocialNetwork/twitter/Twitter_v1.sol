// SPDX-License-Identifier: MIT
pragma solidity 0.7.0;

contract Twitter {
    struct Tweet {
        uint256 id;
        bytes tweet;
        address from;
        address retweetedFrom;
        uint256 likes;
        uint256 dislikes;
        uint256 retweets;
        uint256 timeStamp;
    }
    mapping(uint256 => Tweet) tweets;
    uint256 private tweetId = 1;
    mapping(address => mapping(address => bool)) approve; // for 3rd party api

    struct User {
        uint256 followersNumber;
        address[] followers;
        uint256[] myTweetIds;
        uint256[] myDmIds;
        mapping(address => bool) _followers;
        mapping(uint256 => bool) _tweet;
        mapping(uint256 => bool) _dm;
    }
    mapping(address => User) user;

    struct Message {
        uint256 id;
        bytes message;
        uint256 timestamp;
    }
    struct DirectMessage {
        uint256 id; // uint(from) + uint(to)
        uint256 total;
        mapping(uint256 => Message) message;
    }
    mapping(uint256 => DirectMessage) messages;

    function tweet(string calldata _content) external {
        _tweet(bytes(_content), msg.sender);
    }

    function tweetFrom(string calldata _content, address _from) external {
        require(
            approve[_from][msg.sender] == true,
            "You are not appeved to send the tweet for this account!"
        );
        _tweet(bytes(_content), msg.sender);
    }

    function retweet(uint256 _tweetId) external tweetExist(_tweetId) {
        tweets[tweetId].retweetedFrom = tweets[_tweetId].from;
        _tweet(tweets[_tweetId].tweet, msg.sender);
    }

    function deleteTweet(uint256 _tweetId) external tweetExist(_tweetId) {
        require(
            tweets[_tweetId].from == msg.sender,
            "You are not he sender of this tweet!!"
        );
        delete tweets[tweetId];
    }

    function toggleApproveTweet(address _apiAddress) external {
        approve[msg.sender][_apiAddress] = !approve[msg.sender][_apiAddress];
    }

    function follow() external {}

    function unfollow() external {}

    function directMsg() external {}

    function blockUser() external {}

    function likeDislike() external {}

    function listTweets() external {}

    function listFollowers() external {}

    function _filter() internal {}

    function _tweet(bytes memory _content, address _from) internal {
        tweets[tweetId].id = tweetId;
        tweets[tweetId].from = _from;
        tweets[tweetId].tweet = _content;

        user[msg.sender].myTweetIds.push(tweetId);
        user[msg.sender]._tweet[tweetId] = true;
        tweetId++;
    }

    modifier tweetExist(uint256 _tweetId) {
        require(tweets[_tweetId].id != 0, "Tweet for this id does not exist!!");
        _;
    }
}
