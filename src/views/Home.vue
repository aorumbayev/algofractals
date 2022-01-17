<template>
    <div class="flex h-screen pt-6">
        <div
            class="card sm:w-600 w-1200 m-auto text-center shadow-2xl rounded-lg border-4 border-black bg-black"
        >
            <div class="container items-center text-center">
                <canvas
                    class="rounded-lg border-4"
                    id="fractal"
                    :style="canvasSizeStyle"
                >
                </canvas>
            </div>

            <figure class="grid justify-center mt-2">
                <br />
                <p class="text-gray-500 italic text-sm">
                    Simply reload the page if you want to generate another
                    fractal image.
                </p>
                <p class="text-gray-500 italic animate-pulse text-xs">
                    If you see a black box, just wait a little more...
                </p>
            </figure>

            <div class="card-body">
                <h2 class="card-title text-2xl text-pink-400">
                    Generate random Fractal NFT
                </h2>
                <p class="text-yellow-500">
                    Click mint button to generate a random fractal NFT. Minted
                    NFT will embed ARC69 traits on the amount of money spent on
                    this NFT (the value), and parameters used to generate it
                    (position and zoom). Minting cost includes additional 0.5
                    Algo as a fee to creator of AlgoFractals.
                </p>
                <br v-if="isConnected" />
                <p v-if="isConnected" class="text-pink-500 heavy">
                    {{
                        `${
                            creator.substring(0, 4) +
                            "...." +
                            creator.substring(
                                creator.length - 4,
                                creator.length
                            )
                        }`
                    }}
                </p>
                <br />
                <div class="justify-center card-actions">
                    <button
                        v-if="!isConnected"
                        class="btn btn-outline btn-accent"
                        :onclick="connectWallet"
                    >
                        Connect MyAlgo Wallet
                    </button>
                    <div v-else-if="isConnected">
                        <button
                            :class="buttonClass"
                            :onclick="mint"
                            :disabled="loading"
                        >
                            Mint
                        </button>
                        <button
                            class="btn btn-outline btn-accent"
                            :onclick="logout"
                            :disabled="loading"
                        >
                            Logout
                        </button>
                    </div>
                </div>
                <br />
                <div v-if="error" class="alert alert-error">
                    <div class="flex-1">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            class="w-6 h-6 mx-2 stroke-current"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                            ></path>
                        </svg>
                        <label>{{ error }}</label>
                    </div>
                </div>
            </div>
        </div>

        <div id="my-modal" class="modal">
            <div class="modal-box">
                <p>
                    Enim dolorem dolorum omnis atque necessitatibus. Consequatur
                    aut adipisci qui iusto illo eaque. Consequatur repudiandae
                    et. Nulla ea quasi eligendi. Saepe velit autem minima.
                </p>
                <div class="modal-action">
                    <a href="/components/modal#" class="btn btn-primary"
                        >Accept</a
                    >
                    <a href="/components/modal#" class="btn">Close</a>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { NFTStorage, File } from "nft.storage";
import algosdk from "algosdk";
import MyAlgoConnect from "@randlabs/myalgo-connect";
import {
    ALGOEXPLORER_API_URL,
    NFTSTORAGE_API_KEY,
    CARD_TITLE,
} from "@/common/constants.js";

