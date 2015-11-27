import * as assert from "assert";
import * as fs from "fs";
import * as plistmergepatch from "../src/index";
import * as path from "path";

describe("plist-merge-patch", function() {
  describe("in real case scenarios, can patch", function() {
    var base = "real-use-cases/";
    it("transport security to allow arbitrary loads", run(base + "transport-security-arbitrary-loads"));
    it("a limit on the supported interface orientations", run(base + "limit-supported-interface-orientations"));
    it("view controller status bar appearance, status bar style, and hidden", run(base + "status-bar-appearance-style-and-hidden"));
  })
});

interface TestInfo {
  base: string,
  patch: string[],
  app: string,
  expected: {
    plist: string,
    log?: string
  }
}

function run(root: string) {
  return () => {
    var folderPath = path.join(__dirname, root);
    var json = <TestInfo>require(path.join(folderPath, "test.json"));
    
    function readFile(file: string): string {
      return fs.readFileSync(path.join(folderPath, file)).toString();
    }
    
    function makePatch(name: string): plistmergepatch.Patch {
      return {
        name: name,
        read: () => readFile(name)
      }
    }
    
    var log: string = "";
    var tracer = {
      log: (msg: string) => { log += `log: ${msg}\n` },
      error: (msg: string) => { log += `error: ${msg}\n` }
    }
    
    var plist = new plistmergepatch.PlistSession(tracer);
    
    if (json.base) {
      plist.load(makePatch(json.base));
    }
    
    if (json.patch) {
      json.patch.forEach(name => plist.patch(makePatch(name)));
    }
    
    if (json.app) {
      plist.patch(makePatch(json.app));
    }
    
    var result = plist.build();
    var expectedPlist = readFile(json.expected.plist);
    
    // TODO: Implement a "plist equal".
    assert.equal(result, expectedPlist, "Plist Merge Patch failed to produce the expected result.");
    
    if (json.expected.log) {
      var expectedLog = readFile(json.expected.log);
      assert.equal(log, expectedLog, "Plist Merge Patch logging mismatched.");
    }
  }
}


