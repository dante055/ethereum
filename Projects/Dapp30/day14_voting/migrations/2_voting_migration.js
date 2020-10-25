const Voting = artifacts.require('Voting');

module.exports = async function (deployer, networks, accounts) {
  await deployer.deploy(Voting);

  const voting = await Voting.deployed();
  await voting.createBallot('Ballot1', ['choice1', 'choice2', 'choice3'], 4);
  await voting.createBallot('Ballot2', ['choice1', 'choice2', 'choice3'], 10);
  await voting.addVoters(1, [accounts[1], accounts[2], accounts[3]]);
  await voting.beginVoting(1);
  await voting.createBallot('Ballot3', ['choice1', 'choice2', 'choice3'], 0);
  await voting.addVoters(2, [accounts[1], accounts[2], accounts[3]]);
  await voting.beginVoting(2);

  await new Promise(resolve => setTimeout(resolve, 3000));
  await voting.addVoters(0, [accounts[1], accounts[2], accounts[3]]);

  await voting.createBallot('Ballot1', ['choice1', 'choice2', 'choice3'], 2);
  await voting.createBallot('Ballot1', ['choice1', 'choice2', 'choice3'], 2);

  const ballotsDetail = await voting.showBallots();
  console.log(ballotsDetail);
  console.log(ballotsDetail.length);
};
