import { getWeb3, getContract } from './utils.js';

const initApp = async (web3, splitPayment) => {
  const $address = document.getElementById('address');
  const $owner = document.getElementById('owner');
  const $balance = document.getElementById('balance');

  const $deposite = document.getElementById('deposite');
  const $depositeResult = document.getElementById('deposite-result');

  const $transfer = document.getElementById('transfer');
  const $transferResult = document.getElementById('transfer-result');

  const accounts = await web3.eth.getAccounts();

  $address.innerHTML = splitPayment._address;
  splitPayment.methods
    .owner()
    .call()
    .then((result) => ($owner.innerHTML = result));

  const getBalance = async () => {
    $balance.innerHTML = await splitPayment.methods.balanceOf().call();
  };
  getBalance();

  $deposite.addEventListener('submit', async (e) => {
    e.preventDefault();
    const amount = e.target.elements[0].value;
    try {
      await web3.eth.sendTransaction({
        to: splitPayment._address,
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
    const to = e.target.elements[0].value.split(', ');
    const amounts = e.target.elements[1].value.split(', ');
    try {
      await splitPayment.methods
        .transfer(to, amounts)
        .send({ from: accounts[0] });
      getBalance();
      $transferResult.innerHTML = `Successfully transfered!!!`;
    } catch (error) {
      console.log(error);
      $transferResult.innerHTML = `Opps... Something went worng... See console for more info!!!`;
    }
  });
};

document.addEventListener('DOMContentLoaded', async () => {
  const web3 = await getWeb3();
  const splitPayment = await getContract(web3);
  initApp(web3, splitPayment);
});
