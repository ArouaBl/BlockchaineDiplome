
import { expect } from "chai";
import { network } from "hardhat";

// Connexion au réseau local Hardhat
const { ethers } = await network.connect();

// Fixture : déploiement du contrat et préparation des comptes
async function deployDiplomesFixture() {
  const [owner, user1, user2] = await ethers.getSigners();

  const diplomes = await ethers.deployContract("Diplomes");

  await diplomes.waitForDeployment();

  return {
    diplomes,
    owner,
    user1,
    user2,
  };
}

// Fonction utilitaire pour générer un hash de diplôme
function createHash(value: string) {
  return ethers.keccak256(ethers.toUtf8Bytes(value));
}

describe("Diplomes - Tests du Smart Contract", function () {

  // ==========================================
  // 6.1 - PREPARATION ET DEPLOIEMENT
  // ==========================================

  describe("6.1 - Déploiement", function () {

    it("Doit déployer correctement le contrat", async function () {
      const { diplomes } = await deployDiplomesFixture();

      expect(await diplomes.getAddress()).to.be.properAddress;
    });

    it("Doit attribuer la propriété du contrat au deployeur", async function () {
      const { diplomes, owner } = await deployDiplomesFixture();

      expect(await diplomes.owner()).to.equal(owner.address);
    });

  });

  // ==========================================
  // 6.2 - TESTS D'EMISSION
  // ==========================================

  describe("6.2 - Emission des diplômes", function () {

    it("Doit permettre au owner d'émettre un diplôme", async function () {
      const { diplomes, owner } = await deployDiplomesFixture();

      const hash = createHash("Diplome Etudiant 001");

      await expect(
        diplomes.connect(owner).emettreDiplome(
          hash,
          "Ahmed Ben Ali",
          "QmTest001"
        )
      ).not.to.be.revert(ethers);
    });

    it("Doit émettre l'événement DiplomeEmis", async function () {
      const { diplomes, owner } = await deployDiplomesFixture();

      const hash = createHash("Diplome Etudiant 002");

      await expect(
        diplomes.connect(owner).emettreDiplome(
          hash,
          "Mohamed Ali",
          "QmTest002"
        )
      ).to.emit(diplomes, "DiplomeEmis");
    });

    it("Doit refuser l'émission par un non-owner", async function () {
      const { diplomes, user1 } = await deployDiplomesFixture();

      const hash = createHash("Diplome Etudiant 003");

      await expect(
        diplomes.connect(user1).emettreDiplome(
          hash,
          "Etudiant Test",
          "QmTest003"
        )
      ).to.be.revertedWithCustomError(
        diplomes,
        "OwnableUnauthorizedAccount"
      ).withArgs(user1.address);
    });

    it("Doit refuser un hash déjà enregistré", async function () {
      const { diplomes, owner } = await deployDiplomesFixture();

      const hash = createHash("Diplome Etudiant 004");

      await diplomes.connect(owner).emettreDiplome(
        hash,
        "Ahmed Ben Ali",
        "QmTest004"
      );

      await expect(
        diplomes.connect(owner).emettreDiplome(
          hash,
          "Autre Etudiant",
          "QmTest005"
        )
      ).to.be.revertedWith("Diplome deja existant");
    });

    it("Doit enregistrer correctement les informations du diplôme", async function () {
      const { diplomes, owner } = await deployDiplomesFixture();

      const hash = createHash("Diplome Etudiant 005");

      await diplomes.connect(owner).emettreDiplome(
        hash,
        "Sami Trabelsi",
        "QmTest006"
      );

      const [existe, valide, nom, cid, date] =
        await diplomes.verifierDiplome(hash);

      expect(existe).to.equal(true);
      expect(valide).to.equal(true);
      expect(nom).to.equal("Sami Trabelsi");
      expect(cid).to.equal("QmTest006");
      expect(date).to.be.greaterThan(0n);
    });

  });

  // ==========================================
  // 6.3 - VERIFICATION DES DIPLOMES
  // ==========================================

  describe("6.3 - Vérification des diplômes", function () {

    it("Doit reconnaître un diplôme existant", async function () {
      const { diplomes, owner } = await deployDiplomesFixture();

      const hash = createHash("Diplome Verification 001");

      await diplomes.connect(owner).emettreDiplome(
        hash,
        "Ahmed Ben Ali",
        "QmVerification001"
      );

      const [existe, valide] =
        await diplomes.verifierDiplome(hash);

      expect(existe).to.equal(true);
      expect(valide).to.equal(true);
    });

    it("Ne doit pas reconnaître un diplôme inexistant", async function () {
      const { diplomes } = await deployDiplomesFixture();

      const hash = createHash("Diplome Inexistant");

      const [existe, valide, nom, cid, date] =
        await diplomes.verifierDiplome(hash);

      expect(existe).to.equal(false);
      expect(valide).to.equal(false);
      expect(nom).to.equal("");
      expect(cid).to.equal("");
      expect(date).to.equal(0n);
    });

  });

  // ==========================================
  // 6.3 - TESTS DE REVOCATION
  // ==========================================

  describe("6.3 - Révocation des diplômes", function () {

    it("Doit permettre au owner de révoquer un diplôme", async function () {
      const { diplomes, owner } = await deployDiplomesFixture();

      const hash = createHash("Diplome Revocation 001");

      await diplomes.connect(owner).emettreDiplome(
        hash,
        "Etudiant Revocation",
        "QmRevocation001"
      );

      await expect(
        diplomes.connect(owner).revoquerDiplome(hash)
      ).not.to.be.revert(ethers);

      const [, valide] = await diplomes.verifierDiplome(hash);

      expect(valide).to.equal(false);
    });

    it("Doit émettre l'événement DiplomeRevoque", async function () {
      const { diplomes, owner } = await deployDiplomesFixture();

      const hash = createHash("Diplome Revocation 002");

      await diplomes.connect(owner).emettreDiplome(
        hash,
        "Etudiant Revocation",
        "QmRevocation002"
      );

      await expect(
        diplomes.connect(owner).revoquerDiplome(hash)
      ).to.emit(diplomes, "DiplomeRevoque");
    });

    it("Doit refuser la révocation par un non-owner", async function () {
      const { diplomes, owner, user1 } =
        await deployDiplomesFixture();

      const hash = createHash("Diplome Revocation 003");

      await diplomes.connect(owner).emettreDiplome(
        hash,
        "Etudiant Test",
        "QmRevocation003"
      );

      await expect(
        diplomes.connect(user1).revoquerDiplome(hash)
      ).to.be.revertedWithCustomError(
        diplomes,
        "OwnableUnauthorizedAccount"
      ).withArgs(user1.address);
    });

    it("Doit refuser une deuxième révocation", async function () {
      const { diplomes, owner } = await deployDiplomesFixture();

      const hash = createHash("Diplome Revocation 004");

      await diplomes.connect(owner).emettreDiplome(
        hash,
        "Etudiant Test",
        "QmRevocation004"
      );

      await diplomes.connect(owner).revoquerDiplome(hash);

      await expect(
        diplomes.connect(owner).revoquerDiplome(hash)
      ).to.be.revertedWith("Diplome deja revoque");
    });

    it("Doit refuser la révocation d'un diplôme inexistant", async function () {
      const { diplomes, owner } = await deployDiplomesFixture();

      const hash = createHash("Diplome Jamais Emis");

      await expect(
        diplomes.connect(owner).revoquerDiplome(hash)
      ).to.be.revertedWith("Diplome inexistant");
    });

    it("Doit conserver l'existence du diplôme après sa révocation", async function () {
      const { diplomes, owner } = await deployDiplomesFixture();

      const hash = createHash("Diplome Revocation 005");

      await diplomes.connect(owner).emettreDiplome(
        hash,
        "Etudiant Test",
        "QmRevocation005"
      );

      await diplomes.connect(owner).revoquerDiplome(hash);

      const [existe, valide] =
        await diplomes.verifierDiplome(hash);

      expect(existe).to.equal(true);
      expect(valide).to.equal(false);
    });

  });

});
