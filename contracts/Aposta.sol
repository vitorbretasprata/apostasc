pragma solidity ^0.4.24;

contract Aposta{

    struct Time{
        uint ID;
        string nome;
        uint quantiaApostada;
    }  

    event apostaEvent (
        uint indexed _TimeID
    ); 

    mapping(uint => Time) public Times;

    mapping(address => bool) public apostadores;

    uint public numeroTime;

    function adicionarTime(string _nome) private {
        numeroTime++;
        Times[numeroTime] = Time(numeroTime, _nome, 0);
    }

    function apostar(uint ID, uint quantia) public {

        require(!apostadores[msg.sender]);        

        require(quantia > 0);

        require(ID >= 0 && ID <= numeroTime);

        apostadores[msg.sender] = true;

        Times[ID].quantiaApostada += quantia;

        emit apostaEvent(ID);
    }  

    constructor() public{
        adicionarTime('Time A');
        adicionarTime('Time B');
    }  
}