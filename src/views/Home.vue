<template>
    <div class="flex h-screen">
        <div
            v-if="isMobile()"
            class="card md:w-8/12 lg:w-6/12 w-9/12 m-auto text-center shadow-2xl rounded-lg border-4 border-black bg-black"
        >
            <div class="card-body">
                <h2 class="card-title text-2xl text-pink-400">I am sorry 😭</h2>
                <p class="text-yellow-500">
                    Mobile screens are not yet supported. Check me out from a
                    desktop browser and enjoy the magic of fractals 🔮
                </p>
            </div>
        </div>
        <div
            v-else
            class="card md:w-8/12 lg:w-6/12 w-9/12 m-auto text-center shadow-2xl rounded-lg border-4 border-black bg-black"
        >
            <div class="w-8/12"></div>
            <figure class="grid z-10 justify-center mt-5">
                <Fractals class="rounded-lg border-4" />
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
    </div>
</template>

<script>
import Fractals from "@/components/Fractals.vue";
import { NFTStorage, File } from "nft.storage";
import algosdk from "algosdk";
import MyAlgoConnect from "@randlabs/myalgo-connect";
import {
    CARD_TITLE,
    ALGOEXPLORER_API_URL,
    NFTSTORAGE_API_KEY,
} from "@/common/constants.js";

export default {
    components: { Fractals },
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
    }),
    computed: {
        buttonClass() {
            return this.loading
                ? "btn mr-5 btn btn-accent loading"
                : "btn mr-5 btn btn-accent";
        },
    },
    mounted() {
        this.algod = new algosdk.Algodv2("", ALGOEXPLORER_API_URL, "");

        const cvs = document.getElementById("fractalsCanvas");
        const ctx = cvs.getContext("2d");
        const dpr = window.devicePixelRatio;
        const dpi = 700;
        let width = 2;
        let height = 2;
        cvs.width = width * dpi * dpr;
        cvs.height = height * dpi * dpr;
        ctx.scale(dpr, dpr);
    },
    methods: {
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

                const cvs = document.getElementById("fractalsCanvas");
                const downloadUrl = cvs.toDataURL("image/png");
                const creatorWallet = this.creator;

                const title = `algofractal_#${creatorWallet}_${CARD_TITLE}`;
                var file = this.dataURLtoFile(downloadUrl, title + ".png");

                await this.sleep(1000);

                const metadata = await this.nftStorage.store({
                    name: String(CARD_TITLE),
                    description: "A randomly generated fractal NFT on Algorand",
                    image: file,
                });
                const status = await this.nftStorage.status(metadata);
                console.loglog(status);
                console.log(metadata);

                const assetUrl = `https://${metadata.ipnft}.ipfs.dweb.link/${CARD_TITLE}.png`;

                console.log(assetUrl);

                await this.sleep(1000);

                const params = await this.algod.getTransactionParams().do();
                const assetName = `AFRCTL#${CARD_TITLE}`;

                const create_frctl_txn =
                    algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
                        from: creatorWallet,
                        assetName: assetName,
                        unitName: "AFRCTL",
                        total: 1,
                        decimals: 0,
                        assetURL: assetUrl,
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
                        manager: creatorWallet,
                        suggestedParams: {
                            ...params,
                        },
                    });
                const fee_txn =
                    algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                        from: creatorWallet,
                        to: "NPRGKVTDZBW7WEGLX4OB4RMP4PIJV5RW5WWE3MJO4INIKHINA2OGEWENQA",
                        amount: 0.5 * 1e6,
                        note: new TextEncoder("utf-8").encode(title),
                        suggestedParams: {
                            ...params,
                        },
                    });
                const txnsToGroup = [create_frctl_txn, fee_txn];
                console.log(JSON.stringify(txnsToGroup));
                const groupID = algosdk.computeGroupID(txnsToGroup);
                for (let i = 0; i < 2; i++) txnsToGroup[i].group = groupID;

                const signedTxns = await this.wallet.signTransaction(
                    txnsToGroup.map((txn) => txn.toByte())
                );

                // Submit the transaction
                let tx = await this.algod.sendRawTransaction(signedTxns);
            } catch (e) {
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