export default {
    data: () => ({
        wallet: undefined,
        creator: undefined,
        loading: false,
        error: undefined,
        accountsSharedByUser: [],
        isConnected: false,
        nftStorage: new NFTStorage({
            token: NFTSTORAGE_API_KEY,
        }),
        address: undefined,
        algod: undefined,
        stat: [],
        canvasWidth: 1400,
        worker: new Worker("src/views/worker.js", { type: "module" }),
    }),
    computed: {
        canvasSizeStyle() {
            var width =
                window.innerWidth > 600
                    ? 600 - 10
                    : window.innerWidth <= 400
                    ? window.innerWidth - 10
                    : 300 - 10;
            return `width: ${width}px; height: ${width}px; padding-left: 0;
            padding-right: 0;
            margin-left: auto;
            margin-right: auto;
            display: block;`;
        },
        buttonClass() {
            return this.loading
                ? "btn mr-5 btn btn-accent loading"
                : "btn mr-5 btn btn-accent";
        },
    },
    mounted() {
        this.algod = new algosdk.Algodv2("", ALGOEXPLORER_API_URL, "");
        this.redrawCanvas();
    },
    methods: {
        redrawCanvas() {
            var canvas = document
                .getElementById("fractal")
                .transferControlToOffscreen();
            this.worker.postMessage({ canvas: canvas }, [canvas]);
        },
        isMobile() {
            if (
                /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                    navigator.userAgent
                )
            ) {
                return true;
            } else {
                return false;
            }
        },
        dataURLtoFile(dataUrl, fileName) {
            var byteString = atob(dataUrl.split(",")[1]);

            // separate out the mime component
            var mimeString = dataUrl.split(",")[0].split(":")[1].split(";")[0];

            // write the bytes of the string to an ArrayBuffer
            var ab = new ArrayBuffer(byteString.length);
            var ia = new Uint8Array(ab);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            return new File([ab], fileName, { type: mimeString });
        },

        async connectWallet() {
            try {
                const wallet = new MyAlgoConnect();
                const accountsSharedByUser = await wallet.connect();
                this.wallet = wallet;
                this.accountsSharedByUser = accountsSharedByUser;
                this.creator = accountsSharedByUser[0]["address"];
                this.isConnected = true;
            } catch (e) {
                this.isConnected = false;
            }
        },

        sleep(ms) {
            return new Promise((resolve) => setTimeout(resolve, ms));
        },

        async mint() {
            try {
                this.loading = true;
                this.error = undefined;

                const cvs = document.getElementById("fractal");
                const downloadUrl = cvs.toDataURL("image/png");
                const creatorWallet = this.creator;

                const title = `algofractal_#${creatorWallet}_${CARD_TITLE}`;
                var file = this.dataURLtoFile(downloadUrl, CARD_TITLE + ".png");

                const metadata = await this.nftStorage.store({
                    name: String(CARD_TITLE),
                    description: "A randomly generated fractal NFT on Algorand",
                    image: file,
                });

                const metaUrl = `https://dweb.link/ipfs/${metadata.ipnft}/metadata.json`;
                console.log(metaUrl);
                const response = await fetch(metaUrl);

                if (!response.ok) throw new Error(response.statusText);

                const json = await response.json();
                console.log(json.image);
                const titlePostfix = json.image.split("ipfs://")[1];

                const assetUrl = `https://dweb.link/ipfs/${titlePostfix}`;

                console.log(assetUrl, "assetUrl");

                const params = await fetch(
                    `${ALGOEXPLORER_API_URL}/v2/transactions/params`
                );
                const paramsJson = await params.json();
                console.log(paramsJson, "params");
                const assetName = `AFRCTL#${CARD_TITLE}`;
                const assetObject = {
                    from: creatorWallet,
                    note: new TextEncoder("utf-8").encode(
                        JSON.stringify({
                            name: assetName,
                            description:
                                "Randomly generated fractal with embedded ARC69 traits",
                            external_url: "https://algofractals.com",
                            standard: "arc69",
                            mime_type: "image/png",
                            properties: {
                                ID: CARD_TITLE,
                                Set: "Manderbrot",
                            },
                        })
                    ),
                    assetTotal: 1,
                    assetDecimals: 0,
                    assetDefaultFrozen: false,
                    assetManager: creatorWallet,
                    assetReserve: undefined,
                    assetFreeze: undefined,
                    assetClawback: undefined,
                    assetUnitName: "AFRCTL",
                    assetName: assetName,
                    assetURL: assetUrl,
                    type: "acfg",
                    suggestedParams: {
                        genesisID: paramsJson["genesis-id"],
                        fee: paramsJson["min-fee"],
                        firstRound: paramsJson["last-round"],
                        flatFee: true,
                        lastRound: paramsJson["last-round"] + 1000,
                        genesisHash: paramsJson["genesis-hash"],
                    },
                };
                console.log(assetObject);
                const create_frctl_txn =
                    algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject(
                        assetObject
                    );
                console.log(create_frctl_txn);

                const fee_txn =
                    algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                        from: creatorWallet,
                        to: "NPRGKVTDZBW7WEGLX4OB4RMP4PIJV5RW5WWE3MJO4INIKHINA2OGEWENQA",
                        amount: 0.5 * 1e6,
                        note: new TextEncoder("utf-8").encode(title),
                        suggestedParams: {
                            genesisID: paramsJson["genesis-id"],
                            fee: paramsJson["min-fee"],
                            firstRound: paramsJson["last-round"],
                            flatFee: true,
                            lastRound: paramsJson["last-round"] + 1000,
                            genesisHash: paramsJson["genesis-hash"],
                        },
                    });
                console.log(fee_txn);

                const txnsToGroup = [create_frctl_txn, fee_txn];
                const groupID = algosdk.computeGroupID(txnsToGroup);
                for (let i = 0; i < 2; i++) txnsToGroup[i].group = groupID;

                const signedTxns = await this.wallet.signTransaction(
                    txnsToGroup.map((txn) => txn.toByte())
                );

                // Submit the transaction
                let tx_id = await this.algod.sendRawTransaction(signedTxns);

                const tx = await algosdk.waitForConfirmation(
                    this.algod,
                    tx_id,
                    5
                );
            } catch (e) {
                console.log(e);
                this.error = "Unable to mint the NFT, please try again!";
            } finally {
                this.loading = false;
                this.error = undefined;
            }
        },

        async logout() {
            this.wallet = new MyAlgoConnect();
            this.isConnected = false;
        },
    },
};
</script>
