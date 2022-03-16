// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.12;

contract Mapping {

    // Structure d'Item
    struct Item {
        string name;
        uint price;
        uint units;
    }

    // Tableau d'articles
    Item[] items;

    /**
    * Méthode d'ajout d'un item dans l'array
    */
    function addItem(string memory _name, uint _price, uint _units) external {
        items.push(Item(_name, _price, _units));
    }

    /**
    * Méthode d'obtention d'un item dans l'array
    */
    function getItem(uint _id) public view returns(string memory, uint, uint){
        return (items[_id].name, items[_id].price, items[_id].units);
    }

    /**
    * Méthode de suppression du dernier item
    */
    function deleteLastItem() external {
        items.pop();
    }

    /**
    * Méthode de suppression de tous les items
    */
    function deleteAllItem() external {
        delete(items);
    }

    /**
    * Méthode permettant de compter tous les items
    */
    function totalItems() external view returns(uint) {
        return items.length;
    }

    /**
    * Méthode de modification d'un item dans l'array
    */
    function setItem(uint _id, string memory _name, uint _price, uint _unit) external {
        items[_id].name = _name;
        items[_id].price = _price;
        items[_id].units = _unit;
    }
}