var Oracolo = artifacts.require("./Aposta.sol");

module.exports = function(deployer) {
  deployer.deploy(Oracolo);  
};
