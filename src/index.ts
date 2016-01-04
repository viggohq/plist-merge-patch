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
	
	private patches: Patch[];
	
	constructor(console: Reporter) {
		this.console = console;
		this.patches = [];
	}
	
	public patch(patch: Patch) {
		this.patches.push(patch);
	}
	
	public build(): string {
		this.log(`Start`);
		var jsonPlist: any;
		
		jsonPlist = {};
		
		if (this.patches) {
			this.patches.forEach(patch => {
				this.log(`Patch '${ patch.name }'`);
				var patchString = patch.read();
				var patchJson = plist.parse(patchString);
				jsonPlist = jsonmergepatch.apply(jsonPlist, patchJson);		
			});
		}
		
		var resultString = plist.build(jsonPlist);
		this.log(`Complete`);
		return resultString;
	}
	
	private log(msg: string) {
		if (this.console && this.console.log) {
			this.console.log(msg);
		}
	}
}
