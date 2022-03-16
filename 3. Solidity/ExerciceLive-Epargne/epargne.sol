// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.12;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Epargne is Ownable {

    // Limite de temps avant de pouvoir retirer
    uint withdrawalTimeLimit;
    // Nombre de dépôt
    uint depositCounter;
    // Mapping indiquant nombre de dépôt-montant
    mapping(uint => uint) deposits;

    /**
     * Méthode permettant de déposer des fonds
     */
    function deposit() public payable onlyOwner {

        // Si c'est la première fois que l'on fait un dépôt, le temps vaut 0
        // On initialise donc la date limite pour le retrait
        if(withdrawalTimeLimit==0){
            withdrawalTimeLimit = block.timestamp + 90 days;
        }

        // On alimente la mapping avec le numéro du dépôt et le montant
        deposits[depositCounter] = msg.value;
        depositCounter++;
    }

    /**
     * Méthode permettant de retirer des fonds
     */
    function withdrawal() public onlyOwner {

        // Vérifie si l'utilisateur peut retirer - Limite de 3 mois
        require(block.timestamp >= withdrawalTimeLimit, "Vous n'avez pas atteint la limite de temps requise pour retirer votre argent");
        // Envoie la somme au l'appelant - forcément l'owner du contrat car onlyOwner
        (bool sent,) = payable(msg.sender).call{value:address(this).balance}("");
        // Vérification de l'état du transfert
        require(sent, "echec du transfert");
    }
}