pragma solidity ^0.4.24;

contract Oracolo{    

    function armazenarBalanco(uint balanco) public returns (uint valorArmazenado){
        valorArmazenado += balanco;        
    }

    function anunciarTimeVencedor() public returns (uint timeVencedor){
        timeVencedor = 1;
    }
}