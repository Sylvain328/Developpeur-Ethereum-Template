// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.12;

contract Mapping {

    // Mapping Nom Article => Item
    mapping(string => Item) items;

    // Structure d'Item
    struct Item {
        uint price;
        uint units;
    }

    /**
    * Méthode d'ajout d'un item dans le mapping
    */
    function addItem(string memory _name, uint _price, uint _units) external {
        items[_name] = Item(_price, _units);
    }

    /**
    * Méthode d'obtention d'un item dans le mapping
    */
    function getItem(string memory _name) external view returns(uint, uint){
        return (items[_name].price, items[_name].units);
    }

    /**
    * Méthode de modification d'un item dans le mapping
    */
    function setItem(string memory _name, uint _price, uint _unit) external {
        items[_name].price = _price;
        items[_name].units = _unit;
    }
}