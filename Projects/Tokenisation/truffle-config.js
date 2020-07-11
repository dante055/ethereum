const path = require('path');
require('dotenv').config({ path: './.env' });
const HDwalletProvider = require('@truffle/hdwallet-provider');
const MetaMaskAccountindex = 0;

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, 'client/src/contracts'),
  networks: {
    // develop: {
    //   port: 8545,
    // },
    development: {
      port: 7545,
      network_id: '5777',
      host: '127.0.0.1',
    },
    ganache_local: {
      provider: function () {
        return new HDwalletProvider(
          process.env.MNEMONIC,
          'http://127.0.0.1:7545',
          MetaMaskAccountindex
        );
      },
      network_id: 5777,
    },
    ropsten_local: {
      provider: function () {
        return new HDwalletProvider(
          process.env.MNEMONIC,
          'https://ropsten.infura.io/v3/347cdaced52a4dab96e7ec406fb0ca15',
          MetaMaskAccountindex
        );
      },
      network_id: 3,
    },
    rinkeby_local: {
      provider: function () {
        return new HDwalletProvider(
          process.env.MNEMONIC,
          'https://rinkeby.infura.io/v3/347cdaced52a4dab96e7ec406fb0ca15',
          MetaMaskAccountindex
        );
      },
      network_id: 4,
    },
  },
  goerli_local: {
    provider: function () {
      return new HDwalletProvider(
        process.env.MNEMONIC,
        'https://goerli.infura.io/ws/v3/347cdaced52a4dab96e7ec406fb0ca15',
        MetaMaskAccountindex
      );
    },
    network_id: 5,
  },
  compilers: {
    solc: {
      version: '0.6.1',
    },
  },
};
