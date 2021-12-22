# innoxel-soap

Library to access Innoxel Master 3 SOAP API.

The current version has been tested against firmware 1.6.0.0, but mostly used to work against firmware 1.4.1.0 and 1.5.1.0 too.

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

# Contributing

## Running tests

```bash
npm test
```

There are two types of tests. Tests with mocks, and tests against an actual Innoxel Master, which are skipped by default. In order to run tests against Innoxel Master, copy `.env.template` as `.env` and adjust the required settings.
