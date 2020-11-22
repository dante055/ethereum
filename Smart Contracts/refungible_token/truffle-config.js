module.exports = {
  networks: {},

  // Configure your compilers
  compilers: {
    solc: {
      version: '0.7.4',
      settings: {
        optimizer: {
          enabled: false,
          runs: 200,
        },
      },
    },
  },
};
