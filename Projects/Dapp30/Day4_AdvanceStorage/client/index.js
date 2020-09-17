import Web3 from 'web3';
import AdvancedStorage from './../build/contracts/AdvanceStorage.json';

let web3;
let advancedStorage;

const initWeb3 = () => {
  return new Promise((resolve, reject) => {
    window.addEventListener('load', async () => {
      // modern dapp browser
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          await window.ethereum.enable();
          resolve(web3);
        } catch (error) {
          reject(error);
        }
      }
      // legacy dapp browser
      else if (window.web3) {
        const web3 = window.web3();
        resolve(web3);
      }
      // fallback to localhost
      else {
        const provider = new Web3.providers.HttpProvider(
          'http://localhost:9545'
        );
        const web3 = new Web3(provider);
        resolve(web3);
      }
    });
  });
};

const initContract = () => {
  const deploymentKey = Object.keys(AdvancedStorage.networks)[0];
  return new web3.eth.Contract(
    AdvancedStorage.abi,
    AdvancedStorage.networks[deploymentKey].address
  );
};

const initApp = async () => {
  const $addId = document.getElementById('addData');
  const $data = document.getElementById('data');
  const accounts = await web3.eth.getAccounts();

  const getALlIds = async () => {
    const idsArray = await advancedStorage.methods.getAllIds().call();
    $data.innerHTML = idsArray.join(', ');
  };
  getALlIds();

  $addId.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = e.target.elements[0].value;
    await advancedStorage.methods.addId(data).send({ from: accounts[0] });
    getALlIds();
  });
};

/*
const initApp = () => {
  const $addData = document.getElementById('addData');
  const $data = document.getElementById('data');
  let accounts = [];

  web3.eth
    .getAccounts()
    .then((_accounts) => {
      accounts = _accounts;
      return advancedStorage.methods.getAllIds().call();
    })
    .then((result) => {
      $data.innerHTML = result.join(', ');
    });

  $addData.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = e.target.elements[0].value;
    advancedStorage.methods
      .addId(data)
      .send({ from: accounts[0] })
      .then((result) => {
        return advancedStorage.methods.getAllIds().call();
      })
      .then((result) => {
        $data.innerHTML = result.join(', ');
      });
  });
};
*/

document.addEventListener('DOMContentLoaded', async () => {
  web3 = await initWeb3();
  console.log(web3);
  advancedStorage = initContract();
  initApp();
});
