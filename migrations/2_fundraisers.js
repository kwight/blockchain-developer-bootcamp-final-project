const Fundraisers = artifacts.require('Fundraisers');

module.exports = function (deployer) {
  deployer.deploy(Fundraisers);
};
