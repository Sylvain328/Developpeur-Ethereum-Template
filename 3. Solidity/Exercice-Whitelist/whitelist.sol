// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.12;

contract Whitelist {
    // Définition d'un mapping address => bool
    mapping(address => bool) whitelist;

    // Définition d'un event 
    event Authorized(address _address);

    /**
    Fonction permettant l'ajout d'une adresse autorisée dans la liste blanche
    */
    function authorize(address _address) public {
        // Ajout dans le mapping de la liste blanche
        whitelist[_address] = true;

        // Déclenchement de l'event Authorized
        emit Authorized(_address);
    }
}