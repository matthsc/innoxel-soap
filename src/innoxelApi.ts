import * as requestPromise from "request-promise-native";
import { EndpointError, NetworkError, ResponseTagError } from "./errors";
import type {
  IDeviceStatusResponse,
  IGetIdentitiesResponse,
  IGetStateResponse,
  IModuleBase,
  IModuleRoomClimate,
  IModuleWeather,
  IWeatherData,
  ModuleClass,
  ModuleIdentityType,
  ModuleInEvent,
  ModuleOutEvent,
  ModuleRoomClimateSetType,
} from "./model";
import { asArray, getResponseTag, parseXml } from "./requestHelper";
import { SoapMessage } from "./soapMessage";
import type request from "request";

export type SoapLogger = (status: string | number, message: string) => void;

/**
 * Options object for InnoxelApi class
 */
export interface IInnoxelApiOptions {
  /** ip address of innoxel master */
  ip: string;
  /** innoxel master html port (default: 5001) */
  port?: number;
  /** user name  */
  user: string;
  /** password */
  password: string;
  /** logging for soap messages sent to/from innoxel master */
  soapLogger?: SoapLogger;
}

/**
 * Class to interact with innoxel master
 */
export class InnoxelApi {
  /** innoxel master endpoint url */
  private readonly endpoint: string;
  /** logging for soap messages sent to/from innoxel master */
  private readonly soapLogger?: SoapLogger;
  /** request-promise-native object with default options applied */
  private readonly request: requestPromise.RequestPromiseAPI;
  /** perf: save headers for retrieval of boot and state ids */
  private readonly getIdsMessageHeader: request.Headers;
  /** perf: save body for retrieval of boot and state ids */
  private readonly getIdsMessageContent: string;

  /** initialize the object */
  public constructor(options: IInnoxelApiOptions) {
    // perf: save header and body for boot/state id retrieval
    const message = new SoapMessage("getState", true);
    this.getIdsMessageHeader = message.getHeaders();
    this.getIdsMessageContent = message.getMessage();

    // prepare endpoint url
    this.endpoint = `http://${options.ip}:${options.port ?? 5001}/control`;

    // prepare request-promise-native object
    this.request = requestPromise.defaults({
      auth: {
        user: options.user,
        password: options.password,
        sendImmediately: false,
      },
      resolveWithFullResponse: true,
      simple: false,
    });

    this.soapLogger = options.soapLogger;
  }

  /** helper method for posting messages to innoxel master */
  private async postRawMessage(
    headers: request.Headers,
    body: string,
  ): Promise<string> {
    let response: requestPromise.FullResponse;
    try {
      this.soapLogger?.("POST", body);
      response = await this.request.post(this.endpoint, {
        headers,
        body,
      });
    } catch (err: unknown) {
      throw new NetworkError(err as Error);
    }

    this.soapLogger?.(response.statusCode, response.body);

    if (response.statusCode !== 200)
      throw new EndpointError(response.statusCode, response.body);

    return response.body as string;
  }

  /** helper method for posting messages to innoxel master and parsing the returned xml */
  public async postMessage<T>(message: SoapMessage): Promise<T> {
    const xml = await this.postRawMessage(
      message.getHeaders(),
      message.getMessage(),
    );

    const body = parseXml<{ [tag: string]: T }>(xml);
    const responseTag = getResponseTag(message.action);
    if (!body[responseTag]) throw new ResponseTagError(message.action, body);
    return body[responseTag];
  }

  /** get current boot and state id response xml */
  public getBootAndStateIdXml(): Promise<string> {
    return this.postRawMessage(
      this.getIdsMessageHeader,
      this.getIdsMessageContent,
    );
  }

  /**
   * get current boot and state ids
   * @param rawXml if given parses the xml for the ids, otherwise makes a request to innoxel master
   * @returns a promise containing the [bootId, stateId] tuple
   */
  public async getBootAndStateIds(rawXml?: string): Promise<[string, string]> {
    const xml = rawXml ?? (await this.getBootAndStateIdXml());
    const responseObj = parseXml<{ getStateResponse: IGetStateResponse }>(xml);
    const stateResponse = responseObj.getStateResponse;
    return [stateResponse.bootId, stateResponse.stateId];
  }

