pragma solidity ^0.4.24;

contract Aposta{

    struct Alternativa{
        uint ID;
        string nome;
        uint quantiaApostada;
    }  

    event apostaEvent (
        uint indexed _alternativaID
    ); 

    mapping(uint => Alternativa) public alternativas;

    mapping(address => bool) public apostadores;

    uint public numeroAlternativa;

    function adicionarAlternativa(string _nome) private {
        numeroAlternativa++;
        alternativas[numeroAlternativa] = Alternativa(numeroAlternativa, _nome, 0);
    }

    function apostar(uint ID, uint quantia) public {

        require(!apostadores[msg.sender]);        

        require(quantia > 0);

        require(ID >= 0 && ID <= numeroAlternativa);

        apostadores[msg.sender] = true;

        alternativas[ID].quantiaApostada += quantia;

        emit apostaEvent(ID);
    }  

    constructor() public{
        adicionarAlternativa('Time A');
        adicionarAlternativa('Time B');
    }  
}