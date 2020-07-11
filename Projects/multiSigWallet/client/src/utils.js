import Web3 from 'web3';
import MultiSigWallet from './contracts/MultiSigWallet.json';

// connect to the blockchain
const getWeb3 = () => {
  return new Promise((resolve, reject) => {
    (async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          // window.ethereum.enable().then(() => resolve(web3));
          await window.ethereum.enable();
          resolve(web3);
        } catch (error) {
          reject(error);
        }
      } else if (window.web3) {
        // Use Mist/MetaMask's provider.
        const web3 = window.web3;
        console.log('Injected web3 detected.');
        resolve(web3);
      } else {
        const provider = new Web3.providers.HttpProvider(
          'http://localhost:9545'
        );
        const web3 = new Web3(provider);
        console.log('No web3 instance injected, using Local web3.');
        resolve(web3);
      }
    })();

    // Wait for loading completion to avoid race conditions with web3 injection timing.
    // window.addEventListener('load', async () => {
    //   // Modern dapp browsers...
    //   if (window.ethereum) {
    //     const web3 = new Web3(window.ethereum);
    //     try {
    //       // Request account access if needed
    //       await window.ethereum.enable();
    //       // Acccounts now exposed
    //       resolve(web3);
    //     } catch (error) {
    //       reject(error);
    //     }
    //   }
    //   // Legacy dapp browsers...
    //   else if (window.web3) {
    //     // Use Mist/MetaMask's provider.
    //     const web3 = window.web3;
    //     console.log('Injected web3 detected.');
    //     resolve(web3);
    //   }
    //   // Fallback to localhost; use dev console port by default...
    //   else {
    //     const provider = new Web3.providers.HttpProvider(
    //       'http://localhost:9545'
    //     );
    //     const web3 = new Web3(provider);
    //     console.log('No web3 instance injected, using Local web3.');
    //     resolve(web3);
    //   }
    // });
  });
};

// create wallet instance
const getWallet = async (web3) => {
  const networkId = await web3.eth.net.getId();
  const contractDevelopment = MultiSigWallet.networks[networkId];
  return new web3.eth.Contract(
    MultiSigWallet.abi,
    contractDevelopment && contractDevelopment.address
  );
};

export { getWeb3, getWallet };
