import { TokenInfo, type TokenList } from "@uniswap/token-lists";
import { type Address } from "viem";
import { writeFileSync } from "node:fs";
import { SupportedChain } from "@metrom-xyz/contracts";

enum SupportedTestnet {
    Holesky = SupportedChain.Holesky,
    Sepolia = SupportedChain.Sepolia,
    BaseSepolia = SupportedChain.BaseSepolia,
    // TODO: this is temporary as we are testing Carbon on Sei on dev,
    // remove this as soon as that is done
    Sei = SupportedChain.Sei,
}

enum SupportedMainnet {
    Mode = SupportedChain.Mode,
    Mantle = SupportedChain.Mantle,
    Base = SupportedChain.Base,
    Taiko = SupportedChain.Taiko,
    Scroll = SupportedChain.Scroll,
    Sonic = SupportedChain.Sonic,
    Form = SupportedChain.Form,
    Gnosis = SupportedChain.Gnosis,
    Telos = SupportedChain.Telos,
    LightLinkPhoenix = SupportedChain.LightLinkPhoenix,
    Sei = SupportedChain.Sei,
}

type TokenIcons = Record<number, Record<Address, string>>;

async function fullTokenListExtractor(url: string): Promise<TokenInfo[]> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${url}: ${await response.text()}`);
    const list = (await response.json()) as TokenList;
    return list.tokens;
}

async function rawTokensListExtractor(url: string): Promise<TokenInfo[]> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${url}: ${await response.text()}`);
    return (await response.json()) as TokenInfo[];
}

async function formTokensListExtractor(url: string): Promise<TokenInfo[]> {
    const response = await fetch(url, {
        headers: {
            Origin: "https://bridge.form.network",
        },
    });
    if (!response.ok) throw new Error(`${url}: ${await response.text()}`);
    const list = (await response.json()) as Record<number, TokenInfo>[];
    return list.flatMap((item) => Object.values(item));
}

interface TelosToken {
    chainKey: string;
    decimals: number;
    symbol: string;
    name: string;
    address: string | null;
    icon: string;
}

async function telosTokensListExtractor(url: string): Promise<TokenInfo[]> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${url}: ${await response.text()}`);
    const list = (await response.json()) as {
        result: { data: TelosToken[] };
    };
    const tokens = [];
    for (const token of list.result.data) {
        if (token.chainKey !== "telos" || !token.address) continue;
        tokens.push(<TokenInfo>{
            chainId: 40, // telos' chain id from chainlist
            address: token.address,
            logoURI: token.icon,
        });
    }
    return tokens;
}

interface SeiToken {
    symbol: string;
    name: string;
    base: string;
    denom_units: { denom: string; exponent: number }[];
    images: { png?: string; svg?: string };
}

async function seiTokensListExtractor(url: string): Promise<TokenInfo[]> {
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
            chainId: SupportedChain.Sei,
            address: token.base,
            name: token.name,
            symbol: token.symbol,
            decimals: denomUnit.exponent,
            logoURI,
        });
    }

    return out;
}

const TOKEN_LIST_EXTRACTORS: Record<
    string,
    (url: string) => Promise<TokenInfo[]>
> = {
    "https://raw.githubusercontent.com/ethereum-optimism/ethereum-optimism.github.io/refs/heads/master/optimism.tokenlist.json":
        fullTokenListExtractor,
    "https://tokens.coingecko.com/uniswap/all.json": fullTokenListExtractor,
    "https://raw.githubusercontent.com/mantlenetworkio/mantle-token-lists/refs/heads/main/mantle.tokenlist.json":
        fullTokenListExtractor,
    "https://raw.githubusercontent.com/scroll-tech/token-list/refs/heads/main/scroll.tokenlist.json":
        fullTokenListExtractor,
    "https://bridge.gnosischain.com/api/tokens": rawTokensListExtractor,
    "https://api.superbridge.app/api/bridge/tokens/bridge.form.network":
        formTokensListExtractor,
    // FIXME: list not working (could be a temporary issue)
    // "https://bridge.telos.net/api/trpc/tokens": telosTokensListExtractor,
    "https://bridgev1.telos.net/api/trpc/tokens": telosTokensListExtractor,
    "https://cdn.oku.trade/tokenlist.json": fullTokenListExtractor,
    "https://raw.githubusercontent.com/Seitrace/sei-assetlist/refs/heads/main/assetlist.json":
        seiTokensListExtractor,
};

function lowercaseAddressKeys(icons: TokenIcons): TokenIcons {
    return Object.entries(icons).reduce(
        (accumulator: TokenIcons, [rawChainId, iconsInChain]) => {
            const chainId = parseInt(rawChainId);

            accumulator[chainId] = {};
            for (const [address, url] of Object.entries(iconsInChain)) {
                accumulator[chainId][address.toLowerCase() as Address] = url;
            }

            return accumulator;
        },
        {},
    );
}

function selfHostedIconUrl(name: string): string {
    return `https://raw.githubusercontent.com/metrom-xyz/token-icons/master/icons/${name}`;
}

