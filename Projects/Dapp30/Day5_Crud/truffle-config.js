const fs = require('fs');
const path = require('path');
const HDWalletProvider = require('truffle-hdwallet-provider');

const secrets = JSON.parse(fs.readFileSync('.secret').toString().trim());

module.exports = {
  contracts_build_directory: path.join(__dirname, 'client/src/contracts'),

  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*', // Match any network id
    },
    ropsten: {
      provider: () =>
        new HDWalletProvider(
          secrets.mnemonic,
          `https://ropsten.infura.io/v3/${secrets.infuraKey}`
        ),
      network_id: 3,
    },
    rinkeby: {
      provider: () =>
        new HDWalletProvider(
          secrets.mnemonic,
          `https://rinkeby.infura.io/v3/${secrets.infuraKey}`
        ),
      network_id: 4,
    },
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: '0.6.0', // Fetch exact version from solc-bin (default: truffle's version)
    },
  },
};

// addrees rinkeby: 0x89EAaEE310A1e0c52103F1cbB304fdA7AB5e37f1
// hash rinkeby: 0xedce83172a8f039151c5f6070d24edfdb643e4780cc0b0a9dfa6b3285b6dbc45
