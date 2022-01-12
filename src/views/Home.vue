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
                        :onclick="mint"
                    >
                        Connect MyAlgo Wallet
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
import { NFTStorage, File } from "nft.storage";
import MyAlgoConnect from "@randlabs/myalgo-connect";

function sharpen(ctx, w, h, mix) {
    var weights = [0, -1, 0, -1, 5, -1, 0, -1, 0],
        katet = Math.round(Math.sqrt(weights.length)),
        half = (katet * 0.5) | 0,
        dstData = ctx.createImageData(w, h),
        dstBuff = dstData.data,
        srcBuff = ctx.getImageData(0, 0, w, h).data,
        y = h;

    while (y--) {
        x = w;

        while (x--) {
            var sy = y,
                sx = x,
                dstOff = (y * w + x) * 4,
                r = 0,
                g = 0,
                b = 0,
                a = 0;

            for (var cy = 0; cy < katet; cy++) {
                for (var cx = 0; cx < katet; cx++) {
                    var scy = sy + cy - half;
                    var scx = sx + cx - half;

                    if (scy >= 0 && scy < h && scx >= 0 && scx < w) {
                        var srcOff = (scy * w + scx) * 4;
                        var wt = weights[cy * katet + cx];

                        r += srcBuff[srcOff] * wt;
                        g += srcBuff[srcOff + 1] * wt;
                        b += srcBuff[srcOff + 2] * wt;
                        a += srcBuff[srcOff + 3] * wt;
                    }
                }
            }

            dstBuff[dstOff] = r * mix + srcBuff[dstOff] * (1 - mix);
            dstBuff[dstOff + 1] = g * mix + srcBuff[dstOff + 1] * (1 - mix);
            dstBuff[dstOff + 2] = b * mix + srcBuff[dstOff + 2] * (1 - mix);
            dstBuff[dstOff + 3] = srcBuff[dstOff + 3];
        }
    }

    ctx.putImageData(dstData, 0, 0);
}

function resample_single(canvas, width, height, resize_canvas) {
    var width_source = canvas.width;
    var height_source = canvas.height;
    width = Math.round(width);
    height = Math.round(height);

    var ratio_w = width_source / width;
    var ratio_h = height_source / height;
    var ratio_w_half = Math.ceil(ratio_w / 2);
    var ratio_h_half = Math.ceil(ratio_h / 2);

    var ctx = canvas.getContext("2d");
    var img = ctx.getImageData(0, 0, width_source, height_source);
    var img2 = ctx.createImageData(width, height);
    var data = img.data;
    var data2 = img2.data;

    for (var j = 0; j < height; j++) {
        for (var i = 0; i < width; i++) {
            var x2 = (i + j * width) * 4;
            var weight = 0;
            var weights = 0;
            var weights_alpha = 0;
            var gx_r = 0;
            var gx_g = 0;
            var gx_b = 0;
            var gx_a = 0;
            var center_y = (j + 0.5) * ratio_h;
            var yy_start = Math.floor(j * ratio_h);
            var yy_stop = Math.ceil((j + 1) * ratio_h);
            for (var yy = yy_start; yy < yy_stop; yy++) {
                var dy = Math.abs(center_y - (yy + 0.5)) / ratio_h_half;
                var center_x = (i + 0.5) * ratio_w;
                var w0 = dy * dy; //pre-calc part of w
                var xx_start = Math.floor(i * ratio_w);
                var xx_stop = Math.ceil((i + 1) * ratio_w);
                for (var xx = xx_start; xx < xx_stop; xx++) {
                    var dx = Math.abs(center_x - (xx + 0.5)) / ratio_w_half;
                    var w = Math.sqrt(w0 + dx * dx);
                    if (w >= 1) {
                        //pixel too far
                        continue;
                    }
                    //hermite filter
                    weight = 2 * w * w * w - 3 * w * w + 1;
                    var pos_x = 4 * (xx + yy * width_source);
                    //alpha
                    gx_a += weight * data[pos_x + 3];
                    weights_alpha += weight;
                    //colors
                    if (data[pos_x + 3] < 255)
                        weight = (weight * data[pos_x + 3]) / 250;
                    gx_r += weight * data[pos_x];
                    gx_g += weight * data[pos_x + 1];
                    gx_b += weight * data[pos_x + 2];
                    weights += weight;
                }
            }
            data2[x2] = gx_r / weights;
            data2[x2 + 1] = gx_g / weights;
            data2[x2 + 2] = gx_b / weights;
            data2[x2 + 3] = gx_a / weights_alpha;
        }
    }
    //clear and resize canvas
    if (resize_canvas === true) {
        canvas.width = width;
        canvas.height = height;
    } else {
        ctx.clearRect(0, 0, width_source, height_source);
    }

    //draw
    ctx.putImageData(img2, 0, 0);
}

export default {
    components: { Fractals },
    data: () => ({
        wallet: undefined,
        accountsSharedByUser: [],
        isConnected: false,
        accounts: [],
        nftStorage: new NFTStorage({
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDA4Mzg1NTIzN0NBRWY0YThBZWNCNDNlZjU5Y0JhNjQ3MUY3NTVFYTQiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY0MTk1ODE2OTU2NSwibmFtZSI6ImFsZ29mcmFjdGFscyJ9.YhrtQOUNr-8yMhMgd8OmorKLRdjFXGtP5OaA5bqDcVs",
        }),
        address: undefined,
    }),
    mounted() {},
    methods: {
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
                this.isConnected = true;
            } catch (e) {
                console.log(e);
                this.isConnected = false;
            }
        },

        // getContext(canvas) {
        //     var dpr = window.devicePixelRatio || 1;
        //     // Get the size of the canvas in CSS pixels.
        //     var rect = canvas.getBoundingClientRect();
        //     // Give the canvas pixel dimensions of their CSS
        //     // size * the device pixel ratio.
        //     canvas.width = rect.width * dpr;
        //     canvas.height = rect.height * dpr;
        //     var ctx = canvas.getContext("2d");
        //     // Scale all drawing operations by the dpr, so you
        //     // don't have to worry about the difference.
        //     ctx.scale(dpr, dpr);
        //     return ctx;
        // },

        async mint() {
            var canvas = document.getElementById("fractalsCanvas");
            console.log(canvas.getContext);
            if (canvas.getContext && this.isConnected) {
                var ctx = canvas.getContext("2d");
                sharpen(ctx, 1500, 1500, 0.8, true);

                window.devicePixelRatio = 2;
                console.log(ctx);

                const title = `algofractal_${this.accountsSharedByUser[0]["address"]}`;
                var myImage = canvas.toDataURL("image/png");
                var file = this.dataURLtoFile(myImage, title + ".png");
                console.log(file);

                const metadata = await this.nftStorage.store({
                    name: title,
                    description: "A randomly generated fractal NFT on Algorand",
                    image: file,
                });
                console.log(metadata.url);
            }

            // const { cid } = await client.add("Hello world!");
            // console.log(cid);

            // const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject(
            //     {
            //         from: document.getElementById("from").value,
            //         assetName: document.getElementById("name").value,
            //         unitName: document.getElementById("unit-name").value,
            //         total: +document.getElementById("total").value,
            //         decimals: +document.getElementById("decimals").value,
            //         note: AlgoSigner.encoding.stringToByteArray(
            //             document.getElementById("note").value
            //         ),
            //         suggestedParams: { ...txParamsJS },
            //     }
            // );
        },

        async logout() {
            this.wallet = new MyAlgoConnect();
            this.isConnected = false;
        },
    },
};
</script>
