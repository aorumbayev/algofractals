import FWorker from "../services/fworker.js?worker";
import Interactions from "../services/interactions";
import algosdk from "algosdk";

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

export default {
    props: ["value"],
    methods: {
        draw() {
            this.$emit("progress", true);
            this.interactions.unbind();

            const context = this.$el.getContext("2d");
            const params = this.getState();
            const image = context.createImageData(500, 500);
            this.fworker.postMessage({ image, params });
        },
    },
    mounted() {
        this.fworker = new FWorker();

        this.fworker.onmessage = (e) => {
            const context = this.$el.getContext("2d");
            context.putImageData(e.data.image, 0, 0);

            context.fillStyle = "white";
            context.strokeStyle = "black";
            context.strokeWidth = 15;

            context.font = "15pt AvenirNext-Bold";
            var random_postfix = cyrb53(algosdk.generateAccount().addr);
            var textString = "AlgoFractal NFT";
            var textWidth = context.measureText(textString).width;
            context.fillText(textString, 500 / 2 - textWidth / 2, 30);
            context.strokeText(textString, 500 / 2 - textWidth / 2, 30);

            textString = "#" + random_postfix;
            textWidth = context.measureText(textString).width;
            context.fillText(textString, 500 / 2 - textWidth / 2, 480);
            context.strokeText(textString, 500 / 2 - textWidth / 2, 480);

            this.$emit("stat", e.data.stat);

            this.interactions.bind();
            this.$emit("progress", false);
        };

        this.interactions = Interactions.create(this.$el, {
            move: (dx, dy) => {
                if (!dx && !dy) return;
                this.changeState(({ x, y, zoom: z }) => ({
                    x: x - dx / z,
                    y: y + dy / z,
                }));
            },
            zoomIn: () => {
                this.changeState(({ zoom }) => ({ zoom: zoom * 1.5 }));
            },
            zoomOut: () => {
                this.changeState(({ zoom }) => ({ zoom: zoom / 1.5 }));
            },
        });
        this.draw();
    },
    beforeDestroy() {
        this.fworker.terminate();
    },
};
