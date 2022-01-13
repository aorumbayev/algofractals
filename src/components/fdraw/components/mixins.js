import FWorker from "../services/fworker.js?worker";
import Interactions from "../services/interactions";
import { CARD_TITLE } from "../../../common/constants.js";
import getColor from "../services/getColor.js";

const FONTS = ["Spicy Rice", "Chicle", "Shrikhand"];

export default {
    props: ["value"],
    methods: {
        draw() {
            this.$emit("progress", true);
            this.interactions.unbind();

            const context = this.$el.getContext("2d");
            const params = this.getState();
            const image = context.createImageData(1400, 1400);
            this.fworker.postMessage({ image, params });
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
        getRandomFont() {
            return FONTS[Math.floor(Math.random() * FONTS.length)];
        },
    },
    mounted() {
        this.fworker = new FWorker();

        this.fworker.onmessage = (e) => {
            const context = this.$el.getContext("2d");
            context.putImageData(e.data.image, 0, 0);
            const params = this.getState();

            const randFill = getColor.bw[Math.floor(Math.random() * 9)];
            context.fillStyle = this.rgbToHex(
                randFill.r,
                randFill.g,
                randFill.b
            );
            context.strokeStyle = "black";

            context.lineWidth = 4;

            context.font = `50pt ${this.getRandomFont()}`;
            var random_postfix = CARD_TITLE;
            var textString = "AlgoFractals NFT";
            var textWidth = context.measureText(textString).width;
            context.fillText(textString, 40, 1360);
            context.strokeText(textString, 40, 1360);

            textString = "#" + random_postfix;
            context.font = `40pt ${this.getRandomFont()}`;
            textWidth = context.measureText(textString).width;
            context.fillText(textString, 1400 - 30 - textWidth, 70);
            context.strokeText(textString, 1400 - 30 - textWidth, 70);

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
