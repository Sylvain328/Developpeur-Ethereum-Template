// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.12;

contract Whitelist {

    // Person Structure
    struct Person {
        string name;
        uint age;
    }

    /**
    * Fonction permettant l'ajout d'une personne
    */
    function addPerson(string memory _name, uint _age) public pure {
        Person memory person;
        person.name = _name;
        person.age = _age;
    }
}