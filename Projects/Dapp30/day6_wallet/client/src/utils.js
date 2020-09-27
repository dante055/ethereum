import Web3 from 'web3';
import Wallet from './contracts/Wallet.json';

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
          'http://localhost:9545'
        );
        const web3 = new Web3(provider);
        resolve(web3);
      }
    });
  });
};

const getContract = async (web3) => {
  const deploymnetId = await web3.eth.net.getId();
  return new web3.eth.Contract(
    Wallet.abi,
    Wallet.networks[deploymnetId].address
  );
};

export { getWeb3, getContract };
