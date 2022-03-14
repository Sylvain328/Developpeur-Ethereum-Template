// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.12;

contract Choice {
    // Définition d'un mapping address=>uint destiné à stocker des choix
    mapping(address => uint) choices;

    /**
    Fonction permettant à un utilisateur de stocker son choix (un uint)
     */
    function add(uint _myUint) public {
        choices[msg.sender] = _myUint;
    }
}