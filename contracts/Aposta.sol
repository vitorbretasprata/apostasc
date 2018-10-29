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

    //Oracolo c = new Oracolo();

    function () external payable { }
    mapping(uint => Time) public Times;

    mapping(address => bool) public apostadores;

    uint public numeroTime;
    uint public numeroDeApostadores = 0;

    function adicionarTime(string _nome) private {
        numeroTime++;
        Times[numeroTime] = Time(numeroTime, _nome, 0);
    }
    
    function apostar(uint ID) public payable {
        
        require(!apostadores[msg.sender]);  
        require(msg.value > 0.001 ether && msg.value <= 50 ether);
        require(ID >= 0 && ID <= numeroTime);
        require(numeroDeApostadores <= 2);

        uint quantia = msg.value;
        apostadores[msg.sender] = true;
        Times[ID].quantiaApostada += quantia;
        numeroDeApostadores++;

        emit apostaEvent(ID);
    }    

    constructor() public {
        adicionarTime('Time A');
        adicionarTime('Time B');
    }  
}