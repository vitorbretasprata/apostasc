pragma solidity ^0.4.24;

contract Aposta{

    struct Time{
        uint8 ID;
        string nome;
        uint quantiaApostada;    
        bool escolhido;        
    }  

    event apostaEvent (
        uint8 indexed _TimeID        
    ); 

    Oracolo oracolo = new Oracolo();

    function () external payable { }

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
    
    function apostar(uint8 ID) public payable {
        
        require(!apostadores[msg.sender]);  
        require(msg.value > 0.001 ether && msg.value <= 50 ether);
        require(ID <= numeroTime);
        require(numeroDeApostadores <= 2);
        require(!Times[ID].escolhido);

        balanco = address(this).balance;
        //address(oracolo).transfer(msg.value);
        oracolo.armazenarBalanco(msg.sender, ID);

        Times[ID].escolhido = true;
        quantia = msg.value;
        apostadores[msg.sender] = true;
        Times[ID].quantiaApostada += quantia;        
        numeroDeApostadores++;

        emit apostaEvent(ID);
    }    

    constructor() public {
        adicionarTime('Time 1');
        adicionarTime('Time 2');
    }  
}

contract Oracolo{

    struct Time {
        uint8 ID;
        address apostador;
    }   

    constructor() public {
        adicionarTime(1);
        adicionarTime(2);
    } 

    function adicionarTime(uint8 ID) private {        
        Times[ID] = Time(ID, msg.sender);
    } 

    mapping(uint => Time) public Times;

    uint public valorArmazenado;
    uint8 public timeVencedor;

    function armazenarBalanco(address apostador, uint8 idTime) public returns (uint){
        Times[idTime].ID = idTime;
        Times[idTime].apostador = apostador;

        valorArmazenado = address(this).balance;   
        return valorArmazenado;     
    }

    function anunciarTimeVencedor() public returns (uint){
        uint timeVencedor = random();
        timeVencedor++;

        address enderecoVencedor = Times[timeVencedor].apostador;

        //address(enderecoVencedor).transfer(valorArmazenado);
        return timeVencedor;
    }

    function random() private view returns (uint){
        return now % 2;
    }
}