  /**
   * get current device state of innoxel master
   *
   * requires administrator privileges
   */
  public async getDeviceState(): Promise<IDeviceStatusResponse> {
    const message = new SoapMessage("getDeviceStateList");
    return await this.postMessage<IDeviceStatusResponse>(message);
  }

  /**
   * get identity information for all modules
   */
  public async getIdentities(): Promise<ModuleIdentityType[]> {
    const message = new SoapMessage("getIdentity");
    for (const moduleClass of [
      "masterInModule",
      "masterOutModule",
      "masterDimModule",
    ] as ModuleClass[])
      message.addModuleWithChannels(moduleClass, -1, [-1]);
    message.addThermostats([-1]);
    const response = await this.postMessage<IGetIdentitiesResponse>(message);
    return response.moduleList.module;
  }

  /** get weather module data */
  public async getWeather(): Promise<IModuleWeather> {
    const message = new SoapMessage("getState");
    message.addWeatherModule();
    const response = await this.postMessage<IGetStateResponse>(message);
    return response.moduleList.module as IModuleWeather;
  }

  /** get room climate data */
  public async getRoomClimate(
    moduleIds: number[],
  ): Promise<IModuleRoomClimate[]> {
    const message = new SoapMessage("getState");
    message.addThermostats(moduleIds);
    const response = await this.postMessage<IGetStateResponse>(message);
    return asArray(response.moduleList.module) as IModuleRoomClimate[];
  }

  /** get module state data */
  public async getModuleStates(): Promise<IModuleBase[]> {
    const message = new SoapMessage("getState");
    message.addModuleWithChannels("masterInModule", -1, [-1]);
    message.addModuleWithChannels("masterOutModule", -1, [-1]);
    message.addModuleWithChannels("masterDimModule", -1, [-1]);
    const response = await this.postMessage<IGetStateResponse>(message);
    return asArray(response.moduleList.module);
  }

  /**
   * trigger a push button
   * @param moduleIndex index of the module
   * @param channel index of the channel within the module
   * @param event trigger type, defaults to autoImpulse
   */
  public async triggerPushButton(
    moduleIndex: number,
    channel: number,
    event: ModuleInEvent = "autoImpulse",
  ): Promise<void> {
    const message = new SoapMessage("setState");
    message.addModuleInAction(moduleIndex, channel, event);
    await this.postMessage<IGetStateResponse>(message);
  }

  /**
   * trigger an Out module
   * @param moduleIndex index of the module
   * @param channel index of the channel within the module
   * @param event trigger type, defaults to autoImpulse
   */
  public async triggerOutModule(
    moduleIndex: number,
    channel: number,
    event: ModuleOutEvent = "toggle",
  ): Promise<void> {
    const message = new SoapMessage("setState");
    message.addModuleOutAction(moduleIndex, channel, event);
    await this.postMessage(message);
  }

  /**
   * set the value of a dimmer
   * @param moduleIndex index of the module
   * @param channel index of the channel within the module
   * @param dimValue dimmer value (0-100)
   * @param dimSpeed dimming speed (0-15))
   */
  public async setDimValue(
    moduleIndex: number,
    channel: number,
    dimValue: number,
    dimSpeed = 0,
  ): Promise<void> {
    const message = new SoapMessage("setState");
    message.addModuleDimAction(moduleIndex, channel, dimValue, dimSpeed);
    await this.postMessage<IGetStateResponse>(message);
  }

  /**
   * set the temperature of a room climate module
   * @param moduleIndex index of the module
   * @param type type of temperature to set
   * @param temperature temperature to set
   */
  public async setRoomClimate(
    moduleIndex: number,
    type: ModuleRoomClimateSetType,
    temperature: number,
  ) {
    const message = new SoapMessage("setState");
    message.addModuleRoomClimateAction(moduleIndex, type, temperature);
    const response = await this.postMessage<IGetStateResponse>(message);
    const module = response.moduleList.module as IModuleRoomClimate;
    const data = module.thermostat[type] as IWeatherData;
    return data.value;
  }
}
