var Aposta = artifacts.require("./Aposta.sol");

contract("Aposta", function(accounts){
    var instanciaAposta;

    it("Iniciar os dois Times", function(){
        return Aposta.deployed().then(function(i){
            return i.numeroTime();
        }).then(function(numero){
            assert.equal(numero, 2);
        })
    });

    it("Inicializa os times com os valores corretos", function(){
        return Aposta.deployed().then(function(i){
            instanciaAposta = i;
            return instanciaAposta.Times(1);
        }).then(function(res){
            assert.equal(res[0], 1, "Contem o ID correto");
            assert.equal(res[1], 'Time 1', "Contem o nome correto");
            assert.equal(res[2], 0, "Contem a quantidade apostada correta");
            assert.equal(res[3], false, "Não houve aposta no time");
            return instanciaAposta.Times(2);
        }).then(function(res){
            assert.equal(res[0], 2, "Contem o ID correto");
            assert.equal(res[1], 'Time 2', "Contem o nome correto");
            assert.equal(res[2], 0, "Contem a quantidade apostada correta");
            assert.equal(res[3], false, "Não houve aposta no time");
        })            
    })

    it("Permite as apostas", function() {
        return Aposta.deployed().then(function(i) {
            instanciaAposta = i;
            timeId = 1;
            return instanciaAposta.apostar(timeId, { from: web3.eth.accounts[1], value: web3.toWei(2, 'ether')});
        }).then(function(transaction){
            assert.equal(transaction.logs.length, 1, "um evento foi acionado");
            assert.equal(transaction.logs[0].event, "apostaEvent", "o evento está correto");
            assert.equal(transaction.logs[0].args._TimeID.toNumber(), timeId, "o candidato está correto");
            return instanciaAposta.apostadores(web3.eth.accounts[1]);
        }).then(function(res){
            assert(res, "o apostador foi marcado como apostado");
            return instanciaAposta.Times(timeId);
        }).then(function(alt){
            assert.equal(alt[2], 2000000000000000000, "foi incrementada a quantia apostada no time");
        });
    });


    it("Gera uma exceção caso o time seja invalido", function(){
        return Aposta.deployed().then(function(i) {
            instanciaAposta = i;
            return instanciaAposta.apostar(11, { from: accounts[9], value: web3.toWei(2, 'ether')})
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >= 0, "A mensagem de error deve conter revert");
            return instanciaAposta.Times(1);
        }).then(function(time1){
            var quantiaApostas = time1[2];
            assert.equal(quantiaApostas, 2000000000000000000, "O time 1 não recebeu quantia");
            return instanciaAposta.Times(2);
        }).then(function(time2){
            var quantiaApostas = time2[2];
            assert.equal(quantiaApostas, 0, "O time 1 não recebeu quantia");
        })
    })

    it("Gera uma exceção caso o apostador apostar mais de uma vez", function(){
        return Aposta.deployed().then(function(i){
            instanciaAposta = i;
            timeID = 2;
            instanciaAposta.apostar(timeID, { from: web3.eth.accounts[8], value: web3.toWei(2, 'ether')});
            return instanciaAposta.Times(timeID);
        }).then(function(time){
            var quantia = time[2];
            assert.equal(quantia, 2000000000000000000, "Time 2 recebeu a aposta");
            return instanciaAposta.apostar(timeID, { from: web3.eth.accounts[8], value: web3.toWei(2, 'ether')});
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >= 0, "a mensagem de error deve conter revert");
            return instanciaAposta.Times(1);            
        }).then(function(time){
            var quantia = time[2];
            assert.equal(quantia, 2000000000000000000, "O time A não recebeu nenhuma aposta.");
            return instanciaAposta.Times(2);
        }).then(function(time){
            var quantia = time[2];
            assert.equal(quantia, 2000000000000000000, "O time B não recebeu nenhuma aposta.");
        })
    })

    it("Gerar exceção caso o valor apostador seja fora do limite imposto", () => {
        return Aposta.deployed().then(i => {
            instanciaAposta = i;            
            timeID = 1;
            return instanciaAposta.apostar(timeID, { from: web3.eth.accounts[5], value: web3.toWei(51, 'ether')});
        }).then(assert.fail).catch((error) => {
            assert(error.message.indexOf('revert') >= 0, error.message);            
            timeID = 2;
            return instanciaAposta.apostar(timeID, { from: web3.eth.accounts[4], value: web3.toWei(0.00000010, 'ether')});
        }).then(assert.fail).catch((error) => {
            assert(error.message.indexOf('revert') >= 0, error.message);
        })
    })

    it("Gerar exceçao caso os dois apostadores apostem no mesmo time", () => {
        return Aposta.deployed().then(i => {
            instanciaAposta = i;            
            timeID = 1;
            instanciaAposta.apostar(timeID, { from: web3.eth.accounts[2], value: web3.toWei(2, 'ether')});
            return instanciaAposta.Times(1);
        }).then((time) => {
            var escolhido = time[3];
            assert.equal(escolhido, true, escolhido);
            instanciaAposta.apostar(timeID, { from: web3.eth.accounts[3], value: web3.toWei(2, 'ether')});       
        }).then(assert.fail).catch((error) => {
            assert(error.message.indexOf('revert') >= 0, error.message);
        })
    })
});