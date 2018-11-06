var Aposta = artifacts.require("Aposta");
var Oracolo = artifacts.require("Oracolo")

module.exports = function(deployer) {
  deployer.deploy(Aposta);  
  deployer.deploy(Oracolo);
};
