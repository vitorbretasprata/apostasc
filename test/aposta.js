var Aposta = artifacts.require("./Aposta.sol");

contract("Aposta", function(accounts){
    var instanciaAposta;

    it("Iniciar as duas alternativas", function(){
        return Aposta.deployed().then(function(i){
            return i.numeroAlternativa();
        }).then(function(numero){
            assert.equal(numero, 2);
        })
    });

    it("Inicializa os times com os valores corretos", function(){
        return Aposta.deployed().then(function(i){
            instanciaAposta = i;
            return instanciaAposta.alternativas(1);
        }).then(function(res){
            assert.equal(res[0], 1, "Contem o ID correto");
            assert.equal(res[1], 'Time A', "Contem o nome correto");
            assert.equal(res[2], 0, "Contem a quantidade apostada correta");
            return instanciaAposta.alternativas(2);
        }).then(function(res){
            assert.equal(res[0], 2, "Contem o ID correto");
            assert.equal(res[1], 'Time B', "Contem o nome correto");
            assert.equal(res[2], 0, "Contem a quantidade apostada correta");
        })            
    })

    it("Permite as apostas", function() {
        return Aposta.deployed().then(function(i) {
            instanciaAposta = i;
            timeId = 1;
            return instanciaAposta.apostar(timeId, 20, { from: accounts[0] })
        }).then(function(transaction){
            assert.equal(transaction.logs.length, 1, "um evento foi acionado");
            assert.equal(transaction.logs[0].event, "apostaEvent", "o evento está correto");
            assert.equal(transaction.logs[0].args._alternativaID.toNumber(), timeId, "o candidato está correto");
            return instanciaAposta.apostadores(accounts[0]);
        }).then(function(res){
            assert(res, "o apostador foi marcado como apostado");
            return instanciaAposta.alternativas(timeId);
        }).then(function(alt){
            assert.equal(alt[2], 20, "foi incrementada a quantia apostada na alternativa");
        });
    });


    it("Gera uma exceção caso o time seja invalido", function(){
        return Aposta.deployed().then(function(i) {
            instanciaAposta = i;
            return instanciaAposta.apostar(11, 10, { from: accounts[1] })
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >= 0, "A mensagem de error deve conter revert");
            return instanciaAposta.alternativas(1);
        }).then(function(time1){
            var quantiaApostas = time1[2];
            assert.equal(quantiaApostas, 20, "O time 1 não recebeu quantia");
            return instanciaAposta.alternativas(2);
        }).then(function(time2){
            var quantiaApostas = time2[2];
            assert.equal(quantiaApostas, 0, "O time 1 não recebeu quantia");
        })
    })

    it("Gera uma exceção caso o apostador apostar mais de uma vez", function(){
        return Aposta.deployed().then(function(i){
            instanciaAposta = i;
            timeID = 2;
            instanciaAposta.apostar(timeID, 5, { from: accounts[3]});
            return instanciaAposta.alternativas(timeID);
        }).then(function(time){
            var quantia = time[2];
            assert.equal(quantia, 5, "Time B recebeu a aposta");
            return instanciaAposta.apostar(timeID, 5, { from: accounts[3]});
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >= 0, "a mensagem de error deve conter revert");
            return instanciaAposta.alternativas(1);            
        }).then(function(time){
            var quantia = time[2];
            assert.equal(quantia, 20, "O time A não recebeu nenhuma aposta.");
            return instanciaAposta.alternativas(2);
        }).then(function(time){
            var quantia = time[2];
            assert.equal(quantia, 5, "O time B não recebeu nenhuma aposta.");
        })
    })
});