import { useState, useEffect, useCallback } from "react";
import { BrowserProvider } from "ethers";

export function useWallet() {
  const [address, setAddress] = useState("");
  const [network, setNetwork] = useState("");
  const [chainId, setChainId] = useState(null);
  const [error, setError] = useState("");

  const hasMetaMask = typeof window !== "undefined" && Boolean(window.ethereum);

  const refresh = useCallback(async (accounts) => {
    if (!accounts || accounts.length === 0) {
      setAddress("");
      setNetwork("");
      setChainId(null);
      return;
    }
    const provider = new BrowserProvider(window.ethereum);
    const net = await provider.getNetwork();
    setAddress(accounts[0]);
    setChainId(Number(net.chainId));
    setNetwork(net.name);
  }, []);

  const connect = useCallback(async () => {
    setError("");
    if (!window.ethereum) {
      setError("MetaMask n'est pas installé.");
      return;
    }
    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      await refresh(accounts);
    } catch (err) {
      setError(
        err.code === 4001
          ? "Connexion refusée dans MetaMask."
          : "Erreur de connexion à MetaMask."
      );
    }
  }, [refresh]);

  useEffect(() => {
    if (!window.ethereum) return;

    const reload = () =>
      window.ethereum.request({ method: "eth_accounts" }).then(refresh).catch(() => {});

    reload();
    window.ethereum.on("accountsChanged", refresh);
    window.ethereum.on("chainChanged", reload);
    return () => {
      window.ethereum.removeListener("accountsChanged", refresh);
      window.ethereum.removeListener("chainChanged", reload);
    };
  }, [refresh]);

  return { address, network, chainId, error, hasMetaMask, connect };
}