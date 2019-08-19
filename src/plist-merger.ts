import * as _ from "lodash";
import { Reporter, IPlistMerger, ICFBundleURLType } from "../index";

export interface Options {
    overwriteCfBundleUrlTypes?: boolean;
}

export class PlistMerger implements IPlistMerger {
    private static CFBBUNDLEURLTYPES = "CFBundleURLTypes";
    private static LSAPPLICATIONQUERIESSCHEMES = "LSApplicationQueriesSchemes";

    constructor(
        private console: Reporter,
        private options: Options
    ) { }

    public merge(base: any, patch: any): any {
        const baseClone = _.cloneDeep(base);
        _.mergeWith(baseClone, patch, this.customizer.bind(this));
        return baseClone;
    }

    private mergeCFBundleURLTypes(baseValue: ICFBundleURLType[], patchValue: ICFBundleURLType[]): ICFBundleURLType[] {
        if (this.options && this.options.overwriteCfBundleUrlTypes === true) {
            return patchValue;
        }

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

    private mergeLSApplicationQueriesSchemes(baseValue: string[], patchValue: string[]): string[] {
        for (let patchElement of patchValue) {
            if (!baseValue.some(x => x === patchElement)) {
                baseValue.push(patchElement);
            }
        }

        return baseValue;
    }

    private customizer(baseValue: any, patchValue: any, key: string) {
        if (key === PlistMerger.CFBBUNDLEURLTYPES && !!baseValue) {
            return this.mergeCFBundleURLTypes(baseValue, patchValue);
        } else if (key === PlistMerger.LSAPPLICATIONQUERIESSCHEMES && !!baseValue) {
            return this.mergeLSApplicationQueriesSchemes(baseValue, patchValue);
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
