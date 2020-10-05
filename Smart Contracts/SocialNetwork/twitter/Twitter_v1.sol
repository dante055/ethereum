// SPDX-License-Identifier: MIT
pragma solidity 0.7.0;

contract Twitter {
    enum LikeDislike {LIKE, DISLIKE}
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

    mapping(address => mapping(uint256 => bool)) userLike;
    mapping(address => mapping(uint256 => bool)) userDislike;

    struct User {
        uint256 followersNumber;
        address[] followers;
        uint256[] myTweetIds;
        uint256[] myDmIds;
        mapping(address => bool) _followers;
        mapping(uint256 => bool) _tweet;
        mapping(uint256 => bool) _dm;
        mapping(address => bool) blockUsers;
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
    mapping(uint256 => DirectMessage) directMessages;

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

    function followToggle(address _user) external {
        if (user[_user]._followers[msg.sender]) {
            user[_user].followersNumber--;
            user[_user]._followers[msg.sender] = false;
        } else {
            user[_user].followersNumber++;
            user[_user].followers.push(msg.sender);
            user[_user]._followers[msg.sender] = true;
        }
    }

    /* 
    function follow(address _user) external {
        user[_user].followersNumber++;
        user[_user].followers.push(msg.sender);
        user[_user]._followers[msg.sender] = true;
    }

    function unfollow(address _user) external {
        require(
            user[_user]._followers[msg.sender] == true,
            "You havent follow this user yet"
        );
        user[_user].followersNumber--;
        user[_user]._followers[msg.sender] = false;
    } 
    */

    function directMsg(bytes calldata _message, address _to) external {
        require(
            user[_to].blockUsers[msg.sender] == false,
            "You are block by this user, u cant send him message!!"
        );
        require(
            user[msg.sender].blockUsers[_to] == false,
            "You have block  this user, u cant send him message!!"
        );
        uint256 _dmId = uint256(msg.sender) + uint256(_to);
        uint256 _messageId = directMessages[_dmId].total;
        directMessages[_dmId].id = _dmId;
        directMessages[_dmId].message[_messageId] = Message(
            _messageId,
            bytes(_message),
            block.timestamp
        );
        directMessages[_dmId].total++;
    }

    function toggleBlockUser(address _blockUser) external {
        user[msg.sender].blockUsers[_blockUser] = !user[msg.sender]
            .blockUsers[_blockUser];
    }

    function likeDislike() external {}

    // _toggleType: 0 - like; 1- dislike
    function toggleLikeDislike(uint256 _tweetId, uint256 _toggleType)
        external
        tweetExist(_tweetId)
    {
        Tweet storage _tweet = tweets[_tweetId];

        require(_toggleType == 0 || _toggleType == 1, "Invaid toggle type!");

        if (_toggleType == uint256(LikeDislike.LIKE)) {
            if (userLike[msg.sender][_tweetId] == false) {
                if (userDislike[msg.sender][_tweetId] == true) {
                    _tweet.dislikes--;
                    userDislike[msg.sender][_tweetId] = false;
                }
                _tweet.likes++;
                userLike[msg.sender][_tweetId] = true;
            } else {
                _tweet.likes--;
                userLike[msg.sender][_tweetId] = false;
            }
        } else if (_toggleType == uint256(LikeDislike.DISLIKE)) {
            if (userDislike[msg.sender][_tweetId] == false) {
                if (userLike[msg.sender][_tweetId] == true) {
                    _tweet.likes--;
                    userLike[msg.sender][_tweetId] == false;
                }
                _tweet.dislikes++;
                userDislike[msg.sender][_tweetId] = true;
            } else {
                _tweet.dislikes--;
                userDislike[msg.sender][_tweetId] = false;
            }
        }
    }

    function listTweets() external {}

    function listFollowers() external view returns (uint256, address[] memory) {
        User storage _user = user[msg.sender];
        address[] memory _followers;

        for (uint256 i = 0; i < _user.followers.length; i++) {
            if (
                user[msg.sender]._followers[user[msg.sender].followers[i]] ==
                true
            ) {
                _followers[_followers.length] = user[msg.sender].followers[i];
            }
        }

        return (_followers.length, _followers);
    }

    function _filter() internal {}

    function _tweet(bytes memory _content, address _from) internal {
        tweets[tweetId].id = tweetId;
        tweets[tweetId].from = _from;
        tweets[tweetId].tweet = _content;
        tweets[tweetId].timeStamp = block.timestamp;

        user[msg.sender].myTweetIds.push(tweetId);
        user[msg.sender]._tweet[tweetId] = true;
        tweetId++;
    }

    modifier tweetExist(uint256 _tweetId) {
        require(tweets[_tweetId].id != 0, "Tweet for this id does not exist!!");
        _;
    }
}
