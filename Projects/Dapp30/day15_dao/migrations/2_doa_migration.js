const Dao = artifacts.require('DAO');

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(Dao, 600, 600, 51, { from: accounts[0] });

  const doa = await Dao.deployed();

  await doa.contribute({
    from: accounts[1],
    value: web3.utils.toWei('5', 'ether'),
  });
  await doa.contribute({
    from: accounts[2],
    value: web3.utils.toWei('4', 'ether'),
  });
  await doa.contribute({
    from: accounts[3],
    value: web3.utils.toWei('3', 'ether'),
  });

  const timestap = await doa.getTimeStamp();
  console.log(timestap.toString());

  await new Promise(resolve => setTimeout(resolve, 2000));

  await doa.createProposal('Proposal 1', 1000, accounts[4], {
    from: accounts[1],
  });

  await doa.createProposal('Proposal 2', 2000, accounts[4], {
    from: accounts[1],
  });
  await doa.createProposal('Proposal 3', 3000, accounts[4], {
    from: accounts[1],
  });
  await doa.createProposal('Proposal 4', 4000, accounts[4], {
    from: accounts[1],
  });
  await doa.createProposal('Proposal 5', 5000, accounts[4], {
    from: accounts[1],
  });
  await doa.createProposal('Proposal 6', 6000, accounts[4], {
    from: accounts[1],
  });
  await doa.createProposal('Proposal 7', 7000, accounts[4], {
    from: accounts[1],
  });
  await doa.createProposal('Proposal 8', 8000, accounts[4], {
    from: accounts[1],
  });
  await doa.createProposal('Proposal 9', 9000, accounts[4], {
    from: accounts[1],
  });
  await doa.createProposal('Proposal 10', 10000, accounts[4], {
    from: accounts[1],
  });
};
