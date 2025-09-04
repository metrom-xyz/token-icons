import { ChainType } from "@metrom-xyz/sdk";

export interface TokenInfo {
    chainType: ChainType;
    chainId: number;
    address: string;
    logoURI?: string;
}

export interface TelosToken {
    chainKey: string;
    decimals: number;
    symbol: string;
    name: string;
    address: string | null;
    icon: string;
}

export interface SeiToken {
    symbol: string;
    name: string;
    base: string;
    denom_units: { denom: string; exponent: number }[];
    images: { png?: string; svg?: string };
}

export interface AptosToken {
    chainId: number;
    tokenAddress: string | null;
    faAddress: string;
    name: string;
    symbol: string;
    decimals: number;
    bridge: null;
    panoraSymbol: string;
    logoUrl: string;
}
