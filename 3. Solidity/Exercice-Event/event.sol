// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.12;

contract Whitelist {
    // Définition d'un mapping address => bool
    mapping(address => bool) whitelist;

    // Définition d'un event 
    event Authorized(address _address);
}