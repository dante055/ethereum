const Web3 = require('web3');
const { abi, networks } = require('./../build/contracts/SimpleStorage.json');

const web3 = new Web3('http://localhost:9545');
const simpleStorage = new web3.eth.Contract(abi, networks['5777'].address);

document.addEventListener('DOMContentLoaded', async () => {
  const $setData = document.getElementById('setData');
  const $data = document.getElementById('data');

  let accounts = await web3.eth.getAccounts();

  const getData = async () => {
    $data.innerHTML = await simpleStorage.methods.getData().call();
  };
  getData();

  $setData.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = e.target.elements[0].value;
    console.log(data);
    await simpleStorage.methods.setData(data).send({ from: accounts[0] });
    getData();
  });

  /*
    document.addEventListener('DOMContentLoaded', () => {
    const $setData = document.getElementById('setData');
    const $data = document.getElementById('data');
    let accounts = [];

    web3.eth.getAccounts()
    .then(_accounts => {
      accounts = _accounts;
    });

    const getData = () => {
      simpleStorage.methods
        .get()
        .call()
        .then(result => {
          $data.innerHTML = result;
        })
    };
    getData();

    $setData.addEventListener('submit', e => {
      e.preventDefault();
      const data = e.target.elements[0].value;
      simpleStorage.methods
        .set(data)
        .send({from: accounts[0]})
        .then(getData);
    });
  */
});
