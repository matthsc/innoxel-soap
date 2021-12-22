import { GetIdentityModule } from "./soap";

export interface IGetIdentitiesResponse {
  moduleList: {
    module: ModuleIdentityType[];
  };
}

export type ModuleIdentityType =
  | IModuleInIdentity
  | IModuleOutIdentity
  | IModuleDimIdentity
  | IModuleRoomClimateIdentity;

export interface IModuleIdentityBase {
  class: GetIdentityModule;
  index: number;
  name: string;
  description: string;
  channel: Array<{
    index: number;
    name: string;
    description: string;
  }>;
}

export interface IModuleInIdentity extends IModuleIdentityBase {
  class: "masterInModule";
  optionRoomTemperatureSensor: {
    onModule: "disabled" | "enabled";
    onConfig: "disabled" | "enabled";
  };
}

export interface IModuleOutIdentity {
  class: "masterOutModule";
}

export interface IModuleDimIdentity {
  class: "masterDimModule";
}

export interface IModuleRoomClimateIdentity {
  class: "masterRoomClimateModule";
  channel: undefined;
}
