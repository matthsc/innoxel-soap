# innoxel-soap

Library to access Innoxel Master 3 SOAP API.

![node](https://img.shields.io/node/v-lts/innoxel-soap)
[![npm](https://img.shields.io/npm/v/innoxel-soap)](https://www.npmjs.com/package/innoxel-soap)
[![license](https://img.shields.io/npm/l/innoxel-soap)](LICENSE)

![build](https://img.shields.io/github/workflow/status/matthsc/innoxel-soap/Node.js%20CI)

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

TODO

## Advanced usage

TODO

# Limitations

- Innoxel Master needs to be polled to retrieve updates, there is no pushing or callback mechanism.
  - Whenever the state of i.e. a switch or dimmer changes, the state id changes too. So for performance reasons, consider using <code>getBootAndStateIds()</code> or <code>getBootAndStateIdXml()</code>, and only if this changes actually load the desired state data.
- Switches can only be triggered, not set. So you can't set a switch _off_, but you can have it switch it's state from on=>off or off=>on.

# Contributing

## Running tests

```bash
npm test
```

There are two types of tests. Tests with mocks, and tests against an actual Innoxel Master, which are skipped by default. In order to run tests against Innoxel Master, copy `.env.template` as `.env` and adjust the required settings.
