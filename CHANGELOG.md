# Changelog
All notable changes to this project will be documented here.
Format loosely follows Keep a Changelog. Versions use SemVer.

## [Unreleased]
### Added
- 
### Changed
- 
### Fixed
- Patched non-breaking dependency CVEs from `npm audit` and Autter draft PR #16 (same-major bumps and overrides only).
### Infra
- Node base image `node:20-alpine` → `node:22.23.5-alpine` (Node 20 is EOL; 22.23.5 includes the 11 Nov 2026 security release).
- Caddy image pinned from floating `caddy:2` to `caddy:2.11.9`. 

---

## [0.1.0] - 2025-09-06 12:00 UTC
**WAT:** 2025-09-06 13:00 (Africa/Lagos)

### Added
- JSON-RPC Playground with per-chain presets (EVM + Avail Substrate).
### Changed
- MethodSelect now switches presets by chain slug.
### Fixed
- 
### Infra
- 

[0.1.0]: https://github.com/krissemmy/krainode-rpc-proxy/releases/tag/v0.1.0
