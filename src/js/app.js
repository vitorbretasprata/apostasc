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
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
            web3 = new Web3(App.web3Provider);
        }
        return App.initContract();
    },

    initContract: () => {
        $.getJSON("Aposta.json", (aposta) => {         
            App.contracts.Aposta = TruffleContract(aposta);
            App.contracts.Aposta.setProvider(App.web3Provider);
            App.listenForEvents();
            return App.render();
        });
    },

    listenForEvents: () => {
        App.contracts.Aposta.deployed().then((i) => {
            i.apostaEvent({}, {
                fromBlock: 0,
                toBlock: 'latest'
            }).watch((error, event) => {
                console.log("Evento acionado", event)
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
            console.log({err});
        }).then((instancia) => {             
            instancia.numeroDeApostadores().then((numeroApostadores) => {
                console.log(numeroApostadores); 
                if(numeroApostadores == 2){                
                    $('form').hide();
                    loader.hide();
                    anunciar.show();
                    content.show();
                }
            });                 
            return instancia.apostadores(App.account);
        }).catch((error) => {
            console.warn("Promisse" + {error});
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
            return instance.apostar(timeID, { from: App.account, value: web3.toWei(quantia, 'ether') });
        }).then((result) => {
            $("#content").hide();
            $("#loader").show();
        }).catch((err) => {
            console.error(err);
        });
    },

    Anunciar: () => {
        var resultados = $('#resuldatos');
        resultados.empty();       
        App.contracts.Aposta.deployed().then((instance) => {
            return instance.anunciarTimeVencedor();
        }).then(resultados => {
            var resultadosTemplate = `O time vencedor é o time ${resultados}`;

            resultados.append(resultadosTemplate);
        })
    }
};

$(() => {
    $(window).load(() => {
      App.init();
    });
  });

  /*
  best sense neglect immense fall lady
   adapt material output fiction file clap
  */