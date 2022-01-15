import algosdk from "algosdk";

export const ALGORAND_LEDGER =
    import.meta.env.VITE_ALGORAND_LEDGER ?? "MainNet";
export const NFTSTORAGE_API_KEY = import.meta.env.VITE_NFTSTORAGE_API_KEY;
export const ALGOEXPLORER_API_URL =
    ALGORAND_LEDGER.toLowerCase() === "mainnet"
        ? "https://node.algoexplorerapi.io"
        : "https://node.testnet.algoexplorerapi.io";
export const ALGOEXPLORER_INDEXER_URL =
    ALGORAND_LEDGER.toLowerCase() === "mainnet"
        ? "https://algoindexer.algoexplorerapi.io"
        : "https://algoindexer.testnet.algoexplorerapi.io";
export const ALGOEXPLORER_URL =
    ALGORAND_LEDGER.toLowerCase() === "mainnet"
        ? "https://algoexplorer.io"
        : "https://testnet.algoexplorer.io";

const cyrb53 = function (str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed,
        h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 =
        Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
        Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 =
        Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
        Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};
export const CARD_TITLE = cyrb53(algosdk.generateAccount().addr);
