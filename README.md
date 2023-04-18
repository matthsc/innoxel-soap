# innoxel-soap

Library to access Innoxel Master 3 SOAP API.

![node](https://img.shields.io/node/v-lts/innoxel-soap)
[![npm](https://img.shields.io/npm/v/innoxel-soap)](https://www.npmjs.com/package/innoxel-soap)
[![license](https://img.shields.io/npm/l/innoxel-soap)](LICENSE)

![build](https://img.shields.io/github/actions/workflow/status/matthsc/innoxel-soap/build-and-test.yml?branch=main)
[![Code Climate maintainability](https://img.shields.io/codeclimate/maintainability-percentage/matthsc/innoxel-soap)
![Code Climate issues](https://img.shields.io/codeclimate/issues/matthsc/innoxel-soap)
![Code Climate technical debt](https://img.shields.io/codeclimate/tech-debt/matthsc/innoxel-soap)
](https://codeclimate.com/github/matthsc/innoxel-soap)

The current version has been tested against firmware 1.6.0.0, but most parts already worked against firmware 1.4.1.0 and 1.5.1.0 too.

# Installation

```bash
npm install innoxel-soap
```

or

```bash
yarn add innoxel-soap
```

# Usage

## Getting started

```ts
import { InnoxelApi } from "innoxel-soap";

const api = new InnoxelApi({
  user: "username",
  password: "***",
  ip: "192.168.0.100",
});
const [bootId, stateId] = await api.getBootAndStateIds();
```

## Usage

### InnoxelApi

The main export ist the <code>InnoxelApi</code> class. It provides the main functionality to send messages to innoxel master, and some convenience methods to retrieve/update certain data.

#### Constructor

The constructor of the <code>InnoxelApi</code> class acccepts the following configuration object:

```ts
{
  user: "<user name>", // username for accessing innoxel master
  password: "<password>", // required, password of the user
  ip: "<ip address>", // required, ip address of innoxel master
  port: 5001, // optional, defaults to 5001
}
```

#### Methods

Methods of the <code>InnoxelApi</code> class:

| method                                                                                                                          | description                                                                                               | parameters                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <code>postMessage&lt;T&gt;(message: SoapMessage): Promise&lt;T&gt;</code>                                                       | helper method for posting messages to innoxel master and parsing the returned xml (see SoapMessage below) | <code>message</code>: soap message object<br>_returns_ the parsed soap answer                                                                                                                      |
| <code>getBootAndStateIdXml(): Promise&lt;string&gt;</code>                                                                      | get current boot and state id response xml                                                                |
| <code>getBootAndStateIds(xml?: string): Promise&lt;[bootId: string, stateId: string]&gt; </code>                                | get boot and state id, either by retrieving them from innoxel master, or by parsing the given xml         | <code>xml</code> (optional) xml message to parse ids from                                                                                                                                          |
| <code>getDeviceState(): Promise&lt;IDeviceStatusResponse&gt;</code>                                                             | get current device state of innoxel master (requires administrator privileges)                            |                                                                                                                                                                                                    |
| <code>getIdentities(): Promise&lt;ModuleIdentityType[]&gt;</code>                                                               | get identity information for all modules                                                                  | <code></code>                                                                                                                                                                                      |
| <code>getWeather(): Promise&lt;IModuleWeather&gt;</code>                                                                        | get weather module data                                                                                   | <code></code>                                                                                                                                                                                      |
| <code>getRoomClimate(moduleIds: number[]): Promise&lt;IModuleRoomClimate[]&gt;</code>                                           | get room climate data                                                                                     | <code>moduleIds</code>: array of module ids to query, or <code>[-1]</code> for all modules                                                                                                         |
| <code>getModuleStates(): Promise&lt;IModuleBase[]&gt;</code>                                                                    | get module state data                                                                                     | <code></code>                                                                                                                                                                                      |
| <code>triggerPushButton(moduleIndex: number, channel: number, event: ModuleInEvent = "autoImpulse"): Promise&lt;void&gt;</code> | trigger a push button                                                                                     | <code>moduleIndex</code>: module index of the module<br><code>channel</code>: channel to trigger<br><code>event</code>: how to "push" the button                                                   |
| <code> triggerOutModule(moduleIndex: number, channel: number, event: ModuleOutEvent = "toggle"): Promise&lt;void&gt;</code>     | trigger an Out module                                                                                     | <code>moduleIndex</code>: module index of the module<br><code>channel</code>: channel to trigger<br><code>event</code>: how to trigger the channel                                                 |
| <code>setDimValue(moduleIndex: number, channel: number, dimValue: number, dimSpeed = 0): Promise&lt;void&gt;</code>             | set the value of a dimmer                                                                                 | <code>moduleIndex</code>: module index of the module<br><code>channel</code>: dimmer channel<br><code>dimValue</code>: value to set (0-100, 0: off)<br><code>dimSpeed</code>: dimming speed (0-15) |
| <code>setRoomClimate(moduleIndex: number, type: ModuleRoomClimateSetType, temperature: number)</code>                           | set the temperature of a room climate module                                                              | <code>moduleIndex</code>: module index of the module<br><code>type</code>: type of temperature to set<br><code>temperature</code>: temperature to set                                              |

### SoapMessage

Class for building the soap message sent to innoxel master.

# Limitations

- The library was designed to fit my needs for an [ioBroker adapter](https://github.com/matthsc/ioBroker.innoxel). If additional functionality is required please open an issue.
- Innoxel Master needs to be polled to retrieve updates, there is no pushing or callback mechanism.
  - Whenever the state of i.e. a switch or dimmer changes, the state id changes too. So for performance reasons, consider using <code>getBootAndStateIds()</code> or <code>getBootAndStateIdXml()</code>, and only if this changes actually load the desired state data.
- Switches can only be toggled, not set. So you can't set a switch _off_, but you can have it switch it's state from on=>off or off=>on.

# Contributing

## Running tests

```bash
npm test
```

There are two types of tests. Tests with mocks, and tests against an actual Innoxel Master, which are skipped by default. In order to run tests against Innoxel Master, copy `.env.template` as `.env` and adjust the required settings.
