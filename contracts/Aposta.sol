pragma solidity ^0.4.24;

contract Aposta{
    
    Oracolo private _instance;
    
    constructor() public {
        _instance = new Oracolo();
        adicionarTime('Time 1');
        adicionarTime('Time 2');
    } 

    struct Time{
        uint8 ID;
        string nome;
        uint quantiaApostada;    
        bool escolhido;        
    }  

    event apostaEvent (
        uint indexed _TimeID        
    ); 

    function () external payable {  }
    
    function getBalance() public view returns(uint){
        return address(this).balance; 
    }
    
    function getBalanceInstance() public view returns(uint){
        return _instance.getBalance();
    }

    mapping(uint => Time) public Times;
    mapping(address => bool) public apostadores;

    uint8 public numeroTime;
    uint8 public numeroDeApostadores = 0;   
    uint private quantia; 
    uint public balanco;

    function adicionarTime(string _nome) private {
        numeroTime++;
        Times[numeroTime] = Time(numeroTime, _nome, 0, false);
    }    
    
    function apostar(uint ID) public payable {
        
        require(!apostadores[msg.sender]);  
        require(msg.value > 0.001 ether && msg.value <= 50 ether);
        require(ID <= numeroTime);
        require(numeroDeApostadores <= 2);
        require(!Times[ID].escolhido);
        
        address(_instance).transfer(msg.value);
        _instance.armazenarBalanco(msg.sender, ID);

        Times[ID].escolhido = true;
        quantia = msg.value;
        apostadores[msg.sender] = true;
        Times[ID].quantiaApostada += quantia;        
        numeroDeApostadores++;

        emit apostaEvent(ID);
    }  
    
    function getWinner() public returns (uint){
        return _instance.announceWinner();
    }
}

contract Oracolo{

    struct Time {
        uint ID;
        address apostador;
    }   

    constructor() public {
        adicionarTime(1);
        adicionarTime(2);
    } 

    function () public payable { }

    function adicionarTime(uint ID) private {        
        Times[ID] = Time(ID, msg.sender);
    } 
    
    function getBalance() public view returns(uint){
        return address(this).balance;
    }

    mapping(uint => Time) public Times;

    uint public valorArmazenado;
    uint public timeVencedor;

    
    function armazenarBalanco(address apostador, uint idTime) public {
        Times[idTime].ID = idTime;
        Times[idTime].apostador = apostador;
    }
    

    function announceWinner() public returns (uint){
        timeVencedor = random();
        timeVencedor++;
        
        address enderecoVencedor = Times[timeVencedor].apostador;
        address(enderecoVencedor).transfer(valorArmazenado);
        
        return timeVencedor;
    }

    function random() private view returns (uint){
        return now % 2;
    }
}