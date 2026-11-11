# Sample Hardhat 3 Project (`mocha` and `ethers`)

This project showcases a Hardhat 3 project using `mocha` for tests and the `ethers` library for Ethereum interactions.

To learn more about Hardhat 3, please visit the [Getting Started guide](https://hardhat.org/docs/getting-started#getting-started-with-hardhat-3). To share your feedback, join our [Hardhat 3](https://hardhat.org/hardhat3-telegram-group) Telegram group or [open an issue](https://github.com/NomicFoundation/hardhat/issues/new) in our GitHub issue tracker.

## Project Overview

This example project includes:

- A simple Hardhat configuration file.
- Foundry-compatible Solidity unit tests.
- TypeScript integration tests using `mocha` and ethers.js
- Examples demonstrating how to connect to different types of networks, including locally simulating OP mainnet.

## Usage

### Running Tests

To run all the tests in the project, execute the following command:

```shell
npx hardhat test
```

You can also selectively run the Solidity or `mocha` tests:

```shell
npx hardhat test solidity
npx hardhat test mocha
```

### Make a deployment to Sepolia

This project includes an example Ignition module to deploy the contract. You can deploy this module to a locally simulated chain or to Sepolia.

To run the deployment to a local chain:

```shell
npx hardhat ignition deploy ignition/modules/Counter.ts
```

To run the deployment to Sepolia, you need an account with funds to send the transaction. The provided Hardhat configuration includes a Configuration Variable called `SEPOLIA_PRIVATE_KEY`, which you can use to set the private key of the account you want to use.

You can set the `SEPOLIA_PRIVATE_KEY` variable using the `hardhat-keystore` plugin or by setting it as an environment variable.

To set the `SEPOLIA_PRIVATE_KEY` config variable using `hardhat-keystore`:

```shell
npx hardhat keystore set SEPOLIA_PRIVATE_KEY
```

After setting the variable, you can run the deployment with the Sepolia network:

```shell
npx hardhat ignition deploy --network sepolia ignition/modules/Counter.ts
```

## Structure Diplome

```solidity
struct Diplome {
    bytes32 hashPdf;      // empreinte SHA-256 du PDF
    string nomEtudiant;   // nom fictif pour la démo
    string cid;           // lien IPFS, vide si IPFS n'est pas fait
    uint256 date;         // date d'émission (block.timestamp), 0 = n'existe pas
    bool valide;          // true = valide, false = révoqué
}
mapping(bytes32 => Diplome) public diplomes;
```

Un diplôme existe si `date != 0`.

## Interface du contrat

| Élément | Signature | Accès |
|---|---|---|
| Émettre | `emettreDiplome(bytes32 hash, string nom, string cid)` | owner uniquement |
| Vérifier | `verifierDiplome(bytes32 hash) view returns (bool existe, bool valide, string nom, string cid, uint256 date)` | public |
| Révoquer | `revoquerDiplome(bytes32 hash)` | owner uniquement |
| Événement | `DiplomeEmis(bytes32 indexed hash, string nom, uint256 date)` | |
| Événement | `DiplomeRevoque(bytes32 indexed hash)` | |

**Format du hash :** `bytes32`, écrit en JavaScript sous la forme `0x` suivi de 64 caractères hexadécimaux (SHA-256 = 32 octets).

**Messages d'erreur :** « Diplome deja existant », « Diplome inexistant », « Diplome deja revoque ».