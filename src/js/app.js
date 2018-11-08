App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    Apostou: false,

    init: () => {
        return App.initWeb3();
    },

    initWeb3: () => {
        if(typeof web3 !== 'undefined'){
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
        }else{
            App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
            web3 = new Web3(App.web3Provider);
        }
        return App.initContract();
    },

    initContract: () => {        
        $.getJSON("Aposta.json", (aposta) => {         
            App.contracts.Aposta = TruffleContract(aposta);
            App.contracts.Aposta.setProvider(App.web3Provider); 
            console.log("Success in getting Aposta!");
            App.listenForEvents(); 
            App.render();
        });        
    },

    listenForEvents: () => {
        App.contracts.Aposta.deployed().then((i) => {
            i.apostaEvent({}, {
                fromBlock: 0,
                toBlock: 'latest'
            }).watch((error, event) => {
                console.log("Evento acionado em aposta", event);  
                App.render();             
            });
        });
    },

    render: () => {
        var apostaInstance;
        var loader = $("#loader");
        var content = $("#content");
        var anunciar = $("#anunciar");

        loader.show();
        content.hide();
        anunciar.hide();

        web3.eth.getCoinbase((err, account) => {
            if(err == null){
                App.account = account;                
                $("#accountAddress").html("Sua conta:" + account);
            }
        });        
        App.contracts.Aposta.deployed().then((i) => {                       
            apostaInstance = i;                                
            return apostaInstance.numeroTime();            
        }).then((numeroTime) => {                      
            var TimesResult = $("#timeResult");
            TimesResult.empty();
            var alternativeSelect = $("#timeSelect");
            alternativeSelect.empty();            
            for(var i = 1; i <= numeroTime; i++){
                apostaInstance.Times(i).then((time) => {                    
                    var id = time[0];
                    var nome = time[1];
                    var quantia = time[2];
                    var timeTemplate = "<tr><th>" + id + "</th><td>" + nome + "</td><td>" + web3.fromWei(quantia, 'ether') + "</td></tr>";

                    TimesResult.append(timeTemplate);

                    var timeOpt = `<option value='${id}'> ${nome} </option>`
                    alternativeSelect.append(timeOpt);
                });
            }          
            return apostaInstance;
        }).catch((err) => {
            console.log(err);
        }).then((instancia) => {             
            instancia.numeroDeApostadores().then((numeroApostadores) => {                
                if(numeroApostadores == 2){                
                    $('form').hide();
                    loader.hide();
                    anunciar.show();
                    content.show();
                }
            });                 
            return instancia.apostadores(App.account);
        }).catch((error) => {
            console.warn(error);
        }).then((jaApostou) => {
            if(jaApostou){
                $('form').hide();
            }
            loader.hide();
            content.show();
        })        
    },

    Apostar: () => {
        var timeID = $('#timeSelect').val();
        var quantia = parseInt($('#quantiaSelect').val());        
        App.contracts.Aposta.deployed().then((instance) => {            
        instance.apostar(timeID, { from: App.account, value: web3.toWei(quantia, 'ether') });
        return instance.balanco();
        }).then((result) => {                      
            $("#content").hide();
            $("#loader").show();
            console.log("O balanço do contrato Aposta: " + result); 
        }).catch((err) => {
            console.error(err);
        });
    },

    Anunciar: () => {
        var vencedor = $('#vencedor');
        var loader = $('#carregador');        
        loader.show();
        vencedor.hide();  
        console.log(App.contracts); 
        App.contracts.Oracolo.deployed().then((i) => {
            oracoloInstance = i;
            return oracoloInstance.Times(1);
        }).then((time) => {
            var time = time[0];
            console.log("Balanco do contrato Aposta:" + time);            
        });

        App.contracts.Oracolo.deployed().then((instance) => {
            return instance.anunciarTimeVencedor();
        }).then(resultado => {
            console.log("Quantia armazenada no contrato: " + resultado);
            vencedor.html(`O time vencedor é o time ${resultado}`);
            loader.hide();
            vencedor.show();
        })
    }
};

$(() => {
    $(window).load(() => {
      App.init();
    });
  });
