import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("DiplomesModule", (m) => {
  const diplomes = m.contract("Diplomes");
  return { diplomes };
});