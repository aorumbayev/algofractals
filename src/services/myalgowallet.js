// import { emitError } from "@/utils/errors";
// import eventBus from "@/utils/eventBus";
import MyAlgo from "@randlabs/myalgo-connect";

function NoAccounts() {
    return new Error("No accounts");
}

NoAccounts.prototype = Object.create(Error.prototype);

export class MyAlgoWallet {
    constructor() {
        this.myAlgoWallet = new MyAlgo();
        this.accountList = [];
    }

    async connect() {
        try {
            this.accountList = await this.myAlgoWallet.connect();
        } catch (e) {
            // emitError("Could not connect to myAlgo");
            throw e;
        }
    }

    // eslint-disable-next-line no-unused-vars
    async accounts(params) {
        if (this.accountList.length > 0) {
            return this.accountList;
        } else {
            emitError("Could not get information about accounts");
            throw new NoAccounts();
        }
    }

    // async algod(params) {
    //     try {
    //         return algoExplorer.algod.get(params.path);
    //     } catch (e) {
    //         emitError("Could not get information from the Algorand blockchain");
    //         throw e;
    //     }
    // }

    // async indexer(params) {
    //     try {
    //         return algoExplorer.indexer.get(params.path);
    //     } catch (e) {
    //         emitError("Could not get information from the Algorand blockchain");
    //         throw e;
    //     }
    // }

    // async send(params, showSucess = true) {
    //     try {
    //         eventBus.$emit("set-action-message", "Sending...");
    //         const tx = await algoExplorer.algod.post(
    //             "/v2/transactions",
    //             base64ToUint8Array(params.tx),
    //             {
    //                 "Content-Type": "application/x-binary",
    //             }
    //         );
    //         if (showSucess) {
    //             eventBus.$emit("transaction-success", tx.txId);
    //         }
    //         return tx;
    //     } catch (e) {
    //         try {
    //             e.message = (await e.response.json())["message"];
    //         } finally {
    //             await handleNodeExceptions(e);
    //         }
    //     }
    // }
}
