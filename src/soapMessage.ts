import {
  ModuleClass,
  ModuleInEvent,
  ModuleRoomClimateSetType,
  SoapAction,
} from "./model";
import request from "request";

/** helper method to create the soap envelope and body, inserting the given actions xml */
function createEnvelopeAndBody(actionXml: string): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
    <s:Body>
        ${actionXml}
    </s:Body>
</s:Envelope>`;
}

/** helper method to create a soap action */
function createSoapAction(
  action: SoapAction,
  moduleList: string,
  includeBootAndStateId?: boolean,
): string {
  return `
        <u:${action} xmlns:u="urn:innoxel-ch:service:noxnetRemote:1">
            ${includeBootAndStateId ? "<u:bootId />" : ""}
            ${includeBootAndStateId ? "<u:stateId />" : ""}
            ${moduleList}
        </u:${action}>`;
}

/** helper method to create a soap module list */
function createModuleList(modules: string[]): string {
  if (!modules || !modules.length) return "";

  return `
            <u:moduleList>
                ${modules.join("\r\n")}
            </u:moduleList>`;
}

/** helper method to create a soap module */
function createModule(
  className: ModuleClass,
  index: number,
  content = "",
): string {
  return `<u:module class="${className}" index="${index}">${content}</u:module>`;
}

/** class representing a soap message */
export class SoapMessage {
  private modules: string[] = [];

  /**
   * constructor
   * @param action soap action
   * @param includeBootAndStateId whether to include boot and state ids in the result
   */
  public constructor(
    public readonly action: SoapAction,
    public readonly includeBootAndStateId?: boolean,
  ) {}

  /** helper method to ensure that this instance does support the given actions */
  private ensureAction(...actions: SoapAction[]) {
    if (!actions.some((a) => a === this.action))
      throw new Error(
        `Error in SoapMessage#ensureAction: expected one of ${JSON.stringify(
          actions,
        )}, but found ${this.action}`,
      );
  }

  /**
   * @returns the http headers required for this soap message
   */
  public getHeaders(): request.Headers {
    return {
      "content-type": `text/xml; charset="utf-8"`,
      soapaction: "urn:innoxel-ch:service:noxnetRemote:1#" + this.action,
    };
  }

  /**
   * @returns the xml for this soap message
   */
  public getMessage(): string {
    const moduleList = createModuleList(this.modules);
    const action = createSoapAction(
      this.action,
      moduleList,
      this.includeBootAndStateId,
    );
    const message = createEnvelopeAndBody(action);
    return message;
  }

  /**
   * adds a module request to the soap message
   * @param className module class
   * @param index module index
   * @param content content to add for this module
   */
  public addModule(
    className: ModuleClass,
    index: number,
    content?: string,
  ): void {
    const moduleString = createModule(className, index, content);
    this.modules.push(moduleString);
  }

  /**
   * adds querying the weather module to this soap message
   */
  public addWeatherModule(): void {
    this.addModule("masterWeatherModule", -1);
  }

  /**
   * adds querying room temperature modules to this soap message
   * @param moduleIds module ids
   */
  public addRoomTemperatureModules(moduleIds: number[]): void {
    for (const index of moduleIds)
      this.addModule("masterInModule", index, "<u:roomTemperature />");
  }

  /**
   * adds querying one or multiple channels of a module to this soap message
   * @param className module class
   * @param moduleIndex module index
   * @param channelIds channel ids
   */
  public addModuleWithChannels(
    className: ModuleClass,
    moduleIndex: number,
    channelIds: number[],
  ): void {
    this.ensureAction("getState", "getIdentity");
    const channels = channelIds
      .map((index) => `<u:channel index="${index}" />`)
      .join();
    this.addModule(className, moduleIndex, channels);
  }

  /**
   * adds querying thermostat data to this soap message
   * @param ids thermostat ids
   */
  public addThermostats(ids: number[]): void {
    this.ensureAction("getState", "getIdentity");
    ids.forEach((index) =>
      this.addModule(
        "masterRoomClimateModule",
        index,
        this.action === "getIdentity"
          ? "<u:thermostat/>"
          : `
					<u:thermostat>
						<u:actualTemperatureMean />
						<u:setTemperatureHeating />
						<u:setTemperatureCooling />
						<u:nightSetbackTemperatureHeating />
						<u:nightSetbackTemperatureCooling />
						<u:absenceSetbackTemperatureHeating />
						<u:absenceSetbackTemperatureCooling />
					</u:thermostat>`,
      ),
    );
  }

  /**
   * adds triggering an In module to this soap message
   * @param moduleIndex module index
   * @param channel channel index
   * @param event event to trigger
   */
  public addModuleInAction(
    moduleIndex: number,
    channel: number,
    event: ModuleInEvent = "autoImpulse",
  ): void {
    this.ensureAction("setState");
    this.addModule(
      "masterInModule",
      moduleIndex,
      `<u:channel index="${channel}" perform="${event}" />`,
    );
  }

  /**
   * adds setting a dimmer to this soap message
   * @param moduleIndex module index
   * @param channel channel index
   * @param dimValue dim value (0-100)
   * @param dimSpeed dim speed (0-15)
   */
  public addModuleDimAction(
    moduleIndex: number,
    channel: number,
    dimValue: number,
    dimSpeed: number,
  ): void {
    this.ensureAction("setState");
    if (dimValue < 0) dimValue = 0;
    if (dimValue > 100) dimValue = 100;
    if (dimSpeed < 0) dimSpeed = 0;
    if (dimSpeed > 15) dimSpeed = 15;
    const content = `<u:channel index="${channel}" dimValue="${dimValue}" dimSpeed="${dimSpeed}"/>`;
    this.addModule("masterDimModule", moduleIndex, content);
  }

  /**
   * adds triggering an Out module to this soap message
   * @param moduleIndex module index
   * @param channel channel index
   * @param event event to trigger
   */
  public addModuleOutAction(
    moduleIndex: number,
    channel: number,
    event = "manualImpulse",
  ) {
    this.ensureAction("setState");
    this.addModule(
      "masterOutModule",
      moduleIndex,
      `<u:channel index="${channel}" perform="${event}" />`,
    );
  }

  /**
   * adds setting a thermostat temperature to this soap message
   * @param moduleIndex index of the module
   * @param type type of temperature to set
   * @param temperature temperature to set
   */
  public addModuleRoomClimateAction(
    moduleIndex: number,
    type: ModuleRoomClimateSetType,
    temperature: number,
  ) {
    if (
      !type.includes("setTemperature") &&
      !type.includes("SetbackTemperature")
    )
      throw new Error(`invalid type: ${type}`);

    this.ensureAction("setState");
    this.addModule(
      "masterRoomClimateModule",
      moduleIndex,
      `<u:thermostat><u:${type} value="${
        Math.round(temperature * 2) / 2
      }" /></u:thermostat>`,
    );
  }
}
