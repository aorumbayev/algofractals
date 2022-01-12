export const ALGORAND_LEDGER = process.env.VUE_APP_ALGORAND_LEDGER ?? "MainNet";
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
