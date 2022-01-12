<template>
    <div class="flex h-screen">
        <div
            class="card md:w-1/3 w-full m-auto text-center shadow-2xl rounded-lg border-4 border-black bg-black"
        >
            <figure class="grid justify-center mt-5">
                <Fractals class="rounded-lg border-4" />
                <br />
                <p class="text-gray-500 italic text-sm">
                    Simply reload the page if you want to generate another
                    fractal image
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
                    (position and zoom). Minting cost includes additional 0.1
                    Algo as a fee to creator of AlgoFractals.
                </p>

                <div class="justify-center card-actions">
                    <button
                        v-if="!isConnected"
                        class="btn btn-outline btn-accent"
                        :onclick="connectWallet"
                    >
                        Connect Algorand Wallet
                    </button>
                    <div v-else-if="isConnected">
                        <button class="btn mr-5 btn btn-accent" :onclick="mint">
                            Mint
                        </button>
                        <button
                            class="btn btn-outline btn-accent"
                            :onclick="logout"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Fractals from "@/components/Fractals.vue";
import algosdk from "algosdk";
import MyAlgoConnect from "@randlabs/myalgo-connect";
import { create } from "ipfs-http-client";

export default {
    components: { Fractals },
    data: () => ({
        wallet: undefined,
        accountsSharedByUser: [],
        isConnected: false,
        accounts: [],
        address: undefined,
    }),
    mounted() {},
    methods: {
        async connectWallet() {
            try {
                const wallet = new MyAlgoConnect();
                const accountsSharedByUser = await wallet.connect();
                this.wallet = wallet;
                this.accountsSharedByUser = accountsSharedByUser;
                this.isConnected = true;
            } catch (e) {
                console.log(e);
                this.isConnected = false;
            }
        },

        async mint() {
            const client = create("http://dweb.link:5002");

            const { cid } = await client.add("Hello world!");
            console.log(cid);

            const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject(
                {
                    from: document.getElementById("from").value,
                    assetName: document.getElementById("name").value,
                    unitName: document.getElementById("unit-name").value,
                    total: +document.getElementById("total").value,
                    decimals: +document.getElementById("decimals").value,
                    note: AlgoSigner.encoding.stringToByteArray(
                        document.getElementById("note").value
                    ),
                    suggestedParams: { ...txParamsJS },
                }
            );
        },

        async logout() {
            this.wallet = new MyAlgoConnect();
            this.isConnected = false;
        },
    },
};
</script>
