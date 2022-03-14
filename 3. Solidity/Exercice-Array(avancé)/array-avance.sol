// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.12;

contract Whitelist {
    // Structure Person
    struct Person {
        string name;
        uint age;
    }

    // Déclaration d'une liste de struct Person
    Person[] public persons;

    /**
    Fonction d'ajout d'une personne dans la liste persons
    */
    function add(string memory _name, uint _age) public {
        Person memory person =Person(_name, _age);

        persons.push(person);
    }

    /**
    Fonction qui supprime le dernier élément de la liste persons
     */
    function remove() public {
        persons.pop();
    }
}