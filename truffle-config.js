const HDWalletProvider = require('@truffle/hdwallet-provider');
const dotenv = require('dotenv');
dotenv.config();
const privateKey = process.env.PRIVATE_KEY;
const infuraUrl = process.env.INFURA_URL;

module.exports = {
  networks: {
    // development: {
    //   host: "127.0.0.1",     // Localhost (default: none)
    //   port: 8545,            // Standard Ethereum port (default: none)
    //   network_id: "*",       // Any network (default: none)
    // },
    ropsten: {
      provider: () => new HDWalletProvider({ privateKeys: [privateKey], providerOrUrl: infuraUrl }),
      network_id: 3,       // Ropsten's id
      gas: 5500000,        // Ropsten has a lower block limit than mainnet
      confirmations: 2,    // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    },
  },
  compilers: {
    solc: {
      version: "0.8.9",    // Fetch exact version from solc-bin (default: truffle's version)
    }
  },
};
