const Events = artifacts.require("Events");

module.exports = function (deployer) {
  deployer.deploy(Events);
};
