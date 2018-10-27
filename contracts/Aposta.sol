pragma solidity ^0.4.24;

import './Oracolo.sol';

contract Aposta{

    struct Time{
        uint ID;
        string nome;
        uint quantiaApostada;        
    }  

    event apostaEvent (
        uint indexed _TimeID
    ); 

    Oracolo c = new Oracolo();

    mapping(uint => Time) public Times;

    mapping(address => bool) public apostadores;

    uint public numeroTime;

    function adicionarTime(string _nome) private {
        numeroTime++;
        Times[numeroTime] = Time(numeroTime, _nome, 0);
    }

    function apostar(uint ID, uint quantia) payable {
        require(!apostadores[msg.sender]);  
        require(msg.value > 0.001 ether);
        require(ID >= 0 && ID <= numeroTime);        

        c.armazenarBalanco(msg.value);
        apostadores[msg.sender] = true;
        Times[ID].quantiaApostada += msg.value;

        emit apostaEvent(ID);
    }  

    function TimeVencedor(uint timeID) public returns(string nomeDoTime) {
        uint ID = c.anunciarTimeVencedor();

    }

    constructor() public {
        adicionarTime('Time A');
        adicionarTime('Time B');
    }  
}