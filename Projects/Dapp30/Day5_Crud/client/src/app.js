import { getWeb3, getContract } from './utils.js';

const initApp = async (web3, crud) => {
  const $create = document.getElementById('create');
  const $createResult = document.getElementById('create-result');

  const $read = document.getElementById('read');
  const $readResult = document.getElementById('read-result');

  const $readAll = document.getElementById('read-all');
  const $readAllResult = document.getElementById('read-all-result');

  const $update = document.getElementById('update');
  const $updateResult = document.getElementById('update-result');

  const $delete = document.getElementById('delete');
  const $deleteResult = document.getElementById('delete-result');

  const accounts = await web3.eth.getAccounts();

  $create.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = e.target.elements[0].value;
    try {
      await crud.methods.create(name).send({ from: accounts[0] });
      $createResult.innerHTML = `New user <b>${name}</b> was successfully created!`;
    } catch (error) {
      console.log(error);
      $createResult.innerHTML = `Opps... there was a error while creating the user... See console for more info!`;
    }
  });

  $read.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = e.target.elements[0].value;
    try {
      const user = await crud.methods.read(id).call();
      console.log(user);
      $readResult.innerHTML = `Id : ${user.id} <br> Name : ${user.name} `;
    } catch (error) {
      console.log(error);
      $readResult.innerHTML = `Opps... there was a error while creating the user... See console for more info!`;
    }
  });

  $readAll.addEventListener('submit', async (e) => {
    e.preventDefault();
    $readAllResult.innerHTML = '';
    try {
      const users = await crud.methods.getAllUsers().call();
      let count = 0,
        lenght = 0;
      users.map((user) => {
        lenght++;
        if (Number(user.id) !== 0)
          $readAllResult.innerHTML += `Id : ${user.id}  Name : ${user.name} <br>`;
        else count++;
      });
      if (count === lenght || lenght === 0)
        $readAllResult.innerHTML = `Currently there are no users present!`;
    } catch (error) {
      console.log(error);
      $readAllResult.innerHTML = `Opps... there was a error while creating the user... See console for more info!`;
    }
  });

  $update.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = e.target.elements[0].value;
    const name = e.target.elements[1].value;
    try {
      await crud.methods.update(id, name).send({ from: accounts[0] });
      $updateResult.innerHTML = `User with id <b>${id}</b> was successfully updated!`;
    } catch (error) {
      console.log(error);
      $updateResult.innerHTML = `Opps... there was a error while creating the user... See console for more info!`;
    }
  });

  $delete.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = e.target.elements[0].value;
    try {
      await crud.methods.destroy(id).send({ from: accounts[0] });
      $deleteResult.innerHTML = `User with <b>${id}</b> was successfully deleted!`;
    } catch (error) {
      console.log(error);
      $deleteResult.innerHTML = `Opps... there was a error while creating the user... See console for more info!`;
    }
  });
};

document.addEventListener('DOMContentLoaded', async () => {
  const web3 = await getWeb3();
  const crud = await getContract(web3);
  await initApp(web3, crud);
});