const testnetIcons: TokenIcons = lowercaseAddressKeys({
    [SupportedTestnet.Holesky]: {
        "0x94373a4919b3240d86ea41593d5eba789fef3848":
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
        "0x0fe5a93b63accf31679321dd0daf341c037a1187":
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png",
        "0xa5ba8636a78bbf1910430d0368c0175ef5a1845b":
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
        "0x7d98346b3b000c55904918e3d9e2fc3f94683b01":
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
        "0x13c75ad40d4d30e5c057c3db52e74fdc0691f589":
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
    },
    [SupportedTestnet.Sepolia]: {
        "0xb01d32c05f4aa066eef2bfd4d461833fddd56d0a":
            "https://assets.coingecko.com/coins/images/53755/standard/BOLD_logo.png",
        "0x10f8d8422a36ba75ae3381815ea72638dda0088c":
            "https://assets.coingecko.com/coins/images/20764/standard/reth.png",
        "0x2442ca14d1217b4dd503e47dfdf79b774b56ea89":
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
        "0x4d5627c9f87b094a0a78a9fed0027e1a701be0ea":
            "https://assets.coingecko.com/coins/images/18834/standard/wstETH.png",
        "0xa80a089de4720f8cffa34dac70f6b648832a0ddb":
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png",
        "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee":
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
        "0x779877a7b0d9e8603169ddbd7836e478b4624789":
            "https://assets.coingecko.com/coins/images/877/standard/chainlink-new-logo.png",
    },
    [SupportedTestnet.BaseSepolia]: {},
    // TODO: remove this once Carbon has been tested and released
    [SupportedTestnet.Sei]: {
        "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee":
            "https://raw.githubusercontent.com/Seitrace/sei-assetlist/main/images/Sei.png",
    },
});

