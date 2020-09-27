import { getWeb3, getContract } from './utils.js';

const initApp = async (web3, wallet) => {
  const $address = document.getElementById('address');
  const $owner = document.getElementById('owner');
  const $balance = document.getElementById('balance');

  const $deposite = document.getElementById('deposite');
  const $depositeResult = document.getElementById('deposite-result');

  const $transfer = document.getElementById('transfer');
  const $transferResult = document.getElementById('transfer-result');

  const accounts = await web3.eth.getAccounts();

  $address.innerHTML = wallet._address;
  wallet.methods
    .owner()
    .call()
    .then((result) => ($owner.innerHTML = result));

  const getBalance = async () => {
    $balance.innerHTML = await wallet.methods.balanceOf().call();
  };
  getBalance();

  $deposite.addEventListener('submit', async (e) => {
    e.preventDefault();
    const amount = e.target.elements[0].value;
    try {
      await web3.eth.sendTransaction({
        to: wallet._address,
        from: accounts[0],
        value: amount,
      });
      getBalance();
      $depositeResult.innerHTML = `Successfully deposited <b> ${amount} wei </b> to the wallet!!!`;
    } catch (error) {
      console.log(error);
      $depositeResult.innerHTML = `Opps... Something went worng... See console for more info!!!`;
    }
  });

  $transfer.addEventListener('submit', async (e) => {
    e.preventDefault();
    const to = e.target.elements[0].value;
    const amount = e.target.elements[1].value;
    try {
      await wallet.methods.transfer(to, amount).send({ from: accounts[0] });
      getBalance();
      $transferResult.innerHTML = `Successfully transfered <b> ${amount} wei </b> to this <b>${to}</b> address!!!`;
    } catch (error) {
      console.log(error);
      $transferResult.innerHTML = `Opps... Something went worng... See console for more info!!!`;
    }
  });
};

document.addEventListener('DOMContentLoaded', async () => {
  const web3 = await getWeb3();
  const wallet = await getContract(web3);
  await initApp(web3, wallet);
});
