import { SupportedChain } from "@metrom-xyz/contracts";
// import { SupportedChain as SupportedAptosChain } from "@metrom-xyz/aptos-contracts";

export enum SupportedTestnet {
    Sepolia = SupportedChain.Sepolia,
    BaseSepolia = SupportedChain.BaseSepolia,
    // TODO: these are temporary as we are testing Carbon on Sei on dev,
    // remove this as soon as that is done
    Sei = SupportedChain.Sei,
    Hemi = SupportedChain.Hemi,
}

export enum SupportedMainnet {
    Mode = SupportedChain.Mode,
    Mantle = SupportedChain.Mantle,
    Base = SupportedChain.Base,
    Taiko = SupportedChain.Taiko,
    Scroll = SupportedChain.Scroll,
    Sonic = SupportedChain.Sonic,
    Gnosis = SupportedChain.Gnosis,
    Telos = SupportedChain.Telos,
    Lens = SupportedChain.Lens,
    LightLinkPhoenix = SupportedChain.LightLinkPhoenix,
    Lumia = SupportedChain.Lumia,
    Sei = SupportedChain.Sei,
    Swell = SupportedChain.Swell,
    Hemi = SupportedChain.Hemi,
    Plasma = SupportedChain.Plasma,
    // Needed for Orki campaign
    Mainnet = 1,
}

export enum SupportedAptosTestnet {
    // TODO: export SupportedAptosChain as numbers
    Testnet = 2,
}

export enum SupportedAptosMainnet {
    // TODO: export SupportedAptosChain as numbers
    Mainnet = 1,
}
