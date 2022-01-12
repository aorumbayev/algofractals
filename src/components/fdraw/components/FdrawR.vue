<template>
    <canvas
        class="fcanvas"
        tabindex="-1"
        :width="state.width"
        :height="state.height"
    >
    </canvas>
</template>

<script>
/**
 * A 'read-only' component. Uses inner state.
 * The state is initialized from the props at the creation stage.
 */
import mixins from "./mixins.js";
import getColor from "../services/getColor.js";

const randomBetween = (min, max) =>
    min + Math.floor(Math.random() * (max - min + 1));

const randomFloatBetween = (min, max) =>
    Number((Math.random() * (max - min) + min).toFixed(17));

const x_range_array = [
    randomFloatBetween(-0.2439311283797881, -0.2163853181291392),
    randomFloatBetween(0.3104745670786038, -0.2163853181291392),
    randomFloatBetween(-0.6026157362569244, -0.4894324565141592),
    randomFloatBetween(-1.4482237632200827, -1.371053345213652),
];

const y_range_array = [
    randomFloatBetween(0.7961523263471894, 0.816811684035176),
    randomFloatBetween(0.5672025723472669, 0.6559485530546624),
    randomFloatBetween(-0.6289389067524114, -0.5440514469453375),
    randomFloatBetween(0.0385852090032155, -0.0192926045016077),
];

const range_pick = randomBetween(0, x_range_array.length - 1);

const optionsDefault = {
    width: 500,
    height: 500,
    x: x_range_array[range_pick],
    y: y_range_array[range_pick],
    zoom: randomBetween(1100, 11600),
    resolution: 10000,
    palette: getColor.bw,
};

export default {
    mixins: [mixins],
    methods: {
        changeState(cb) {
            this.state = { ...this.state, ...cb(this.state) };
            this.draw();
            this.$emit("input", this.state);
        },
    },
    created() {
        if (this.value && typeof this.value.palette === "string") {
            this.value.palette = getColor[this.value.palette];
        }
        this.state = { ...optionsDefault, ...this.value };
        this.getState = () => this.state;
        this.context.scale();
    },
};
</script>
