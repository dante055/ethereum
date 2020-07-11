import Web3 from 'web3';
import ToDoList from './contracts/ToDoList.json';

// connect to the blockchain
const getWeb3 = () => {
  return new Promise((resolve, reject) => {
    // window.addEventListener('load', async () => {
    (async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
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
    // });
  });
};

// create toDoList instance
const getToDoList = async (web3) => {
  const networkId = await web3.eth.net.getId();
  const contractDevelopment = ToDoList.networks[networkId];
  return new web3.eth.Contract(
    ToDoList.abi,
    contractDevelopment && contractDevelopment.address
  );
};

// format Date
function formatDate(UNIX_timestamp) {
  if (!UNIX_timestamp) {
    return '';
  }
  var timestamp = new Date(UNIX_timestamp * 1000);
  var months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  var year = timestamp.getFullYear();
  var month = months[timestamp.getMonth()];
  var date = timestamp.getDate();
  var hour = timestamp.getHours();
  var min = timestamp.getMinutes();
  var sec = timestamp.getSeconds();
  var time =
    date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
  return time;
}

export { getWeb3, getToDoList, formatDate };
