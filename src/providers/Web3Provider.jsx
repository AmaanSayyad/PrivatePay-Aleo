import { getSigner, getWeb3Provider } from "@dynamic-labs/ethers-v6";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import {
  wrapEthersProvider,
  wrapEthersSigner,
} from "@oasisprotocol/sapphire-ethers-v6";
import { ethers } from "ethers";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { CONTRACT_ADDRESS, customEvmNetworks } from "../config";
import toast from "react-hot-toast";
import { sleep } from "../utils/process.js";

// Safe wrapper for useDynamicContext
const useDynamicContextSafe = () => {
  try {
    return useDynamicContext();
  } catch (error) {
    return { primaryWallet: null, handleLogOut: null };
  }
};

/**
 * @typedef {Object} Web3ContextType
 * @property {boolean} isLoaded - Indicates if the provider is loaded.
 * @property {ethers.providers.Provider | null} provider - The Ethers provider.
 * @property {ethers.Signer | null} signer - The Ethers signer.
 * @property {ethers.Contract | null} contract - The Ethers contract instance.
 */

/** @type {React.Context<Web3ContextType>} */
const Web3Context = createContext({
  isLoaded: false,
  provider: null,
  signer: null,
  contract: null,
});

export const useWeb3 = () => useContext(Web3Context);

export default function Web3Provider({ children }) {
  const { primaryWallet, handleLogOut } = useDynamicContextSafe();

  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [isLoaded, setLoaded] = useState(false);
  const [isNetworkChecking, setIsNetworkChecking] = useState(false);

  const isInitiating = useRef(false);

  // Aleo-only: no EVM chains configured
  const oasis = customEvmNetworks?.find?.((chain) => chain?.group === "oasis");

  async function init(forceSapphire = false) {
    if (isInitiating.current || !primaryWallet) return;
    if (!customEvmNetworks?.length) {
      setLoaded(true);
      return;
    }
    isInitiating.current = true;
    try {
      const _provider = await getWeb3Provider(primaryWallet);
      const _signer = await getSigner(primaryWallet);
      try {
        const network = await _provider.getNetwork();
        if (!network || network.chainId === undefined || network.chainId === null) {
          await sleep(1000);
          const retryNetwork = await _provider.getNetwork();
          if (!retryNetwork || retryNetwork.chainId === undefined || retryNetwork.chainId === null) {
            throw new Error("Provider chainId is not available");
          }
        }
        if (!oasis) {
          setProvider(_provider);
          setSigner(_signer);
          setContract(null);
          setLoaded(true);
          return;
        }
        const isSapphire = network.chainId === oasis.chainId;
        if (isSapphire) {
          const wrappedProvider = wrapEthersProvider(_provider);
          const wrappedSigner = wrapEthersSigner(_signer);
          setProvider(wrappedProvider);
          setSigner(wrappedSigner);
          setContract(null);
        } else {
          setProvider(_provider);
          setSigner(_signer);
          setContract(null);
        }
        setLoaded(true);
        monitorNetworkChange();
      } catch (networkError) {
        console.error("Error getting network from provider:", networkError);
        setLoaded(true);
      }
    } catch (e) {
      console.error("Error initializing web3 provider", e);
      setLoaded(true);
    } finally {
      isInitiating.current = false;
    }
  }

  async function switchNetworkIfNeeded(withLoading = false) {
    if (!oasis) return;
    if (withLoading) {
      if (isNetworkChecking) return;
      setIsNetworkChecking(true);
    }

    try {
      const network = await provider?.getNetwork();

      if (network?.chainId !== oasis.chainId) {
        if (primaryWallet?.connector?.supportsNetworkSwitching()) {
          try {
            await primaryWallet.switchNetwork(oasis.chainId);

            await init();
            return;
          } catch (error) {
            console.error("Error switching network:", error);
            toast.error(
              `Failed to switch network. Please switch to ${oasis.name} manually.`
            );
            // Don't logout immediately - let user try to switch manually
            // Only logout if user explicitly cancels or closes wallet
            return;
          }
        } else {
          toast.error(
            `Network switching not supported. Please switch to ${oasis.name} manually.`
          );
          // Don't logout - let user switch network manually
          return;
        }
      } else {
        toast.info(`Already connected to ${oasis.name} network.`);
        await init();
        return;
      }
    } catch (error) {
      console.error("Error checking network:", error);
      toast.error(`Error connecting to the network. Please switch manually.`);
      // Don't logout on network errors - might be temporary
      return;
    } finally {
      setIsNetworkChecking(false);
    }
  }

  function monitorNetworkChange() {
    const connector = primaryWallet.connector;

    if (!connector) {
      console.error("No connector found.");
      return;
    }

    // Listen for network changes
    connector.on("chainChange", async (_) => {
      if (signer) {
        await switchNetworkIfNeeded(true);
      }
    });
  }

  useEffect(() => {
    // Only initialize if we have a primary wallet
    // Don't force network switch during initial connection - let user choose network first
    if (primaryWallet && primaryWallet.address) {
      // Delay network switching to allow user to choose network
      // Only switch if user is already signed in (not during initial login)
      const isSignedIn = localStorage.getItem("auth_signer") !== null;
      if (isSignedIn) {
        // User is already signed in, check network
        switchNetworkIfNeeded(false);
      } else {
        // During initial login, just initialize without forcing network switch
        // This allows users to connect on any network first
        // Don't wrap with Sapphire yet - that will happen when user switches network
        init(false);
      }
    } else {
      // Reset state if no wallet
      setProvider(null);
      setSigner(null);
      setContract(null);
      setLoaded(false);
    }
  }, [primaryWallet]);

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        contract,
        isLoaded,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}
