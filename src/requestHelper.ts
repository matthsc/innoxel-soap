import { FaultResponseError } from "./errors";
import { SoapAction } from "./model";
import { XMLParser } from "fast-xml-parser";

// initialize fast-xml-parser
const parser = new XMLParser({
  attributeNamePrefix: "",
  ignoreAttributes: false,
  parseAttributeValue: true,
  removeNSPrefix: true,
});

/** helper method to parse xml responses */
export const parseXml = <T extends object>(xml: string): T => {
  const obj = parser.parse(xml) as {
    Envelope: { Body: T | { Fault: unknown } };
  };
  const objBody = obj.Envelope.Body;
  if ("Fault" in objBody) throw new FaultResponseError(objBody.Fault);

  return objBody as T;
};

/** helper method te get the xml response tag for a SoapAction */
export const getResponseTag = (action: SoapAction): string => {
  switch (action) {
    case "getDeviceStateList":
      return "getDeviceStateResponse";
    default:
      return `${action}Response`;
  }
};

/**
 * always returns an array
 * @returns the given array, or a new array containing the given argument
 */
export function asArray<T>(obj: T | T[]): T[] {
  return Array.isArray(obj) ? obj : [obj];
}
