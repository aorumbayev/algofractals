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

            <figure class="grid justify-center mt-5">
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
    CARD_TITLE,
    ALGOEXPLORER_API_URL,
    NFTSTORAGE_API_KEY,
} from "@/common/constants.js";
import { colors } from "@/services/fractal.js";

const randomFloatBetween = (min, max) =>
    Number((Math.random() * (max - min) + min).toFixed(17));

const FONTS = ["Spicy Rice", "Chicle", "Shrikhand"];
const COORDS = [
    {
        xCartMax: -0.6590666666666665,
        xCartMin: -0.8126666666666665,
        yCartMax: -0.1488,
        yCartMin: -0.24480000000000005,
    },
    {
        xCartMin: -0.7371466666666665,
        xCartMax: -0.7064266666666665,
        yCartMin: -0.20544,
        yCartMax: -0.18624000000000002,
    },
    {
        xCartMin: -0.7275781420765026,
        xCartMax: -0.7214509289617484,
        yCartMin: -0.19974295081967214,
        yCartMax: -0.1921888524590164,
    },
    {
        xCartMin: -0.7277980502732239,
        xCartMax: -0.7265692502732239,
        yCartMin: -0.19551265573770493,
        yCartMax: -0.19400183606557378,
    },
    {
        xCartMin: -0.9448196721311476,
        xCartMax: -0.17681967213114735,
        yCartMin: -1.1016393442622952,
        yCartMax: -0.1573770491803277,
    },
    {
        xCartMin: -0.021540983606557373,
        xCartMax: 0.7464590163934424,
        yCartMin: -1.043934426229508,
        yCartMax: -0.09967213114754125,
    },
    {
        xCartMin: 0.4201219672131147,
        xCartMax: 0.4508419672131147,
        yCartMin: -0.35588196721311494,
        yCartMax: -0.31811147540983625,
    },
    {
        xCartMin: -2.57,
        xCartMax: 1.2699999999999998,
        yCartMin: -2.360655737704918,
        yCartMax: 2.360655737704918,
    },
    {
        xCartMin: -1.3508944262295082,
        xCartMax: -1.3201744262295083,
        yCartMin: 0.049311475409836186,
        yCartMax: 0.08708196721311488,
    },
    {
        xCartMin: -1.3296254426229508,
        xCartMax: -1.3234814426229509,
        yCartMin: 0.057704918032787,
        yCartMax: 0.06525901639344275,
    },
];

const randomBetween = (min, max) =>
    min + Math.floor(Math.random() * (max - min + 1));

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
        drawing: "",
        stat: [],
        fractal: undefined,
    }),
    computed: {
        canvasSizeStyle() {
            var width =
                window.innerWidth > 600
                    ? 600 - 10
                    : window.innerWidth <= 400
                    ? window.innerWidth - 10
                    : 300 - 10;
            console.log("meee", width);
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
    async mounted() {
        this.algod = new algosdk.Algodv2("", ALGOEXPLORER_API_URL, "");
        const canvas = document.getElementById("fractal");
        this.fractal = new window.mandelbrotFractal.Fractal(canvas);
        const cords = COORDS[randomBetween(0, COORDS.length)];
        console.log(cords, "before");

        cords["xCartMin"] = randomFloatBetween(
            cords["xCartMin"],
            cords["xCartMax"] / 2
        );

        cords["xCartMax"] = randomFloatBetween(
            cords["xCartMin"] / 2,
            cords["xCartMax"]
        );

        cords["yCartMin"] = randomFloatBetween(
            cords["yCartMin"],
            cords["yCartMax"] / 2
        );

        cords["yCartMax"] = randomFloatBetween(
            cords["yCartMin"] / 2,
            cords["yCartMax"]
        );

        console.log(cords, "after");

        this.fractal.update({
            pxWidth: 600,
            pxHeight: 600,
            cords: COORDS[randomBetween(0, COORDS.length)],
            // zoomInPxPoint: {
            //     xPx: 1464, // e.g. 100
            //     yPx: 1800, // e.g. 100
            // },
        });

        var context = canvas.getContext("2d");

        const randFill = colors[Math.floor(Math.random() * 6)];
        context.fillStyle = this.rgbToHex(
            randFill["red"],
            randFill["green"],
            randFill["blue"]
        );
        context.strokeStyle = "black";

        context.lineWidth = 2;

        var randomFont = this.getRandomFont();

        context.font = `25pt ${randomFont}`;
        console.log(context.font);
        var random_postfix = CARD_TITLE;
        var textString = "AlgoFractals NFT";
        var textWidth = context.measureText(textString).width;
        context.fillText("", 15, 600 - 15);

        await this.sleep(1000);
        context.fillText(textString, 15, 600 - 15);
        context.strokeText(textString, 15, 600 - 15);

        textString = "#" + random_postfix;
        context.font = `20pt ${randomFont}`;
        console.log(context.font);
        textWidth = context.measureText(textString).width;
        context.fillText("", 600 - 10 - textWidth, 30);

        await this.sleep(1000);
        context.fillText(textString, 600 - 10 - textWidth, 30);
        context.strokeText(textString, 600 - 10 - textWidth, 30);
    },
    methods: {
        getRandomFont() {
            return FONTS[Math.floor(Math.random() * FONTS.length)];
        },
        componentToHex(c) {
            var hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        },
        rgbToHex(r, g, b) {
            return (
                "#" +
                this.componentToHex(r) +
                this.componentToHex(g) +
                this.componentToHex(b)
            );
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

                const assetUrl = `https://${metadata.ipnft}.ipfs.dweb.link/${CARD_TITLE}.png`;

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
