pragma solidity ^0.4.24;

contract BetContract{
    
    Oracle private _instance;
    
    constructor() public {
        _instance = new Oracle();
        addTeam('Team 1');
        addTeam('Team 2');
    } 

    struct Team{
        uint8 ID;
        string Name;
        uint amountWagered;    
        bool chosen;        
    }  

    event betEvent (
        uint indexed _TeamID        
    ); 

    function () external payable {  }
    
    function getBalance() public view returns(uint){
        return address(this).balance; 
    }
    
    function getBalanceInstance() public view returns(uint){
        return _instance.getBalance();
    }

    mapping(uint => Team) public Teams;
    mapping(address => bool) public bettors;

    uint8 public teamNumber;
    uint8 public numberOfBettors;   
    uint private Amount; 

    function addTeam(string _name) private {
        teamNumber++;
        Teams[teamNumber] = Team(teamNumber, _name, 0, false);
    }    
    
    function Bet(uint ID) public payable {
        
        require(!bettors[msg.sender]);  
        require(msg.value > 0.001 ether && msg.value <= 50 ether);
        require(ID <= teamNumber);
        require(numberOfBettors <= 2);
        require(!Teams[ID].chosen);
        
        Teams[ID].chosen = true;
        Amount = msg.value;
        bettors[msg.sender] = true;
        Teams[ID].amountWagered += Amount;        
        numberOfBettors++;
        
        address(_instance).transfer(Amount);
        _instance.storeBalance(msg.sender, ID, Amount);
        
        emit betEvent(ID);
    }  
    
    function getWinner() public returns (uint){
        return _instance.announceWinner();
    }
    
    function getTeamsInstance(uint8 _id) public view returns (address) {
        return _instance.getBettors(_id);
    }
}

contract Oracle{

    struct Team {
        uint ID;
        address punter;
    }   

    constructor() public {
        addTeam(1);
        addTeam(2);
    } 
    
    mapping(uint => Team) public Teams;

    function () public payable { }

    function addTeam(uint ID) private {        
        Teams[ID] = Team(ID, msg.sender);
    } 
    
    function getBalance() public view returns(uint){
        return address(this).balance;
    }
    
    uint public amountStored;
    uint public Winner;

    
    function storeBalance(address _punter, uint _idTime, uint _balance) payable public {
        Teams[_idTime].ID = _idTime;
        Teams[_idTime].punter = _punter;
        
        amountStored += _balance;
    }
    
    function getBettors(uint8 _id) public view returns (address){
        return Teams[_id].punter;
    }

    function announceWinner() public returns (uint){
        Winner = random();
        Winner++;
        
        address winnerAddress = Teams[Winner].punter;
        address(winnerAddress).transfer(amountStored);
        
        return Winner;
    }

    function random() private view returns (uint){
        return now % 2;
    }
}