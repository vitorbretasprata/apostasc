App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    bet: false,

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
        $.getJSON("BetContract.json", (betContract) => {         
            App.contracts.BetContract = TruffleContract(betContract);
            App.contracts.BetContract.setProvider(App.web3Provider); 
            console.log("Success in getting Bet Contract!");
            App.listenForEvents(); 
            App.render();
        });        
    },

    listenForEvents: () => {
        App.contracts.BetContract.deployed().then((i) => {
            i.betEvent({}, {
                fromBlock: 0,
                toBlock: 'latest'
            }).watch((error, event) => {
                console.log("Evento fired in Bet Contract", event);  
                App.render();             
            });
        });
    },

    render: () => {
        var betInstance;
        var loader = $("#loader");
        var content = $("#content");
        var announce = $("#announce");

        loader.show();
        content.hide();
        announce.hide();

        web3.eth.getCoinbase((err, account) => {
            if(err == null){
                App.account = account;                
                $("#accountAddress").html(`Your account is: ${account}`);
            }
        });        
        App.contracts.BetContract.deployed().then((i) => {                       
            betInstance = i;                                
            return betInstance.teamNumber();            
        }).then((teamNumber) => {                      
            var TeamsResult = $("#teamResult");
            TeamsResult.empty();
            var teamSelect = $("#teamSelect");
            teamSelect.empty();            
            for(var i = 1; i <= teamNumber; i++){
                betInstance.Teams(i).then((team) => {                    
                    var id = team[0];
                    var name = team[1];
                    var amount = team[2];
                    var teamTemplate = `<tr>
                                            <th>
                                                ${id} 
                                            </th>
                                            <td>
                                                ${name}
                                            </td>
                                            <td>
                                                ${web3.fromWei(amount, 'ether')}
                                            </td>
                                        </tr>`;

                    TeamsResult.append(teamTemplate);

                    var teamOpt = `<option value='${id}'> ${name} </option>`
                    alternativeSelect.append(teamOpt);
                });
            }          
            return betInstance;
        }).catch((err) => {
            console.log(err);
        }).then((instance) => {             
            instance.numberOfBettors().then((numberOfBettors) => {                
                if(numberOfBettors == 2){                
                    $('form').hide();
                    loader.hide();
                    announce.show();
                    content.show();
                }
            });                 
            return instancia.bettors(App.account);
        }).catch((error) => {
            console.warn(error);
        }).then((alreadyBet) => {
            if(alreadyBet){
                $('form').hide();
            }
            loader.hide();
            content.show();
        })        
    },

    Bet: () => {
        var teamID = $('#teamSelect').val();
        var amount = parseInt($('#amountSelect').val());        
        App.contracts.BetContract.deployed().then((instance) => {            
        instance.Bet(teamID, { from: App.account, value: web3.toWei(amount, 'ether') });
        return instance.balance();
        }).then((result) => {                      
            $("#content").hide();
            $("#loader").show();
            console.log(`The balance of the Bet Contract is: ${result}`); 
        }).catch((err) => {
            console.error(err);
        });
    },

    Announce: () => {
        var winner = $('#winner');
        var loader = $('#loader2');        
        loader.show();
        winner.hide();  
        console.log(App.contracts); 
        App.contracts.BetContract.deployed().then((i) => {
            oracleInstance = i;
            return oracleInstance.getWinner();
        }).then((winner) => {            
            console.log(`The winner is the team ${winner}!!!`);            
        });        
    }
};

$(() => {
    $(window).load(() => {
      App.init();
    });
  });
