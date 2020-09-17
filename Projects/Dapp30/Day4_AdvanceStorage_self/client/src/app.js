import { getWeb3, getContract } from './utils.js';

const initApp = async (web3, advanceStorage) => {
  const accounts = await web3.eth.getAccounts();

  const $addId = document.getElementById('addId');

  const $getIndexValue = document.getElementById('getIndexValue');
  const $getId = document.getElementById('getId');
  const $showId = document.getElementById('showId');

  const $getAllIds = document.getElementById('getAllIds');
  const $showAllIds = document.getElementById('showAllIds');

  const $getLength = document.getElementById('getLength');
  const $showLength = document.getElementById('showLength');

  $addId.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = e.target.elements[0].value;
    await advanceStorage.methods.addId(id).send({ from: accounts[0] });
  });

  $getId.addEventListener('click', async () => {
    const index = $getIndexValue.value;
    $showId.value = await advanceStorage.methods.getId(index).call();
  });

  $getAllIds.addEventListener('click', async () => {
    const ids = await advanceStorage.methods.getAllIds().call();
    $showAllIds.value = ids.join(', ');
  });

  $getLength.addEventListener('click', async () => {
    $showLength.value = await advanceStorage.methods.getLength().call();
  });
};

document.addEventListener('DOMContentLoaded', async () => {
  const web3 = await getWeb3();
  const advanceStorage = await getContract(web3);
  initApp(web3, advanceStorage);
});
