# innoxel-soap

TypeScript ESM library for the Innoxel Master 3 SOAP API (Node.js >=22, tested against firmware 1.6.0.0).

## Main Scripts

- `npm run build` — Bundle into `dist/` with `tsdown`
- `npm test` — Run unit tests with Vitest (MSW mocks)
- `npm run lint` — Lint with Biome
- `npm run format` — Format with Biome (run before committing)
- `npm run check` — Run `tsc`, export check (`attw`), Biome lint, and Vitest tests

## Testing

- **Mock tests** (MSW) run by default via `npm test`.
- **Integration tests** against a real Innoxel Master are skipped by default; copy `.env.template` to `.env` with `IP`, `USER`, and `PASSWORD` to enable them.

## Architecture & Key Files

- `src/index.ts` — Public API exports
- `src/innoxelApi.ts` — `InnoxelApi` main client
- `src/soapMessage.ts` — `SoapMessage` SOAP XML payload builder
- `src/requestHelper.ts` — HTTP (`digest-fetch`) and XML (`fast-xml-parser`) helpers
- `src/errors.ts` — Custom errors (`NetworkError`, `EndpointError`, etc.)
- `src/model/` — TypeScript interfaces for API responses and data structures

## Conventions

- Poll `getBootAndStateIds()` first and only fetch full module states when `stateId` changes.
- Code style is enforced by Biome (`biome.json`).
