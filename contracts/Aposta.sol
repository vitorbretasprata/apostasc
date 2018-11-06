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

        oracolo.armazenarBalanco(msg.value, msg.sender, Times[ID].ID);

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

    mapping(uint => Time) public Times;

    uint private valorArmazenado;
    uint8 private timeVencedor;

    function armazenarBalanco(uint quantia, address apostador, uint8 idTime) public returns (uint){
        Times[idTime].ID = idTime;
        Times[idTime].apostador = apostador;

        valorArmazenado += quantia;   
        return valorArmazenado;     
    }

    function anunciarTimeVencedor() public returns (uint){
        uint timeVencedor = random();
        timeVencedor++;

        address enderecoVencedor = Times[timeVencedor].apostador;

        enderecoVencedor.transfer(valorArmazenado);
        return timeVencedor;
    }

    function random() private view returns (uint){
        return now % 2;
    }
}