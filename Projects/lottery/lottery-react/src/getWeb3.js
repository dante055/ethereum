import Web3 from 'web3';

const web3 = new Web3(window.ethereum);

const enableWb3 = async () => {
  if (window.ethereum) {
    await window.ethereum.enable();
  }
};
enableWb3();

// const getWeb3 = () =>
//   new Promise((resolve, reject) => {
//     window.addEventListener('load', async () => {
//       // Modern dapp browser...
//       if (window.ethereum) {
//         const web3 = new Web3(window.ethereum);
//         try {
//           // Request account access if needed
//           await window.ethereum.enable();
//           // Account are now exposed
//           resolve(web3);
//         } catch (error) {
//           reject(error);
//         }
//       }
//       // Legacy dapp browser...
//       else if (window.web3) {
//         // use Mist/MetaMask provider
//         const web3 = new Web3(window.web3.currentProvider);
//         // const web3 = window.web3;
//         console.log('Injected web3 detected');
//         // Accounts are now exposed
//         resolve(web3);
//       } else {
//         console.log(
//           'Non-Ethereum browser detected. You should consider trying MetaMask!'
//         );
//       }
//     });
//   });

export { web3, enableWb3 };
// export default getWeb3;
