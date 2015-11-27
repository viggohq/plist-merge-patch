import * as plist from "plist"
import * as jsonmergepatch from "json-merge-patch"

export interface Reporter {
	log?(msg: string): void;
}

export interface Patch {
	name: string,
	read(): string	
}

export class PlistSession {
	private console: Reporter;
	
	private base: Patch;
	private patches: Patch[];
	
	constructor(console: Reporter) {
		this.console = console;
		this.patches = [];
	}
	
	public load(patch: Patch) {
		this.base = patch;
	}
	
	public patch(patch: Patch) {
		this.patches.push(patch);
	}
	
	public build(): string {
		this.log(`Plist-Merge-Patch: Start.`);
		var jsonPlist: any;
		
		if (this.base) {
			this.log(`Plist-Merge-Patch: Load: '${ this.base.name }'.`);
			var plistString = this.base.read();
			jsonPlist = plist.parse(plistString);
		} else {
			jsonPlist = {};
		}
		
		if (this.patches) {
			this.patches.forEach(patch => {
				this.log(`Plist-Merge-Patch: Patch '${ this.base.name }' with '${ patch.name }'.`);
				var patchString = patch.read();
				var patchJson = plist.parse(patchString);
				jsonPlist = jsonmergepatch.apply(jsonPlist, patchJson);		
			});
		}
		
		var resultString = plist.build(jsonPlist);
		this.log(`Plist-Merge-Patch: Complete.`);
		return resultString;
	}
	
	private log(msg: string) {
		if (this.console && this.console.log) {
			this.console.log(msg);
		}
	}
}