const mainnetIcons: TokenIcons = lowercaseAddressKeys({
    [SupportedMainnet.Mode]: {
        "0x4200000000000000000000000000000000000006":
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
        "0x6863fb62ed27a9ddf458105b507c15b5d741d62e":
            "https://assets.coingecko.com/coins/images/37504/standard/kim.jpg",
        "0xdfc7c877a950e49d2610114102175a06c2e3167a":
            "https://assets.coingecko.com/coins/images/34979/standard/MODE.jpg",
    },
    [SupportedMainnet.Mantle]: {
        "0x78c1b0c915c4faa5fffa6cabf0219da63d7f4cb8":
            "https://assets.coingecko.com/coins/images/30980/standard/token-logo.png",
        "0xdeaddeaddeaddeaddeaddeaddeaddeaddead1111":
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
        "0x09bc4e0d864854c6afb6eb9a9cdf58ac190d0df9":
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
        "0x201eba5cc46d216ce6dc03f6a759e8e766e956ae":
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
    },
    [SupportedMainnet.Base]: {
        "0x4200000000000000000000000000000000000006":
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
        "0x5dC25aA049837B696d1dc0F966aC8DF1491f819B":
            "https://assets.coingecko.com/coins/images/37504/standard/kim.jpg",
        "0x7B8C5d97c25B65f89817E8046851A32e963fc9cD":
            "https://assets.coingecko.com/coins/images/37504/standard/kim.jpg",
        "0x0555E30da8f98308EdB960aa94C0Db47230d2B9c":
            "https://assets.coingecko.com/coins/images/7598/standard/wrapped_bitcoin_wbtc.png",
        "0xfde4c96c8593536e31f229ea8f37b2ada2699bb2":
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
        "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf":
            "https://assets.coingecko.com/coins/images/40143/standard/cbbtc.webp",
        "0x04d5ddf5f3a8939889f11e97f8c4bb48317f1938":
            "https://assets.coingecko.com/coins/images/38039/standard/usdz-image-200x200.png",
        "0x60a3e35cc302bfa44cb288bc5a4f316fdb1adb42":
            "https://assets.coingecko.com/coins/images/26045/standard/euro.png",
        "0xb79dd08ea68a908a97220c76d19a6aa9cbde4376":
            "https://raw.githubusercontent.com/baseswapfi/default-token-list/fd33e52868f183d366054eaaf427a343c41ee9aa/images/USD+.svg",
        "0xd5046b976188eb40f6de40fb527f89c05b323385":
            "https://assets.coingecko.com/coins/images/31419/standard/bsxlogo.png?1696530234",
    },
    [SupportedMainnet.Taiko]: {
        "0xA51894664A773981C6C112C43ce576f315d5b1B6":
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
        "0x07d83526730c7438048D55A4fc0b850e2aaB6f0b":
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
        "0xA9d23408b9bA935c230493c40C73824Df71A0975":
            "https://assets.coingecko.com/coins/images/38058/standard/icon.png",
        "0xc4C410459fbaF8f7F86b6cEE52b4fA1282FF9704":
            "https://assets.coingecko.com/coins/images/7598/standard/wrapped_bitcoin_wbtc.png",
        "0x7d02A3E0180451B17e5D7f29eF78d06F8117106C":
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png",
        "0x2def195713cf4a606b49d07e520e22c17899a736":
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
        "0x19e26b0638bf63aa9fa4d14c6baf8d52ebe86c5c":
            "https://assets.coingecko.com/coins/images/33000/standard/usdc.png",
        "0x541FD749419CA806a8bc7da8ac23D346f2dF8B77":
            "https://assets.coingecko.com/coins/images/36800/standard/solvBTC.png",
        "0xCC0966D8418d412c599A6421b760a847eB169A8c":
            "https://assets.coingecko.com/coins/images/39384/standard/unnamed.png",
        "0xda9a0fbCE1b8b11fCbd8114354eC266594C0Ff5A":
            selfHostedIconUrl("wsxeth.png"),
    },
    [SupportedMainnet.Scroll]: {
        "0x5300000000000000000000000000000000000004":
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
        "0x01f0a31698C4d065659b9bdC21B3610292a1c506":
            "https://assets.coingecko.com/coins/images/33033/standard/weETH.png",
        "0x80137510979822322193FC997d400D5A6C747bf7":
            "https://assets.coingecko.com/coins/images/33103/standard/200_200.png",
        "0xd29687c813D741E2F938F4aC377128810E217b1b":
            "https://assets.coingecko.com/coins/images/50571/standard/scroll.jpg",
    },
    [SupportedMainnet.Sonic]: {
        "0x309C92261178fA0CF748A855e90Ae73FDb79EBc7":
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
        "0x29219dd400f2Bf60E5a23d13Be72B486D4038894":
            "https://assets.coingecko.com/coins/images/33000/standard/usdc.png",
        "0x50c42deacd8fc9773493ed674b675be577f2634b":
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
        "0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38":
            "https://assets.coingecko.com/coins/images/52857/standard/wrapped_sonic.png",
        "0x2fb960611bdc322a9a4a994252658cae9fe2eea1":
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984/logo.png",
    },
    [SupportedMainnet.Form]: {
        "0xFBf489bb4783D4B1B2e7D07ba39873Fb8068507D":
            "https://assets.coingecko.com/coins/images/33000/standard/usdc.png",
        "0xFA3198ecF05303a6d96E57a45E6c815055D255b1":
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
        "0x96D51cc3f7500d501bAeB1A2a62BB96fa03532F8":
            "https://assets.coingecko.com/coins/images/51063/standard/Gaming_Agent_1fe70d54ba.jpg",
        "0x40Ca4155c0334F7e0F6d7F80536B59EF8831c9fb":
            "https://assets.coingecko.com/coins/images/51784/standard/3.png",
        "0xb1b812b664c28E1bA1d35De925Ae88b7Bc7cdCF5":
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
    },
    [SupportedMainnet.Gnosis]: {},
    [SupportedChain.Telos]: {
        "0x8f7d64ea96d729ef24a0f30b4526d47b80d877b9":
            selfHostedIconUrl("usdm.png"),
        "0x674843c06ff83502ddb4d37c2e09c01cda38cbc8":
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
        "0xD102cE6A4dB07D247fcc28F366A623Df0938CA9E":
            "https://assets.coingecko.com/coins/images/23952/standard/tlos_png.png",
    },
    [SupportedChain.LightLinkPhoenix]: {
        "0x7ebef2a4b1b09381ec5b9df8c5c6f2dbeca59c73":
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
        "0x808d7c71ad2ba3FA531b068a2417C63106BC0949":
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
    },
    [SupportedChain.Sei]: {
        "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee":
            "https://raw.githubusercontent.com/Seitrace/sei-assetlist/main/images/Sei.png",
    },
});

const promises = Object.entries(TOKEN_LIST_EXTRACTORS).map(
    async ([url, extractor]) => {
        return await extractor(url);
    },
);

const results = await Promise.allSettled(promises);

for (const result of results) {
    if (result.status === "rejected") {
        console.warn(`Could not fetch token list: ${result.reason}`);
    } else {
        for (const token of result.value) {
            if (!token.logoURI) continue;

            let list;
            if (token.chainId in SupportedTestnet) list = testnetIcons;
            else if (token.chainId in SupportedMainnet) list = mainnetIcons;
            else continue;

            const tokenKey = token.address.toLowerCase() as Address;
            if (!list[token.chainId]) list[token.chainId] = {};
            if (list[token.chainId][tokenKey]) continue;

            list[token.chainId][tokenKey] = token.logoURI;
        }
    }
}

writeFileSync("./testnet-icons.json", JSON.stringify(testnetIcons));
writeFileSync("./mainnet-icons.json", JSON.stringify(mainnetIcons));
