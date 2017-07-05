import * as _ from "lodash";
import { Reporter } from "./index"

export class PlistMerger implements IPlistMerger {
    private static CFBBUNDLEURLTYPES = "CFBundleURLTypes";

    constructor(private console: Reporter) { }

    public merge(base: any, patch: any): any {
        const baseClone = _.cloneDeep(base);
        _.mergeWith(baseClone, patch, this.customizer.bind(this));
        return baseClone;
    }

    private mergeCFBundleURLTypes(baseValue: ICFBundleURLType[], patchValue: ICFBundleURLType[]): ICFBundleURLType[] {
        for (let patchElement of patchValue) {
            let shouldAddToBase = true;
            for (let baseElement of baseValue) {
                if (!patchElement.CFBundleTypeRole || !baseElement.CFBundleTypeRole) {
                    this.warn(`Merging ${PlistMerger.CFBBUNDLEURLTYPES}: Property CFBundleTypeRole is required!`);
                }

                if (patchElement.CFBundleTypeRole === baseElement.CFBundleTypeRole) {
                    baseElement.CFBundleURLSchemes = baseElement.CFBundleURLSchemes.concat(patchElement.CFBundleURLSchemes);
                    shouldAddToBase = false;
                }
            }

            if (shouldAddToBase) {
                baseValue.push(patchElement);
            }
        }

        return baseValue;
    }

    private customizer(baseValue: any, patchValue: any, key: string) {
        if (key === PlistMerger.CFBBUNDLEURLTYPES && !!baseValue) {
            return this.mergeCFBundleURLTypes(baseValue, patchValue);
        }

        if (_.isArray(baseValue)) {
            return patchValue;
        }
    }

    private warn(msg: string) {
        if (this.console && this.console.warn) {
            this.console.warn(msg);
        }
    }
}

export interface IPlistMerger {
    merge(base: any, patch: any): any
}

export interface ICFBundleURLType {
    CFBundleTypeRole: string;
    CFBundleURLSchemes: string[];
}
