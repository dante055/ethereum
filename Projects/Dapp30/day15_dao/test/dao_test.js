const { expectRevert, time } = require('@openzeppelin/test-helpers');
const Dao = artifacts.require('DAO');

contract('Test for Dao smart contract', accounts => {
  let dao;
  let investmentTmeLimit = 1; // sec
  let votingTimeLimit = 1; // sec
  let quorum = 55; // total percentage of votes required
  beforeEach(async () => {
    dao = await Dao.new(investmentTmeLimit, votingTimeLimit, quorum, {
      from: accounts[0],
    });
  });

  it('Should allow investor to invest', async () => {
    await dao.contribute({
      value: web3.utils.toWei('1', 'ether'),
      from: accounts[1],
    });
    await dao.contribute({
      value: web3.utils.toWei('2', 'ether'),
      from: accounts[2],
    });
    await dao.contribute({
      value: web3.utils.toWei('3', 'ether'),
      from: accounts[3],
    });

    const contractBalance = await dao.balanceOf();
    const investor1 = await dao.investors(accounts[1]);
    const investor2 = await dao.investors(accounts[2]);
    const investor3 = await dao.investors(accounts[3]);
    const notInvestor = await dao.investors(accounts[4]);

    assert(
      contractBalance.toString() === web3.utils.toWei('6', 'ether'),
      'contract balance do naot match'
    );
    assert(
      investor1.isInvestor === true &&
        investor1.shares.toString() === web3.utils.toWei('1', 'ether'),
      'investor1 data not match'
    );
    assert(
      investor2.isInvestor === true &&
        investor2.shares.toString() === web3.utils.toWei('2', 'ether'),
      'investor2 data not match'
    );
    assert(
      investor3.isInvestor === true &&
        investor3.shares.toString() === web3.utils.toWei('3', 'ether'),
      'investor3 data not match'
    );
    assert(notInvestor.isInvestor === false, 'investor data not match');
  });

  it('Should not allow investor to invest if investment time is over', async () => {
    await time.increase(2001);

    await expectRevert(
      dao.contribute({
        value: web3.utils.toWei('1', 'ether'),
        from: accounts[2],
      }),
      'The investment period has already ended!'
    );
  });

  it('Should create a proposal', async () => {
    await dao.contribute({
      value: web3.utils.toWei('1', 'ether'),
      from: accounts[1],
    });
    await dao.contribute({
      value: web3.utils.toWei('1', 'ether'),
      from: accounts[2],
    });
    await dao.contribute({
      value: web3.utils.toWei('1', 'ether'),
      from: accounts[3],
    });

    const availabeAmoutBefore = await dao.availabeAmout();

    await dao.createProposal(
      'proposal_1',
      web3.utils.toWei('1', 'ether'),
      accounts[4],
      {
        from: accounts[1],
      }
    );

    const proposal = await dao.proposals(0);
    const availabeAmoutAfter = await dao.availabeAmout();
    assert(
      proposal.proposalExist === true &&
        proposal.amount.toString() === web3.utils.toWei('1', 'ether'),
      'proposal data dont match'
    );
    assert(
      availabeAmoutBefore.sub(availabeAmoutAfter).toString() ===
        web3.utils.toWei('1', 'ether'),
      'Available amout fo proposal creation dont match'
    );
  });

  it('Should not create a proposal if caller is not a investor', async () => {
    await dao.contribute({
      value: web3.utils.toWei('1', 'ether'),
      from: accounts[1],
    });

    await expectRevert(
      dao.createProposal(
        'proposal_1',
        web3.utils.toWei('1', 'ether'),
        accounts[4],
        {
          from: accounts[5],
        }
      ),
      'Caller is not a investor!'
    );
  });

  it('Should not create a proposal if the contract has insufficient funds', async () => {
    await dao.contribute({
      value: web3.utils.toWei('1', 'ether'),
      from: accounts[1],
    });

    await expectRevert(
      dao.createProposal(
        'proposal_1',
        web3.utils.toWei('3', 'ether'),
        accounts[4],
        {
          from: accounts[1],
        }
      ),
      'Dao has insufficient funds at the current time!'
    );
  });

  it('Should not create a proposal if available amount to invest in proposal is less than actual proposal amout', async () => {
    await dao.contribute({
      value: web3.utils.toWei('1', 'ether'),
      from: accounts[1],
    });
    dao.createProposal(
      'proposal_1',
      web3.utils.toWei('1', 'ether'),
      accounts[4],
      {
        from: accounts[1],
      }
    ),
      await expectRevert(
        dao.createProposal(
          'proposal_1',
          web3.utils.toWei('1', 'ether'),
          accounts[4],
          {
            from: accounts[1],
          }
        ),
        'Dao has insufficient funds at the current time!'
      );
  });

  it('Should allow investor to vote for a proposal', async () => {
    await dao.contribute({
      value: web3.utils.toWei('1', 'ether'),
      from: accounts[1],
    });
    await dao.contribute({
      value: web3.utils.toWei('1', 'ether'),
      from: accounts[2],
    });
    await dao.contribute({
      value: web3.utils.toWei('1', 'ether'),
      from: accounts[3],
    });
    await dao.createProposal(
      'proposal_1',
      web3.utils.toWei('1', 'ether'),
      accounts[4],
      {
        from: accounts[1],
      }
    );

    await dao.vote(0, { from: accounts[2] });
    await dao.vote(0, { from: accounts[3] });

    const proposal = await dao.proposals(0);
    assert(
      proposal.votesRecievedPerShare.toString() ===
        web3.utils.toWei('2', 'ether'),
      'proposal votes dont match'
    );
  });

  it('Should not allow voter to vote if voter is not a investor', async () => {
    await dao.contribute({
      value: web3.utils.toWei('1', 'ether'),
      from: accounts[1],
    });
    await dao.contribute({
      value: web3.utils.toWei('1', 'ether'),
      from: accounts[2],
    });
    await dao.createProposal(
      'proposal_1',
      web3.utils.toWei('1', 'ether'),
      accounts[4],
      {
        from: accounts[1],
      }
    );

    await expectRevert(
      dao.vote(0, { from: accounts[5] }),
      'Caller is not a investor!'
    );
  });

  it('Should not allow voter to vote if voting period has ended', async () => {
    await dao.contribute({
      value: web3.utils.toWei('1', 'ether'),
      from: accounts[1],
    });
    await dao.contribute({
      value: web3.utils.toWei('1', 'ether'),
      from: accounts[2],
    });
    await dao.createProposal(
      'proposal_1',
      web3.utils.toWei('1', 'ether'),
      accounts[4],
      {
        from: accounts[1],
      }
    );

    await time.increase('1001');

    await expectRevert(
      dao.vote(0, { from: accounts[2] }),
      'Voting period has alredy ended!'
    );
  });

  it('Should not allow voter to vote if voter has already voted', async () => {
    await dao.contribute({
      value: web3.utils.toWei('1', 'ether'),
      from: accounts[1],
    });
    await dao.contribute({
      value: web3.utils.toWei('1', 'ether'),
      from: accounts[2],
    });
    await dao.createProposal(
      'proposal_1',
      web3.utils.toWei('1', 'ether'),
      accounts[4],
      {
        from: accounts[1],
      }
    );

    dao.vote(0, { from: accounts[2] }),
      await expectRevert(
        dao.vote(0, { from: accounts[2] }),
        'You have already voted for this proposal!'
      );
  });

  it('Should allow admin to execute a proposal after voting has over', async () => {
    await dao.contribute({
      value: web3.utils.toWei('1', 'ether'),
      from: accounts[1],
    });
    await dao.contribute({
      value: web3.utils.toWei('1', 'ether'),
      from: accounts[2],
    });
    await dao.contribute({
      value: web3.utils.toWei('1', 'ether'),
      from: accounts[3],
    });
    await dao.createProposal(
      'proposal_1',
      web3.utils.toWei('1', 'ether'),
      accounts[4],
      {
        from: accounts[1],
      }
    );

    await dao.vote(0, { from: accounts[2] });
    await dao.vote(0, { from: accounts[3] });

    await time.increase('1001');

    await dao.executeTransfer(0, { from: accounts[0] });

    const proposal = await dao.proposals(0);
    assert(proposal.executed === true, 'unable to execute the proposal');
  });

  it('Should pass a proposal if the voting percent is more than the quorum', async () => {
    await dao.contribute({
      value: web3.utils.toWei('1', 'ether'),
      from: accounts[1],
    });
    await dao.contribute({
      value: web3.utils.toWei('1', 'ether'),
      from: accounts[2],
    });
    await dao.contribute({
      value: web3.utils.toWei('1', 'ether'),
      from: accounts[3],
    });
    await dao.createProposal(
      'proposal_1',
      web3.utils.toWei('1', 'ether'),
      accounts[4],
      {
        from: accounts[1],
      }
    );

    await dao.vote(0, { from: accounts[2] });
    await dao.vote(0, { from: accounts[3] });

    const recipientBalanceBefore = web3.utils.toBN(
      await web3.eth.getBalance(accounts[4])
    );

    await time.increase('1001');

    await dao.executeTransfer(0, { from: accounts[0] });

    const proposal = await dao.proposals(0);

    const recipientBalanceAfter = web3.utils.toBN(
      await web3.eth.getBalance(accounts[4])
    );

    assert(
      proposal.executed === true && proposal.proposalPassed === true,
      'unable to execute the proposal'
    );
    assert(
      recipientBalanceAfter.sub(recipientBalanceBefore).toString() ===
        web3.utils.toWei('1', 'ether'),
      ' recipient account balance dont match'
    );
  });

  it('Should not pass a proposal if the voting percent is less than the quorum', async () => {
    await dao.contribute({
      value: web3.utils.toWei('1', 'ether'),
      from: accounts[1],
    });
    await dao.contribute({
      value: web3.utils.toWei('1', 'ether'),
      from: accounts[2],
    });
    await dao.contribute({
      value: web3.utils.toWei('1', 'ether'),
      from: accounts[3],
    });
    await dao.createProposal(
      'proposal_1',
      web3.utils.toWei('1', 'ether'),
      accounts[4],
      {
        from: accounts[1],
      }
    );

    await dao.vote(0, { from: accounts[2] });

    await time.increase('1001');

    await dao.executeTransfer(0, { from: accounts[0] });

    const proposal = await dao.proposals(0);

    assert(
      proposal.executed === true && proposal.proposalPassed === false,
      'unable to execute the proposal'
    );
  });

  it('Should not exeute proposal if caller is not admin', async () => {
    await dao.contribute({
      value: web3.utils.toWei('1', 'ether'),
      from: accounts[1],
    });
    await dao.createProposal(
      'proposal_1',
      web3.utils.toWei('1', 'ether'),
      accounts[4],
      {
        from: accounts[1],
      }
    );
    await time.increase('1001');

    await expectRevert(
      dao.executeTransfer(0, { from: accounts[1] }),
      'Caller is not  admin!'
    );
  });

  it('Should not exeute proposal if has already been executed', async () => {
    await dao.contribute({
      value: web3.utils.toWei('1', 'ether'),
      from: accounts[1],
    });
    await dao.createProposal(
      'proposal_1',
      web3.utils.toWei('1', 'ether'),
      accounts[4],
      {
        from: accounts[1],
      }
    );
    await time.increase('1001');
    await dao.executeTransfer(0, { from: accounts[0] });

    await expectRevert(
      dao.executeTransfer(0, { from: accounts[0] }),
      'The proposal has already been executed!'
    );
  });

  it('Should not exeute proposal if voting period hasnt ended', async () => {
    await dao.contribute({
      value: web3.utils.toWei('1', 'ether'),
      from: accounts[1],
    });
    await dao.createProposal(
      'proposal_1',
      web3.utils.toWei('1', 'ether'),
      accounts[4],
      {
        from: accounts[1],
      }
    );

    await expectRevert(
      dao.executeTransfer(0, { from: accounts[0] }),
      "The voting for this proposal hasn't ended!"
    );
  });

  //   it.only('Should transfer all the funds to the investors as per shares as an emergency exit', async () => {
  //     await dao.contribute({
  //       value: web3.utils.toWei('1', 'ether'),
  //       from: accounts[1],
  //     });
  //     await dao.contribute({
  //       value: web3.utils.toWei('2', 'ether'),
  //       from: accounts[1],
  //     });
  //     await dao.contribute({
  //       value: web3.utils.toWei('3', 'ether'),
  //       from: accounts[1],
  //     });
  //     const contractBalanceBefore = await dao.balanceOf();
  //     const totalShares = await dao.totalShares();
  //     const perSharePrice = contractBalanceBefore.div(totalShares);
  //     console.log(perSharePrice.toString());

  //     const investor1BalanceBefore = web3.utils.toBN(
  //       await web3.eth.getBalance(accounts[1])
  //     );
  //     const investor2BalanceBefore = web3.utils.toBN(
  //       await web3.eth.getBalance(accounts[2])
  //     );
  //     const investor3BalanceBefore = web3.utils.toBN(
  //       await web3.eth.getBalance(accounts[3])
  //     );

  // await dao.emergencyExit({ from: accounts[0] });

  //     const contractBalanceAfter = await dao.balanceOf();
  //     const investor1BalanceAfter = web3.utils.toBN(
  //       await web3.eth.getBalance(accounts[1])
  //     );
  //     const investor2BalanceAfter = web3.utils.toBN(
  //       await web3.eth.getBalance(accounts[2])
  //     );
  //     const investor3BalanceAfter = web3.utils.toBN(
  //       await web3.eth.getBalance(accounts[3])
  //     );

  //     console.log(investor1BalanceAfter.sub(investor1BalanceBefore).toString());
  //     console.log(
  //       web3.utils
  //         .toBN(web3.utils.toWei('1', 'eth'))
  //         .mul(perSharePrice)
  //         .toString()
  //     );

  //     assert(
  //       investor1BalanceAfter.sub(investor1BalanceBefore).toString() ===
  //         web3.utils
  //           .toBN(web3.utils.toWei('1', 'eth'))
  //           .mul(perSharePrice)
  //           .toString()
  //     );
  //   });
});
