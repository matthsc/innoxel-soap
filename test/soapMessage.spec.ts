import { SoapMessage } from "../src/soapMessage";
import type { ModuleRoomClimateSetType } from "../src/model";

describe("SoapMessage", () => {
  it("generates correct headers", () => {
    const msg = new SoapMessage("getState");
    const headers = msg.getHeaders();
    assert.equal(headers.get("Content-Type"), 'text/xml; charset="utf-8"');
    assert.equal(
      headers.get("soapaction"),
      "urn:innoxel-ch:service:noxnetRemote:1#getState",
    );
  });

  it("throws error for unsupported actions in addModuleWithChannels", () => {
    const msg = new SoapMessage("setState");
    assert.throws(() => msg.addModuleWithChannels("masterInModule", 0, [0]));
  });

  it("throws error for unsupported actions in addThermostats", () => {
    const msg = new SoapMessage("setState");
    assert.throws(() => msg.addThermostats([0]));
  });

  it("throws error for unsupported actions in addModuleInAction", () => {
    const msg = new SoapMessage("getState");
    assert.throws(() => msg.addModuleInAction(0, 0));
  });

  it("throws error for unsupported actions in addModuleDimAction", () => {
    const msg = new SoapMessage("getState");
    assert.throws(() => msg.addModuleDimAction(0, 0, 100, 0));
  });

  it("throws error for unsupported actions in addModuleOutAction", () => {
    const msg = new SoapMessage("getState");
    assert.throws(() => msg.addModuleOutAction(0, 0));
  });

  it("clips dimValue and dimSpeed", () => {
    const msg = new SoapMessage("setState");
    msg.addModuleDimAction(0, 0, 110, 20);
    msg.addModuleDimAction(0, 1, -10, -5);
    const xml = msg.getMessage();
    assert.include(xml, 'dimValue="100" dimSpeed="15"');
    assert.include(xml, 'dimValue="0" dimSpeed="0"');
  });

  it("throws error for invalid room climate type", () => {
    const msg = new SoapMessage("setState");
    assert.throws(() =>
      msg.addModuleRoomClimateAction(
        0,
        "invalid" as unknown as ModuleRoomClimateSetType,
        21,
      ),
    );
  });

  it("rounds temperature in addModuleRoomClimateAction", () => {
    const msg = new SoapMessage("setState");
    msg.addModuleRoomClimateAction(0, "setTemperatureHeating", 21.23);
    const xml = msg.getMessage();
    assert.include(xml, 'value="21"');

    const msg2 = new SoapMessage("setState");
    msg2.addModuleRoomClimateAction(0, "setTemperatureHeating", 21.3);
    assert.include(msg2.getMessage(), 'value="21.5"');
  });

  it("includes boot and state ids if requested", () => {
    const msg = new SoapMessage("getState", true);
    const xml = msg.getMessage();
    assert.include(xml, "<u:bootId />");
    assert.include(xml, "<u:stateId />");
  });

  it("adds room temperature modules", () => {
    const msg = new SoapMessage("getState");
    msg.addRoomTemperatureModules([1, 2]);
    const xml = msg.getMessage();
    assert.include(
      xml,
      '<u:module class="masterInModule" index="1"><u:roomTemperature /></u:module>',
    );
    assert.include(
      xml,
      '<u:module class="masterInModule" index="2"><u:roomTemperature /></u:module>',
    );
  });
});
