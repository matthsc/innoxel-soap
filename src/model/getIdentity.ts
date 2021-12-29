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
  channel: IGetIdentityChannel[];
}

export interface IGetIdentityChannel {
  index: number;
  name: string;
  description: string;
  noxnetError?: { errorCode: number; errorDescription: string };
}

export interface IModuleInIdentity extends IModuleIdentityBase {
  class: "masterInModule";
  optionRoomTemperatureSensor: {
    onModule: "disabled" | "enabled";
    onConfig: "disabled" | "enabled";
  };
}

export interface IModuleOutIdentity extends IModuleIdentityBase {
  class: "masterOutModule";
}

export interface IModuleDimIdentity extends IModuleIdentityBase {
  class: "masterDimModule";
}

export interface IModuleRoomClimateIdentity
  extends Omit<IModuleIdentityBase, "channel"> {
  class: "masterRoomClimateModule";
}
