// Aleo-only config (no other blockchains)

// Aleo branding (public/aleo-logos, public/aleo-badges)
export const ALEO_LOGO_PRIMARY = "/aleo-logos/SVG/primary-logo-light.svg";
export const ALEO_LOGO_ICON = "/aleo-logos/SVG/secondary-icon-light.svg";
export const ALEO_BADGE_LIGHT = "/aleo-badges/badge-light.svg";
export const ALEO_BADGE_DARK = "/aleo-badges/badge-dark.svg";

// Display-only: Aleo only
export const DISPLAY_CHAINS = [
  { id: "aleo", name: "Aleo", imageUrl: ALEO_LOGO_ICON, isTestnet: false },
];

// Legacy export (used by AuthProvider / Web3Provider when present)
const DEFAULT_CONTRACT_ADDRESS = "0x6b84f47Ef5c73AA8A9bc0D7Ff18ba3487aA5C1D3";
export const CONTRACT_ADDRESS =
  import.meta.env.VITE_SQUIDL_STEALTHSIGNER_CONTRACT_ADDRESS ||
  DEFAULT_CONTRACT_ADDRESS;

// Aleo-only: no EVM chains
export const sapphireTestnet = null;
export const MAINNET_CHAINS = [];
export const TESTNET_CHAINS = [];
export const customEvmNetworks = [];
export const FHENIX_CONFIG = {};
export const CHAINS = [];
