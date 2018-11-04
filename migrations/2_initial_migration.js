var Aposta = artifacts.require("./Aposta.sol");

module.exports = function(deployer) {
  deployer.deploy(Aposta);  
};
