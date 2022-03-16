// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.12;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Devine is Ownable {

    // Le mot à deviner
    string private word;
    // L'indice
    string public indice;
    // Mapping permettant de savoir si un joueur a déjà joué
    mapping(address => bool) players;
    // Le gagnant
    address public winner;

    /**
    * Méthode permettant de setter un nouveau mot
    */
    function setNewWord(string memory _word, string memory _indice) public onlyOwner {
        word = _word;
        indice = _indice;
    }

    /**
    * Méthode offrant la possibilité de deviner le mot et devenir le gagnant
    */
    function guessWord(string memory _word) public returns(bool) {
        // Vérifie si le joueur a déjà joué
        require(players[msg.sender] == false, unicode"Vous avez déjà joué");

        // Enregistre que le joueur a joué
        players[msg.sender] = true;

        // Vérification du mot
        bool isValid = keccak256(abi.encodePacked(word)) == keccak256(abi.encodePacked(_word));

        // Si le mot est valide et qu'il n'y a pas de gagnant, on définit le gagnant
        if(isValid && winner == address(0)) {
            winner = msg.sender;
        }

        return isValid;
    }

    /**
    * Méthode permettant d'obtenir le vainqueur
    */
    function getWinner() public view returns(string memory) {
        if(winner==address(0)) {
            return "Pas de gagnant pour le moment";
        }
        else {
            return "Il y a un gagnant";
        }
    }
}