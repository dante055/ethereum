import Web3 from 'web3';
import AdvanceStorage from './../../build/contracts/AdvanceStorage.json';

const getWeb3 = () => {
  return new Promise((resolve, reject) => {
    window.addEventListener('load', async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          await window.ethereum.enable();
          resolve(web3);
        } catch (error) {
          reject(error);
        }
      } else if (window.web3) {
        const web3 = new Web3(window.web3.currentProvider);
        resolve(web3);
      } else {
        const provider = new Web3.providers.HttpProvider(
          'http://127.0.0.1:9545'
        );
        const web3 = new Web3(provider);
        resolve(web3);
      }
    });
  });
};

const getContract = (web3) => {
  const developmentId = Object.keys(AdvanceStorage.networks)[0];
  const advanceStorage = new web3.eth.Contract(
    AdvanceStorage.abi,
    AdvanceStorage.networks[developmentId].address
  );
  return advanceStorage;
};

export { getWeb3, getContract };
