const path = require('path');

module.exports = {
  contracts_build_directory: path.join(__dirname, 'client/src/contracts'),

  networks: {
    develop_ganche_cli: {
      port: 8545,
      network_id: '*',
      host: '127.0.0.1',
    },
    develop_ganche_gui: {
      port: 7545,
      network_id: '*',
      host: '127.0.0.1',
    },
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: '0.6.0',
    },
  },
};
