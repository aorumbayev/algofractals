// import { emitError } from "@/utils/errors";
// import eventBus from "@/utils/eventBus";
import MyAlgo from "@randlabs/myalgo-connect";

function NoAccounts() {
    return new Error("No accounts");
}

NoAccounts.prototype = Object.create(Error.prototype);

export class MyAlgoWallet {
    constructor() {
        this.myAlgoWallet = new MyAlgo();
        this.accountList = [];
    }

    async connect() {
        try {
            this.accountList = await this.myAlgoWallet.connect();
        } catch (e) {
            // emitError("Could not connect to myAlgo");
            throw e;
        }
    }

    // eslint-disable-next-line no-unused-vars
    async accounts(params) {
        if (this.accountList.length > 0) {
            return this.accountList;
        } else {
            emitError("Could not get information about accounts");
            throw new NoAccounts();
        }
    }
}
