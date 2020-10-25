const { expectRevert } = require('@openzeppelin/test-helpers');
const { resolve } = require('path');
const { assert } = require('console');
const Voting = artifacts.require('Voting');

contract('Tests for Voting smart contract', accounts => {
  let voting;

  beforeEach(async () => {
    const ballotName = 'ballot1';
    const choices = ['choice1', 'choice2', 'choice3'];
    const timeLimit = 2;

    voting = await Voting.new({ from: accounts[0] });

    await voting.createBallot(ballotName, choices, timeLimit, {
      from: accounts[0],
    });
  });

  it('Shrould create a ballot', async () => {
    const ballotName = 'ballot2';
    const choices = ['choice1', 'choice2', 'choice3'];
    const timeLimit = 3;

    await voting.createBallot(ballotName, choices, timeLimit, {
      from: accounts[0],
    });

    const ballot = await voting.ballots(1);

    assert(ballot.ballotExist === true, 'ballot does not exist');
    assert(ballot.name === ballotName, 'ballot name does not match');
  });

  it('Should not create a ballot if caller is not admin', async () => {
    await expectRevert(
      voting.createBallot('ballot2', ['c1', 'c2', 'c3'], 2, {
        from: accounts[5],
      }),
      'Caller is not admin!'
    );
  });

  it('Should not create a ballot if there arent minimum two choices', async () => {
    await expectRevert(
      voting.createBallot('ballot2', ['c1'], 2, {
        from: accounts[0],
      }),
      'Should have minimum 2 choices present for the ballot!'
    );
    await expectRevert(
      voting.createBallot('ballot2', [], 2, {
        from: accounts[0],
      }),
      'Should have minimum 2 choices present for the ballot!'
    );
  });

  it('Should show the ballot with their status', async () => {
    voting = await Voting.new();
    await voting.createBallot('Ballot1', ['choice1', 'choice2', 'choice3'], 4);
    await voting.createBallot('Ballot2', ['choice1', 'choice2', 'choice3'], 4);
    await voting.addVoters(1, [accounts[1], accounts[2], accounts[3]]);
    await voting.beginVoting(1);
    await voting.createBallot('Ballot3', ['choice1', 'choice2', 'choice3'], 0);
    await voting.addVoters(2, [accounts[1], accounts[2], accounts[3]]);
    await voting.beginVoting(2);

    // await new Promise(resolve => setTimeout(resolve, 3000));
    // await voting.addVoters(0, [accounts[1], accounts[2], accounts[3]]);

    const ballotsDetail = await voting.showBallots();
    // console.log(ballotsDetail);
    // console.log(ballotsDetail.length);

    assert(
      ballotsDetail[0].ballotStatus === '0' &&
        ballotsDetail[1].ballotStatus === '1' &&
        ballotsDetail[2].ballotStatus === '2',
      'ballot status do not match'
    );
  });

  it('Should add voters for a ballot', async () => {
    await voting.addVoters(0, [accounts[1], accounts[2], accounts[3]], {
      from: accounts[0],
    });

    const voters = await voting.showVoters(0);

    assert(
      voters[0] == accounts[1] &&
        voters[1] == accounts[2] &&
        voters[2] == accounts[3],
      'voters address dont match'
    );
  });

  it('Should not add voters for a ballot is voting has already ended', async () => {
    await voting.addVoters(0, [accounts[1], accounts[2], accounts[3]], {
      from: accounts[0],
    });

    await voting.beginVoting(0, { from: accounts[0] });

    await new Promise(resolve =>
      setTimeout(() => {
        resolve();
      }, 2001)
    );

    await expectRevert(
      voting.addVoters(0, [accounts[4], accounts[5]], {
        from: accounts[0],
      }),
      'Cant add more voters as voting period has already endded!'
    );
  });

  it('Should begin the voting ', async () => {
    await voting.addVoters(0, [accounts[1], accounts[2], accounts[3]], {
      from: accounts[0],
    });

    let ballot = await voting.ballots(0);
    assert(ballot.hasVotingBegin === false, 'Voting is by defaut open');

    await voting.beginVoting(0, { from: accounts[0] });

    ballot = await voting.ballots(0);
    assert(ballot.hasVotingBegin === true, 'Voting has not begin yet');
  });

  it('Should not begin the voting  if it has already begun', async () => {
    await voting.addVoters(0, [accounts[1], accounts[2], accounts[3]], {
      from: accounts[0],
    });

    await voting.beginVoting(0, { from: accounts[0] });

    await expectRevert(
      voting.beginVoting(0, { from: accounts[0] }),
      'Voting has already started yet!'
    );
  });

  it('Should not begin the voting if there are not atlest 2 approved voters', async () => {
    await expectRevert(
      voting.beginVoting(0, { from: accounts[0] }),
      'Should have atleast 2 voters added as approved voters!'
    );

    await voting.addVoters(0, [accounts[1]], {
      from: accounts[0],
    });

    await expectRevert(
      voting.beginVoting(0, { from: accounts[0] }),
      'Should have atleast 2 voters added as approved voters!'
    );
  });

  it('Should be able to vote, if voting has begun and voter is approved ', async () => {
    await voting.addVoters(0, [accounts[1], accounts[2], accounts[3]], {
      from: accounts[0],
    });

    await voting.beginVoting(0, { from: accounts[0] });

    await voting.vote(0, 0, { from: accounts[1] });
    await voting.vote(0, 1, { from: accounts[2] });
    await voting.vote(0, 2, { from: accounts[3] });

    const ballot = await voting.ballots(0);
    assert(
      ballot.totalVatesLogged.toNumber() === 3,
      'No of votes loggled dont match'
    );
  });

  it('Should not be able to vote, if ballot does not exist', async () => {
    await expectRevert(
      voting.vote(1, 0, { from: accounts[1] }),
      'Ballot with this id does not exist!'
    );
  });

  it('Should not be able to vote, if choice does not exist', async () => {
    await voting.addVoters(0, [accounts[1], accounts[2], accounts[3]], {
      from: accounts[0],
    });

    await expectRevert(
      voting.vote(0, 3, { from: accounts[1] }),
      'Choice isnt present!'
    );
    await expectRevert(
      voting.vote(0, 4, { from: accounts[1] }),
      'Choice isnt present!'
    );
  });

  it('Should not be able to vote, if voting has not begun', async () => {
    await voting.addVoters(0, [accounts[1], accounts[2], accounts[3]], {
      from: accounts[0],
    });

    await expectRevert(
      voting.vote(0, 0, { from: accounts[1] }),
      'Voting hasnt begin yet!'
    );
  });

  it('Should not be able to vote, if voting period has ended', async () => {
    await voting.addVoters(0, [accounts[1], accounts[2], accounts[3]], {
      from: accounts[0],
    });

    await voting.beginVoting(0, { from: accounts[0] });

    await new Promise(resolve =>
      setTimeout(() => {
        resolve();
      }, 2001)
    );

    await expectRevert(
      voting.vote(0, 0, { from: accounts[1] }),
      'Voting period has endded!'
    );
  });

  it('Should not be able to vote, if you are not an approved voter', async () => {
    await voting.addVoters(0, [accounts[1], accounts[2], accounts[3]], {
      from: accounts[0],
    });

    await voting.beginVoting(0, { from: accounts[0] });

    await expectRevert(
      voting.vote(0, 0, { from: accounts[4] }),
      'Your are not an approved voter!'
    );
  });

  it('Should not be able to vote, if you have already voted', async () => {
    await voting.addVoters(0, [accounts[1], accounts[2], accounts[3]], {
      from: accounts[0],
    });

    await voting.beginVoting(0, { from: accounts[0] });
    await voting.vote(0, 0, { from: accounts[1] });

    await expectRevert(
      voting.vote(0, 0, { from: accounts[1] }),
      'You have already voted for this ballot!'
    );
  });

  it('Should show result when voting has ended', async () => {
    await voting.addVoters(0, [accounts[1], accounts[2], accounts[3]], {
      from: accounts[0],
    });

    await voting.beginVoting(0, { from: accounts[0] });

    await voting.vote(0, 1, { from: accounts[1] });
    await voting.vote(0, 0, { from: accounts[2] });
    await voting.vote(0, 0, { from: accounts[3] });

    await new Promise(resolve => setTimeout(resolve, 3000));

    // we are doing this so that block.timestatp can be updated by creating a new block
    await voting.createBallot('ballot2', ['c1', 'c2', 'c3'], 2, {
      from: accounts[0],
    });

    const result = await voting.result(0);
    // assert(
    //   result[0][2] === '2' && result[1][2] === '1' && result[2][2] === '0',
    //   'Votes recieved by each candidate dont match'
    // );
    assert(
      result[0].votesReceived === '2' &&
        result[1].votesReceived === '1' &&
        result[2].votesReceived === '0',
      'Votes recieved by each candidate dont match'
    );
  });

  it('Should not show result if voting has not begin yet', async () => {
    await voting.addVoters(0, [accounts[1], accounts[2], accounts[3]], {
      from: accounts[0],
    });

    await expectRevert(voting.result(0), 'Voting hasnt begin yet!');
  });

  it('Should not show result if voting has not ended yet', async () => {
    await voting.addVoters(0, [accounts[1], accounts[2], accounts[3]], {
      from: accounts[0],
    });

    await voting.beginVoting(0, { from: accounts[0] });
    await voting.vote(0, 1, { from: accounts[1] });
    await voting.vote(0, 0, { from: accounts[2] });
    await voting.vote(0, 0, { from: accounts[3] });

    await expectRevert(voting.result(0), 'Voting period has not endded yet!');
  });

  it('Should show winner when voting has ended', async () => {
    await voting.addVoters(0, [accounts[1], accounts[2], accounts[3]], {
      from: accounts[0],
    });

    await voting.beginVoting(0, { from: accounts[0] });

    await voting.vote(0, 1, { from: accounts[1] });
    await voting.vote(0, 0, { from: accounts[2] });
    await voting.vote(0, 0, { from: accounts[3] });

    await new Promise(resolve => setTimeout(resolve, 3000));

    // we are doing this so that block.timestatp can be updated by creating a new block
    await voting.createBallot('ballot2', ['c1', 'c2', 'c3'], 2, {
      from: accounts[0],
    });

    const winner = await voting.showWinner(0);
    assert(
      winner.choiceId === '0',
      winner.name === 'choice1',
      winner.votesReceived === '2',
      'Winner dont match'
    );
  });

  it('Should not show winner if voting has not begin yet', async () => {
    await voting.addVoters(0, [accounts[1], accounts[2], accounts[3]], {
      from: accounts[0],
    });

    await expectRevert(voting.showWinner(0), 'Voting hasnt begin yet!');
  });

  it('Should not show winner if voting has not ended yet', async () => {
    await voting.addVoters(0, [accounts[1], accounts[2], accounts[3]], {
      from: accounts[0],
    });

    await voting.beginVoting(0, { from: accounts[0] });
    await voting.vote(0, 1, { from: accounts[1] });
    await voting.vote(0, 0, { from: accounts[2] });
    await voting.vote(0, 0, { from: accounts[3] });
    await expectRevert(
      voting.showWinner(0),
      'Voting period has not endded yet!'
    );
  });
});
