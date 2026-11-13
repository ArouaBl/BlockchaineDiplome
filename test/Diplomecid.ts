import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("Diplomes - champ cid (IPFS)", function () {
  const hash = "0x" + "11".repeat(32);
  const cid = "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi";

  it("enregistre et renvoie le CID IPFS", async function () {
    const diplomes = await ethers.deployContract("Diplomes");
    await diplomes.emettreDiplome(hash, "Ali Test", cid);

    const [existe, valide, nom, cidLu] = await diplomes.verifierDiplome(hash);
    expect(existe).to.equal(true);
    expect(valide).to.equal(true);
    expect(nom).to.equal("Ali Test");
    expect(cidLu).to.equal(cid);
  });

  it("accepte un CID vide (sans IPFS)", async function () {
    const diplomes = await ethers.deployContract("Diplomes");
    await diplomes.emettreDiplome(hash, "Ali Test", "");

    const [existe, , , cidLu] = await diplomes.verifierDiplome(hash);
    expect(existe).to.equal(true);
    expect(cidLu).to.equal("");
  });
});