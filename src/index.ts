import * as plist from "plist";
import { PlistMerger, IPlistMerger } from "./plist-merger";

export interface Reporter {
    log?(msg: string): void;
    warn?(msg: string): void;
}

export interface Patch {
    name: string;
    read(): string;
}

export class PlistSession {
    private patches: Patch[];

    constructor(private console: Reporter) {
        this.patches = [];
    }

    public patch(patch: Patch) {
        this.patches.push(patch);
    }

    public build(): string {
        this.log(`Start`);
        const plistMerger: IPlistMerger = new PlistMerger(this.console);
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
