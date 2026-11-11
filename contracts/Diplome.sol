// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Diplomes is Ownable {
    struct Diplome {
        bytes32 hashPdf;
        string nomEtudiant;
        string cid;
        uint256 date;
        bool valide;
    }

    mapping(bytes32 => Diplome) public diplomes;

    event DiplomeEmis(bytes32 indexed hash, string nom, uint256 date);
    event DiplomeRevoque(bytes32 indexed hash);

    constructor() Ownable(msg.sender) {}

    // 3.2 : émettre un diplôme (owner uniquement)
    function emettreDiplome(
        bytes32 hash,
        string calldata nom,
        string calldata cid
    ) external onlyOwner {
        require(diplomes[hash].date == 0, "Diplome deja existant");
        diplomes[hash] = Diplome(hash, nom, cid, block.timestamp, true);
        emit DiplomeEmis(hash, nom, block.timestamp);
    }

    // 3.3 : vérifier un diplôme (lecture gratuite)
    function verifierDiplome(bytes32 hash)
        external
        view
        returns (
            bool existe,
            bool valide,
            string memory nom,
            string memory cid,
            uint256 date
        )
    {
        Diplome storage d = diplomes[hash];
        return (d.date != 0, d.valide, d.nomEtudiant, d.cid, d.date);
    }

    // 3.4 : révoquer un diplôme (owner uniquement)
    function revoquerDiplome(bytes32 hash) external onlyOwner {
        require(diplomes[hash].date != 0, "Diplome inexistant");
        require(diplomes[hash].valide, "Diplome deja revoque");
        diplomes[hash].valide = false;
        emit DiplomeRevoque(hash);
    }
}