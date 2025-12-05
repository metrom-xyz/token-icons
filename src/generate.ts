import { type Address } from "viem";
import { writeFileSync } from "node:fs";
import { TokenInfo } from "./types/token";
import {
    SupportedAptosMainnet,
    SupportedAptosTestnet,
    SupportedMainnet,
    SupportedTestnet,
} from "./types/chain";
import {
    aptosTokensListExtractor,
    fullTokenListExtractor,
    rawTokensListExtractor,
    seiTokensListExtractor,
    telosTokensListExtractor,
} from "./extractors";
import { ChainType } from "@metrom-xyz/sdk";

type TokenIcons = Record<number, Record<Address, string>>;

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
    "https://raw.githubusercontent.com/PanoraExchange/Aptos-Tokens/refs/heads/main/token-list.json":
        aptosTokensListExtractor,
    "https://bridgev1.telos.net/api/trpc/tokens": telosTokensListExtractor,
    "https://cdn.oku.trade/tokenlist.json": fullTokenListExtractor,
    "https://raw.githubusercontent.com/Seitrace/sei-assetlist/refs/heads/main/assetlist.json":
        seiTokensListExtractor,
    "https://raw.githubusercontent.com/hemilabs/token-list/refs/heads/master/src/hemi.tokenlist.json":
        fullTokenListExtractor,
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
    // TODO: remove these once Carbon has been tested and released
    [SupportedTestnet.Sei]: {
        "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee":
            "https://raw.githubusercontent.com/Seitrace/sei-assetlist/main/images/Sei.png",
        "0xb75d0b03c06a926e488e2659df1a861f860bd3d1":
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
    },
    [SupportedTestnet.Hemi]: {},
    [SupportedAptosTestnet.Testnet]: {
        "0x000000000000000000000000000000000000000000000000000000000000000a":
            "https://assets.panora.exchange/tokens/aptos/APT.svg",
        "0x69091fbab5f7d635ee7ac5098cf0c1efbe31d68fec0f2cd565e8d168daf52832":
            "https://assets.panora.exchange/tokens/aptos/USDC.svg",
        "0xd5d0d561493ea2b9410f67da804653ae44e793c2423707d4f11edb2e38192050":
            "https://static.optimism.io/data/USDT/logo.png",
        "0x8e67e42c4ff61e16dca908b737d1260b312143c1f7ba1577309f075a27cb4d90":
            "https://assets.panora.exchange/tokens/aptos/sUSDe.png",
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
        "0xdb9E8F82D6d45fFf803161F2a5f75543972B229a":
            selfHostedIconUrl("usdq.png"),
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
        "0x6fbaeE8bEf2e8f5c34A08BdD4A4AB777Bd3f6764":
            selfHostedIconUrl("alp.png"),
    },
    [SupportedMainnet.Gnosis]: {},
    [SupportedMainnet.Telos]: {
        "0x8f7d64ea96d729ef24a0f30b4526d47b80d877b9":
            selfHostedIconUrl("usdm.png"),
        "0x674843c06ff83502ddb4d37c2e09c01cda38cbc8":
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
        "0xD102cE6A4dB07D247fcc28F366A623Df0938CA9E":
            "https://assets.coingecko.com/coins/images/23952/standard/tlos_png.png",
    },
    [SupportedMainnet.Lens]: {
        "0x000000000000000000000000000000000000800A":
            selfHostedIconUrl("gho.png"),
    },
    [SupportedMainnet.LightLinkPhoenix]: {
        "0x7ebef2a4b1b09381ec5b9df8c5c6f2dbeca59c73":
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
        "0x808d7c71ad2ba3FA531b068a2417C63106BC0949":
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
    },
    [SupportedMainnet.Sei]: {
        "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee":
            "https://raw.githubusercontent.com/Seitrace/sei-assetlist/main/images/Sei.png",
        "0xb75d0b03c06a926e488e2659df1a861f860bd3d1":
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
        "0x5Cf6826140C1C56Ff49C808A1A75407Cd1DF9423":
            "https://assets.coingecko.com/coins/images/38591/standard/iSEI_logo_200_200.png?1718091709",
        "0x0555e30da8f98308edb960aa94c0db47230d2b9c":
            "https://assets.coingecko.com/coins/images/7598/standard/wrapped_bitcoin_wbtc.png",
        "0x9151434b16b9763660705744891fa906f660ecc5":
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
    },
    [SupportedMainnet.Swell]: {
        "0x4200000000000000000000000000000000000006":
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
        "0x0000baa0b1678229863c0a941c1056b83a1955f5":
            selfHostedIconUrl("usdk.png"),
        "0xda1F8EA667dc5600F5f654DF44b47F1639a83DD1":
            "https://assets.coingecko.com/coins/images/28777/standard/swell1.png",
        "0x1a17b22d762c8cf2ca0f07e2b3c32e7481bb0d8c":
            "https://assets.coingecko.com/coins/images/56069/standard/BOLD_logo.png",
        "0x7c98e0779eb5924b3ba8ce3b17648539ed5b0ecc":
            "https://s3.us-east-2.amazonaws.com/assets.rollbridge.app/61bd908177ce4eef8d4a9.png",
        "0x0000000000000000000000000000000000000000":
            "https://ethereum-optimism.github.io/data/ETH/logo.svg",
        "0x9cb41cd74d01ae4b4f640ec40f7a60ca1bcf83e7":
            "https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/refs/heads/main/deployments/warp_routes/PZETH/logo.svg",
        "0x2416092f143378750bb29b79ed961ab195cceea5":
            "https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/refs/heads/main/deployments/warp_routes/EZETH/logo.svg",
        "0xfa3198ecf05303a6d96e57a45e6c815055d255b1":
            "https://s3.us-east-2.amazonaws.com/assets.rollbridge.app/bsquared.svg",
        "0x09341022ea237a4db1644de7ccf8fa0e489d85b7":
            "https://s3.us-east-2.amazonaws.com/assets.rollbridge.app/971f401121cc90314670c.svg",
        "0xf6718b2701d4a6498ef77d7c152b2137ab28b8a3":
            "https://s3.us-east-2.amazonaws.com/assets.rollbridge.app/b117125c9a7f883197b59.svg",
        "0x939f1cc163fdc38a77571019eb4ad1794873bf8c":
            "https://s3.us-east-2.amazonaws.com/assets.rollbridge.app/bafadce2c7f8b374f127b.svg",
        "0x80ccfbec4b8c82265abdc226ad3df84c0726e7a3":
            "https://s3.us-east-2.amazonaws.com/assets.rollbridge.app/9df01e18386ccd27c185b.svg",
        "0xc3eacf0612346366db554c991d7858716db09f58":
            "https://s3.us-east-2.amazonaws.com/assets.rollbridge.app/e1522c29a42749fd5ec81.svg",
        "0xa6cb988942610f6731e664379d15ffcfbf282b44":
            "https://s3.us-east-2.amazonaws.com/assets.rollbridge.app/2305e6804e5346fb5545e.png",
        "0x18d33689ae5d02649a859a1cf16c9f0563975258":
            "https://s3.us-east-2.amazonaws.com/assets.rollbridge.app/43595da313df6982d1087.png",
        "0x2826d136f5630ada89c1678b64a61620aab77aea":
            "https://s3.us-east-2.amazonaws.com/assets.rollbridge.app/4b0af65ae04a5d71cceeb.svg",
        "0x58538e6a46e07434d7e7375bc268d3cb839c0133":
            "https://s3.us-east-2.amazonaws.com/assets.rollbridge.app/60dd3dc60c18e005f5a9f.svg",
        "0x211cc4dd073734da055fbf44a2b4667d5e5fe5d2":
            "https://s3.us-east-2.amazonaws.com/assets.rollbridge.app/960dd3dc60c18e005f5a9.svg",
        "0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34":
            "https://s3.us-east-2.amazonaws.com/assets.rollbridge.app/93319e2f5ffa837ab7506.jpg",
        "0xc2606aade4bdd978a4fa5a6edb3b66657acee6f8":
            "https://s3.us-east-2.amazonaws.com/assets.rollbridge.app/59df01e18386ccd27c185.png",
        "0x9ab96a4668456896d45c301bc3a15cee76aa7b8d":
            "https://s3.us-east-2.amazonaws.com/assets.rollbridge.app/d857ac137bbb4a1323172.jpg",
        "0x1cf7b5f266a0f39d6f9408b90340e3e71df8bf7b":
            "https://s3.us-east-2.amazonaws.com/assets.rollbridge.app/64b0af65ae04a5d71ccee.svg",
    },
    [SupportedMainnet.Hemi]: {
        "0xbb0d083fb1be0a9f6157ec484b6c79e0a4e31c2e":
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
    },
    [SupportedMainnet.Lumia]: {
        "0xdcb5227ea8e5fde0f761a55dc669ec09807e7c8b":
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
        "0xff297ac2cb0a236155605eb37cb55cfcae6d3f01":
            "https://assets.coingecko.com/coins/images/33000/standard/usdc.png",
        "0xe891b5ee2f52e312038710b761ec165792ad25b1":
            "https://assets.coingecko.com/coins/images/50867/standard/lumia.jpg",
        "0xee7fc418f5659a366b548b4e205d374c1f0b46e7":
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
        "0xd523474C9F8D5e6C0FBcc5FADEA961E6639147Bf":
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
    },
    // TODO: not ideal but works for now. If we want to have different mappings for each chain type we need to have
    // a chain type on every token entity on the frontend, which is currently missing.
    [SupportedMainnet.Mainnet | SupportedAptosMainnet.Mainnet]: {
        "0x6440f144b7e50D6a8439336510312d2F54beB01D":
            "https://assets.coingecko.com/coins/images/56069/standard/BOLD_logo.png",
        "0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b":
            "https://static.optimism.io/data/USDT/logo.png",
        "0x88887be419578051ff9f4eb6c858a951921d8888":
            "https://assets.coingecko.com/coins/images/69060/standard/stcUSD_ab_200%C3%97200.png",
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
            const chainType = token.chainType;
            const chainId = token.chainId;

            if (chainType === ChainType.Evm) {
                if (chainId in SupportedTestnet)
                    insertTokenInList(testnetIcons, token);
                if (chainId in SupportedMainnet)
                    insertTokenInList(mainnetIcons, token);
            }

            if (chainType === ChainType.Aptos) {
                if (chainId in SupportedAptosTestnet)
                    insertTokenInList(testnetIcons, token);
                if (chainId in SupportedAptosMainnet)
                    insertTokenInList(mainnetIcons, token);
            }
        }
    }
}

function insertTokenInList(list: TokenIcons, token: TokenInfo) {
    if (!token.logoURI) return;

    const tokenKey = token.address.toLowerCase() as Address;

    if (!list[token.chainId]) list[token.chainId] = {};
    if (list[token.chainId][tokenKey]) return;

    list[token.chainId][tokenKey] = token.logoURI;
}

writeFileSync("./testnet-icons.json", JSON.stringify(testnetIcons));
writeFileSync("./mainnet-icons.json", JSON.stringify(mainnetIcons));
