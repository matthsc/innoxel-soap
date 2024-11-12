import {
  getIdentityResponseMasterDimModule,
  getIdentityResponseMasterInModule,
  getIdentityResponseMasterOutModule,
} from "./mock.constants";
import { XMLValidator } from "fast-xml-parser";
import { mergeModuleLists } from "./testHelper";

describe("testHelper", () => {
  describe("mergeModuleLists", () => {
    it("returns empty string if no responses given", () => {
      assert.equal(mergeModuleLists(), "");
    });

    it("returns same string if only one response given", () => {
      assert.equal(
        mergeModuleLists(getIdentityResponseMasterOutModule),
        getIdentityResponseMasterOutModule,
      );
    });

    it("merges 2 module lists", () => {
      const merged = mergeModuleLists(
        getIdentityResponseMasterOutModule,
        getIdentityResponseMasterInModule,
      );
      assert.notEqual(merged, getIdentityResponseMasterOutModule);
      assert.notEqual(merged, getIdentityResponseMasterInModule);
      assert.include(merged, "moduleList");
      assert.include(merged, "masterOutModule");
      assert.include(merged, "masterInModule");
      assert.isTrue(XMLValidator.validate(merged));
    });

    it("merges 3 module lists", () => {
      const merged = mergeModuleLists(
        getIdentityResponseMasterOutModule,
        getIdentityResponseMasterInModule,
        getIdentityResponseMasterDimModule,
      );
      assert.notEqual(merged, getIdentityResponseMasterOutModule);
      assert.notEqual(merged, getIdentityResponseMasterInModule);
      assert.notEqual(merged, getIdentityResponseMasterDimModule);
      assert.include(merged, "moduleList");
      assert.include(merged, "masterOutModule");
      assert.include(merged, "masterInModule");
      assert.include(merged, "masterDimModule");
      assert.isTrue(XMLValidator.validate(merged));
    });
  });
});
