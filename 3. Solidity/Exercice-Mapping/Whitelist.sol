// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.12;

contract Whitelist {
    // Définition d'un mapping address => bool
    mapping(address => bool) whitelist;
}