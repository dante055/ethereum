import Web3 from 'web3';
import MultiSigFactory from '../contracts/Factory2.json';

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
        const web3 = new Web3(window.web3.currentProbider);
        resolve(web3);
      } else {
        const provider = new Web3.providers.HttpProvider(
          "'http://localhost:9545'"
        );
        const web3 = new Web3(provider);
        resolve(web3);
      }
    });
  });
};

const getFactory = async (web3) => {
  const networkId = await web3.eth.net.getId();
  return new web3.eth.Contract(
    MultiSigFactory.abi,
    MultiSigFactory.networks && MultiSigFactory.networks[networkId].address
  );
};

export { getWeb3, getFactory };
