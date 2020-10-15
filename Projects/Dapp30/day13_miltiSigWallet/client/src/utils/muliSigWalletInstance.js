import MultiSigWallet from '../contracts/MultiSigWallet2.json';

const getMultiSigWalletInstance = async (address, web3) => {
  return new web3.eth.Contract(MultiSigWallet.abi, address);
};

export { getMultiSigWalletInstance };
