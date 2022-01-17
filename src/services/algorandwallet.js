import QRCodeModal from "algorand-walletconnect-qrcode-modal";

import WalletConnect from "@walletconnect/client";

import { formatJsonRpcRequest } from "@json-rpc-tools/utils";

import algosdk from "algosdk";

import { algoExplorerRaw } from "@/services/algoexplorer";

const bridge = "https://bridge.walletconnect.org";

function NoAccounts() {
    return new Error("No accounts");
}

async function handleNodeExceptions(e) {
    const insufficientFundsError =
        /TransactionPool\.Remember: transaction [A-Z0-9]+: underflow on subtracting \d+ from sender amount \d+/g;
    const belowMinimumError =
        /TransactionPool\.Remember: transaction [A-Z0-9]+: account [A-Z0-9]+ balance \d+ below min (\d+)/g;
    const maxOptedInApps =
        /TransactionPool\.Remember: transaction [A-Z0-9]+: cannot opt in app [A-Z0-9]+ for [A-Z0-9]+: max opted-in apps per acct is \d+/g;
    let match;
    if (e.message.match(insufficientFundsError)) {
        throw e;
        // eslint-disable-next-line no-constant-condition
    } else if (
        (match = [...e.message.matchAll(belowMinimumError)]).length > 0
    ) {
        const minimumBalance = (Number(match[0][1]) / 10 ** 6).toFixed(6);
        console.log(
            `After this transaction, the balance would fall below the minimum of ${minimumBalance} Algos`
        );
        throw e;
    } else if (e.message.match(maxOptedInApps)) {
        console.log(
            "Maximum amount of opted-in applications per account exceeded. Use a different account"
        );
        throw e;
    }

    throw e;
}

NoAccounts.prototype = Object.create(Error.prototype);

export class AlgorandWallet {
    constructor() {
        this._init_connector();
    }

    _init_connector() {
        this.connector = new WalletConnect({
            bridge,
            qrcodeModal: QRCodeModal,
        });
        this.accountList = [];
    }

    subscribeToEvents() {
        if (!this.connector) {
            return;
        }

        this.connector.on("session_update", async (error, payload) => {
            if (error) {
                throw error;
            }

            const { accounts } = payload.params[0];
            this.onSessionUpdate(accounts);
        });

        this.connector.on("connect", (error, payload) => {
            if (error) {
                throw error;
            }

            this.onConnect(payload);
        });

        // eslint-disable-next-line no-unused-vars
        this.connector.on("disconnect", async (error, payload) => {
            if (error) {
                throw error;
            }

            await this.logout();

            // store.dispatch("algorand/DISCONNECT");
        });

        if (this.connector.connected) {
            const { accounts } = this.connector;
            // const address = accounts[0];
            this.onSessionUpdate(accounts);
        }
    }

    async onSessionUpdate(accounts) {
        // const address = accounts[0];
        this.accountList = accounts.map((account) => {
            return { address: account };
        });
        // store.dispatch("algorand/FINALIZE_CONNECT_TO_ALGORAND_WALLET");
    }

    async onConnect(payload) {
        const { accounts } = payload.params[0];
        // const address = accounts[0];
        this.accountList = accounts.map((account) => {
            return { address: account };
        });

        // store.dispatch("algorand/FINALIZE_CONNECT_TO_ALGORAND_WALLET");
    }

    async connect() {
        // check if already connected
        if (!this.connector.connected) {
            await this.connector.createSession();
        }

        await this.subscribeToEvents();
    }

    async logout() {
        if (this.connector.connected) {
            await this.connector.killSession();
        }
    }

    base64ToUint8Array(base64) {
        try {
            return new Uint8Array(
                atob(base64)
                    .split("")
                    .map((x) => x.charCodeAt(0))
            );
        } catch (e) {}
    }

    combineSignedTxs(txs, raw = true) {
        const decodedTxs = txs.map((tx) => {
            if (tx.blob instanceof Uint8Array) {
                return tx.blob;
            } else {
                return this.base64ToUint8Array(tx.blob);
            }
        });

        if (raw) {
            const totalLength = decodedTxs.reduce(
                (previousValue, currentValue) => {
                    return previousValue + currentValue.byteLength;
                },
                0
            );
            const combinedTxs = new Uint8Array(totalLength);
            let byteLength = 0;
            for (let tx = 0; tx < decodedTxs.length; tx++) {
                combinedTxs.set(new Uint8Array(decodedTxs[tx]), byteLength);
                byteLength += decodedTxs[tx].byteLength;
            }
            return combinedTxs;
        } else {
            return decodedTxs.map((tx) => {
                return btoa(String.fromCharCode.apply(null, tx));
            });
        }
    }

    // eslint-disable-next-line no-unused-vars
    async sign(txs, description = null, separate = false) {
        try {
            const txsCount = txs.length;

            let signedTxs = [];

            const txnsToSign = txs.map((txn) => {
                const encodedTxn = btoa(
                    String.fromCharCode.apply(
                        null,
                        algosdk.encodeUnsignedTransaction(txn)
                    )
                );

                return {
                    txn: encodedTxn,
                    message:
                        "I am a transaction to mint a single randomly generated AlgoFractal NFT. Thank you for supporting AlgoFractals.com, stay tuned for more versions ;)",
                    // Note: if the transaction does not need to be signed (because it's part of an atomic group
                    // that will be signed by another party), specify an empty singers array like so:
                    // signers: [],
                };
            });

            const requestParams = [txnsToSign];

            const request = formatJsonRpcRequest("algo_signTxn", requestParams);
            signedTxs = await this.connector.sendCustomRequest(request);
            const formattedSignedTxs = signedTxs
                .filter((tx) => {
                    return tx !== null;
                })
                .map((tx) => ({ blob: tx }));
            return this.combineSignedTxs(formattedSignedTxs);
        } catch (e) {
            throw e;
        }
    }

    // eslint-disable-next-line no-unused-vars
    accounts() {
        return this.accountList;
    }

    async algod(params) {
        try {
            return algoExplorer.algod.get(params.path);
        } catch (e) {
            throw e;
        }
    }

    async indexer(params) {
        try {
            return algoExplorer.indexer.get(params.path);
        } catch (e) {
            throw e;
        }
    }

    async post(params) {}

    async send(params, showSucess = true) {
        try {
            const tx = await algoExplorerRaw.algod.post(
                "/v2/transactions",
                this.base64ToUint8Array(params.tx),
                {
                    "Content-Type": "application/x-binary",
                }
            );
            return tx;
        } catch (e) {
            try {
                e.message = (await e.response.json())["message"];
            } finally {
                await handleNodeExceptions(e);
            }
        }
    }
}
