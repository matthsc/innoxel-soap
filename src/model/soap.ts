export type SoapAction =
  | "getState"
  | "setState"
  | "getIdentity"
  | "getDeviceStateList";

export type ModuleClass =
  | "masterWeatherModule"
  | "masterRoomClimateModule"
  | "masterInModule"
  | "masterOutModule"
  | "masterDimModule";

export type ModuleInEvent = "autoImpulse" | "set" | "clear" | "nothing";

export type GetIdentityModule =
  | "masterInModule"
  | "masterOutModule"
  | "masterDimModule"
  | "masterRoomClimateModule";

export interface IChannelBase {
  index: number;
  noxnetError?: {
    errorCode: number;
    errorDescription: string;
  };
}

export interface IModuleBase<T = IChannelBase> {
  class: ModuleClass;
  index: number;
  state: "ready" | "notConnected";
  channel: T | T[];
}
