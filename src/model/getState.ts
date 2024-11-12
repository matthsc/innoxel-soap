import type { IChannelBase, IModuleBase } from "./soap";

export interface IGetStateResponse {
  bootId: string;
  stateId: string;
  moduleList: {
    module: IModuleBase | IModuleBase[];
  };
}

export interface IWeatherData {
  unit: string;
  value: string | number;
}
export interface IModuleWeather extends IModuleBase {
  class: "masterWeatherModule";
  temperatureAir: IWeatherData;
  temperatureAirFelt: IWeatherData;
  windSpeed: IWeatherData;
  sunBrightnessEast: IWeatherData;
  sunBrightnessSouth: IWeatherData;
  sunBrightnessWest: IWeatherData;
  sunTwilight: IWeatherData;
  precipitation: IWeatherData;
}

export interface IModuleRoomTemperature extends IModuleBase {
  class: "masterInModule";
  roomTemperature: IWeatherData;
}

export type ModuleRoomClimateSetType =
  | "setTemperatureHeating"
  | "setTemperatureCooling"
  | "nightSetbackTemperatureHeating"
  | "nightSetbackTemperatureCooling"
  | "absenceSetbackTemperatureHeating"
  | "absenceSetbackTemperatureCooling";

export interface IModuleRoomClimate extends IModuleBase {
  class: "masterRoomClimateModule";
  index: number;
  thermostat: {
    operatingState: string;
    valveState: string;
    actualTemperatureMean: IWeatherData;
    setTemperatureHeating: IWeatherData;
    setTemperatureCooling: IWeatherData;
    nightSetbackTemperatureHeating: IWeatherData;
    nightSetbackTemperatureCooling: IWeatherData;
    absenceSetbackTemperatureHeating: IWeatherData;
    absenceSetbackTemperatureCooling: IWeatherData;
  };
  alarmState: string;
}

export interface IChannelIn extends IChannelBase {
  ledState: "on" | "off" | "unknown";
}

export interface IChannelOut extends IChannelBase {
  outState: "on" | "off";
}

export interface IChannelDim extends IChannelBase {
  outState: number;
}

export interface IModuleChannelIn extends IModuleBase<IChannelIn> {
  class: "masterInModule";
}
export interface IModuleChannelOut extends IModuleBase<IChannelOut> {
  class: "masterOutModule";
}
export interface IModuleChannelDim extends IModuleBase<IChannelDim> {
  class: "masterDimModule";
}

export interface IDeviceStatusData {
  "#text": string | number;
  unit: string;
}

export interface IDeviceStatusResponse {
  baseVoltageMain: IDeviceStatusData;
  baseVoltageCPU: IDeviceStatusData;
  baseVoltageBackup: IDeviceStatusData;
  baseVoltageKeyMatrix: IDeviceStatusData;
  baseTemperatureCPU: IDeviceStatusData;
  baseSupplyStateCAN1: string;
  baseSupplyStateCAN2: string;
  baseSupplyStateCom1Internal: string;
  baseSupplyStateCom2Internal: string;
  baseSupplyStateCom3Internal: string;
  baseSupplyStateCom3External: string;
  baseBackupDomainSRAM: string;
  hostTemperatureCPU: IDeviceStatusData;
  hostMemoryTotal: IDeviceStatusData;
  hostMemoryAvailable: IDeviceStatusData;
  hostMemoryOccupied: IDeviceStatusData;
  statisticsTotalRunTime: IDeviceStatusData;
  statisticsHtmlPort: IDeviceStatusData;
  statisticsMoxaPort: IDeviceStatusData;
  statisticsUpnpPort: IDeviceStatusData;
  statisticsSerialTx: IDeviceStatusData;
  statisticsSerialRx: IDeviceStatusData;
}
