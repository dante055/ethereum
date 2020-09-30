import DeedMultiPayouts from './contracts/DeedMultiPayouts.json';

const getDeed = (address, web3) => {
  return new web3.eth.Contract(DeedMultiPayouts.abi, address);
};

export { getDeed };
