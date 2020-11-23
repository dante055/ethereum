module.exports = {
  networks: {},

  // Configure your compilers
  compilers: {
    solc: {
      version: '0.7.1',
      settings: {
        optimizer: {
          enabled: false,
          runs: 200,
        },
      },
    },
  },
};
