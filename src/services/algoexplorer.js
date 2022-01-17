import { ALGOEXPLORER_API_URL } from "@/common/constants";

class AlgoExplorerAlgod {
    constructor() {
        this.url = ALGOEXPLORER_API_URL;
    }

    async get(path, throwException = true) {
        try {
            const response = await fetch(`${this.url}${path}`);
            if (response.status !== 200 && throwException) {
                throw new Error(response);
            }
            return await response.json();
        } catch (e) {
            if (throwException) {
                throw e;
            }
        }
    }

    async post(path, payload, headers = {}) {
        try {
            const response = await fetch(`${this.url}${path}`, {
                method: "POST",
                body: payload,
                headers,
            });
            if (response.status !== 200) {
                throw new Error(response);
            }
            return await response.json();
        } catch (e) {
            throw e;
        }
    }
}

export class AlgoExplorer {
    constructor() {
        this.algod = new AlgoExplorerAlgod();
    }
}

export const algoExplorerRaw = new AlgoExplorer();
