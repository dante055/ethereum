module.exports = {
  networks: {},

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
