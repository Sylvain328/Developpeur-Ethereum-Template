// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.12;

contract Time {

    /**
    Fonction qui retourne l'horodatage du bloc actuel
    */
    function getTime() public view returns (uint) {
        return block.timestamp;
    }
}