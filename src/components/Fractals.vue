<template>
    <div class="container">
        <FdrawR
            v-model="params"
            @progress="progress"
            @stat="stat = $event"
        ></FdrawR>
    </div>
</template>

<script>
import FdrawR from "@/components/fdraw/components/FdrawR.vue";
import getColor from "@/components/fdraw/services/getColor.js";
export default {
    components: { FdrawR },
    data: () => ({
        params: {
            width: 320,
            height: 440,
            x: -1.37215516,
            y: 0.0109641665,
            zoom: 498788,
            resolution: 2000,
            palette: getColor.wk,
        },
        drawing: "",
        stat: [],
        palette: getColor.wk,
    }),
    computed: {
        selectedPalette() {
            switch (this.params.palette) {
                case getColor.bw:
                    return "bw";
                case getColor.wb:
                    return "wb";
                case getColor.rb:
                    return "rb";
                case getColor.wk:
                    return "wk";
                default:
                    return "custom";
            }
        },
    },
    methods: {
        selectPalette(event) {
            const palette = getColor[event.target.value];
            this.params = { ...this.params, palette };
            this.palette = palette;
        },
        pushToImmutable(key, event) {
            const n = +event.target.value;
            if (!isNaN(n) && n > 0) {
                this.params = { ...this.params, [key]: n };
            }
        },
        progress(event) {
            this.drawing = event ? "Drawing..." : "[+] [-] drag pinch";
        },
    },
};
</script>
