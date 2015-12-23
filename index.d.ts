export interface Reporter {
	log?(msg: string): void;
}

export interface Patch {
	name: string,
	read(): string	
}

export class PlistSession {
	constructor(console: Reporter);
	public load(patch: Patch): void;
	public patch(patch: Patch): void;
	public build(): string;
}
