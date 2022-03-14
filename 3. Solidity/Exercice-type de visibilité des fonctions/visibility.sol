// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.12;

contract HelloWorld {

    string myString = "Hello World !";

    /**
    Fonction qui retourne la variable d'état myString
    Déclarer comme view car on ne modifie pas l'état 
    */
    function hello() public view returns (string memory) {
        return myString;
    }
}