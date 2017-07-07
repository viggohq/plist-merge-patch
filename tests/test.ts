import * as assert from "assert";
import * as fs from "fs";
import * as plistmergepatch from "../src/index";
import * as path from "path";

describe("plist-merge-patch", function () {
    describe("in real case scenarios, can patch", function () {
        const base = "real-use-cases/";
        it("transport security to allow arbitrary loads", run(base + "transport-security-arbitrary-loads"));
        it("a limit on the supported interface orientations", run(base + "limit-supported-interface-orientations"));
        it("view controller status bar appearance, status bar style, and hidden", run(base + "status-bar-appearance-style-and-hidden"));
        it("location, when in usage, description message", run(base + "location-when-in-usage-message"));
        it("url types when both have the same type role", run(base + "url-types-same-type-role"));
        it("url types when they have different type role", run(base + "url-types-different-type-role"));
    });
});

interface TestInfo {
    base: string;
    patch: string[];
    app: string;
    expected: {
        plist: string;
        log?: string;
    };
}

function run(root: string) {
    return () => {
        const folderPath = path.join(__dirname, root);
        const json = <TestInfo>require(path.join(folderPath, "test.json"));

        function readFile(file: string): string {
            // We need to replace the CRLF with LF, or the tests will fail on Windows.
            return fs.readFileSync(path.join(folderPath, file)).toString().replace(/\r\n/g, "\n");
        }

        function makePatch(name: string): plistmergepatch.Patch {
            return {
                name: name,
                read: () => readFile(name)
            };
        }

        let log: string = "";
        const tracer = {
            log: (msg: string) => { log += `log: ${msg}\n`; },
            warn: (msg: string) => { log += `warn: ${msg}\n`; }
        };

        const plist = new plistmergepatch.PlistSession(tracer);

        if (json.patch) {
            json.patch.forEach(name => plist.patch(makePatch(name)));
        }

        const result = plist.build();
        const expectedPlist = readFile(json.expected.plist);

        // TODO: Implement a "plist equal".
        assert.equal(result, expectedPlist, "Plist Merge Patch failed to produce the expected result.");

        if (json.expected.log) {
            const expectedLog = readFile(json.expected.log);
            assert.equal(log, expectedLog, "Plist Merge Patch logging mismatched.");
        }
    };
}
