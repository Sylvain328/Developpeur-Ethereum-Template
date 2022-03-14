// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.12;

contract Whitelist {
    // Déclaration d'une liste de struct Person
    struct Person {
        string name;
        uint age;
    }

    // Déclaration d'une liste de struct Person
    Person[] public persons;
}