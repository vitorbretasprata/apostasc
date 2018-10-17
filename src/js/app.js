App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    Apostou: false,

    init: function(){
        return App.initWeb3();
    },

    initWeb3: function(){

        if(typeof web3 !== 'undefined'){

            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
        }else{

            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
            web3 = new Web3(App.web3Provider);
        }
        return App.initContract();
    },

    initContract: function(){
        $.getJSON("Aposta.json", function(aposta){            

            App.contracts.Aposta = TruffleContract(aposta);

            App.contracts.Aposta.setProvider(App.web3Provider);
            //App.listenForEvents();

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

        loader.show();
        content.hide();

        web3.eth.getCoinbase((err, account) => {
            if(err == null){
                App.account = account;                
                $("#accountAddress").html("Sua conta:" + account);
            }
        });
        
        App.contracts.Aposta.deployed().then((i) => {            
            apostaInstance = i;                                
            return apostaInstance.numeroAlternativa();            
        }).then((numeroAlternativa) => {            
            var alternativasResult = $("#timeResult");
            alternativasResult.empty();
            var alternativeSelect = $("#timeSelect");
            alternativeSelect.empty();            
            for(var i = 1; i <= numeroAlternativa; i++){
                apostaInstance.alternativas(i).then((time) => {                    
                    var id = time[0];
                    var nome = time[1];
                    var quantia = time[2];
                    var timeTemplate = "<tr><th>" + id + "</th><td>" + nome + "</td><td>" + quantia + "</td></tr>";

                    alternativasResult.append(timeTemplate);

                    var timeOpt = `<option value='${id}'> ${nome} </option>`
                    alternativeSelect.append(timeOpt);
                });
            }  
            return apostaInstance.apostadores(App.account);
        }).catch((err) => {
            console.log({err});

        }).then((jaApostou) => {
            if(jaApostou){
                $('form').hide();
            }
            loader.hide();
            content.show();
        }).catch((error) => {
            console.warn({error});
        });        
    },

    Apostar: () => {
        var timeID = $('#timeSelect').val();
        var quantia = $('#quantiaSelect').val();
        App.contracts.Aposta.deployed().then((instance) => {
            return instance.apostar(timeID, quantia, { from: App.account });
        }).then((result) => {
            $("#content").hide();
            $("#loader").show();
        }).catch((err) => {
            console.error(err);
        });
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