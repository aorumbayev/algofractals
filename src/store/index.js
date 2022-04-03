import { createStore } from "vuex";

// Create a new store instance.
export const store = createStore({
    state() {
        return {
            algorandWallet: undefined,
        };
    },
    mutations: {
        increment(state) {
            state.count++;
        },
    },
});
