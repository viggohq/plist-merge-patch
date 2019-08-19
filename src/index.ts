import * as plist from "plist";
import { PlistMerger, Options } from "./plist-merger";
import * as types from "../index";

export class PlistSession implements types.PlistSession {
    private patches: types.Patch[];

    constructor(
        private console: types.Reporter,
        private options: Options = null
    ) {
        this.patches = [];
    }

    public patch(patch: types.Patch) {
        this.patches.push(patch);
    }

    public build(): string {
        this.log(`Start`);
        const plistMerger: types.IPlistMerger = new PlistMerger(this.console, this.options);
        let jsonPlist: any = {};

        if (this.patches) {
            this.patches.forEach(patch => {
                this.log(`Patch '${patch.name}'`);
                const patchString = patch.read();
                const patchJson = plist.parse(patchString);
                jsonPlist = plistMerger.merge(jsonPlist, patchJson);
            });
        }

        const resultString = plist.build(jsonPlist);
        this.log(`Complete`);
        return resultString;
    }

    private log(msg: string) {
        if (this.console && this.console.log) {
            this.console.log(msg);
        }
    }
}
