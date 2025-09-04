import {
    type TokenInfo as UniswapTokenInfo,
    type TokenList as UniswapTokenList,
} from "@uniswap/token-lists";
import { ChainType } from "@metrom-xyz/sdk";
import { AptosToken, SeiToken, TelosToken, TokenInfo } from "./types/token";
import { SupportedChain } from "@metrom-xyz/contracts";

export async function fullTokenListExtractor(
    url: string,
    chainType: ChainType = ChainType.Evm,
): Promise<TokenInfo[]> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${url}: ${await response.text()}`);
    const list = (await response.json()) as UniswapTokenList;
    return list.tokens.map(({ chainId, address, logoURI }) => ({
        chainType,
        chainId,
        address,
        logoURI,
    }));
}

export async function rawTokensListExtractor(
    url: string,
    chainType: ChainType = ChainType.Evm,
): Promise<TokenInfo[]> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${url}: ${await response.text()}`);
    return ((await response.json()) as UniswapTokenInfo[]).map(
        ({ chainId, address, logoURI }) => ({
            chainType,
            chainId,
            address,
            logoURI,
        }),
    );
}

export async function telosTokensListExtractor(
    url: string,
): Promise<TokenInfo[]> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${url}: ${await response.text()}`);
    const list = (await response.json()) as {
        result: { data: TelosToken[] };
    };
    const tokens: TokenInfo[] = [];
    for (const token of list.result.data) {
        if (token.chainKey !== "telos" || !token.address) continue;
        tokens.push(<TokenInfo>{
            chainType: ChainType.Evm,
            chainId: 40, // telos' chain id from chainlist
            address: token.address,
            logoURI: token.icon,
        });
    }
    return tokens;
}

export async function seiTokensListExtractor(
    url: string,
): Promise<TokenInfo[]> {
    const response = await fetch(url, {
        headers: {
            Origin: "https://raw.githubusercontent.com/Seitrace/sei-assetlist/refs/heads/main/assetlist.json",
        },
    });
    if (!response.ok) throw new Error(`${url}: ${await response.text()}`);
    const list = (await response.json()) as Record<string, SeiToken[]>;
    const tokens = list["pacific-1"];

    const out: TokenInfo[] = [];
    for (const token of tokens) {
        const denomUnit = token.denom_units.find(
            (item) => item.denom.toLowerCase() === token.symbol.toLowerCase(),
        );
        if (!denomUnit) {
            console.warn(
                `Could not resolve decimals for token ${token.symbol} on Sei, skipping`,
            );
            continue;
        }

        const logoURI = token.images["svg"] || token.images["png"];
        if (!logoURI) {
            console.warn(
                `Could not resolve logo URI for token ${token.symbol} on Sei, skipping`,
            );
            continue;
        }

        out.push({
            chainType: ChainType.Evm,
            chainId: SupportedChain.Sei,
            address: token.base,
            logoURI,
        });
    }

    return out;
}

export async function aptosTokensListExtractor(
    url: string,
): Promise<TokenInfo[]> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${url}: ${await response.text()}`);
    const list = (await response.json()) as AptosToken[];
    const tokens: TokenInfo[] = [];
    for (const token of list) {
        tokens.push(<TokenInfo>{
            chainType: ChainType.Aptos,
            chainId: token.chainId,
            address:
                token.faAddress === "0xa"
                    ? "0x000000000000000000000000000000000000000000000000000000000000000a"
                    : token.faAddress,
            logoURI: token.logoUrl,
        });
    }
    return tokens;
}
