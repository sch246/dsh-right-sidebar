# Per-session layout activation

Date: 2026-09-06

The user explicitly requested applying the published patch and restarting the Web service. Source `8d9c4ff434ee257aca2cdb0b5e1938e0f640a580` was applied as the difference between the receipt-owned previous patch and the corrected patch, preserving unrelated Host changes. The complete corrected patch passed its reverse applicability check, and the existing ownership receipt was advanced to its new digest.

`pnpm exec tsc -p packages/client/ui-layout/tsconfig.json` and `pnpm --filter @deepseek-ai/dsh-client-ui-layout bundle` completed. Existing profile dependencies and Bundle membership were retained; no plugin reinstall or broad test suite was run. Public slot and service method signatures did not change, so shared catalogs did not require regeneration.

The authorized `dsh-web` restart completed. The service was active/running with zero automatic restarts; the root page and its advertised layout-containing Client assets returned HTTP 200, and served code contained `dsh.layout.panels.v2`. Recovery copies of touched sources, previous artifacts and receipt were retained locally before application.

These observations establish source application, built artifact delivery and startup. The A → B → A, independent width/maximization and refresh interactions remain for the user’s manual acceptance; no Agent browser interaction test or user acceptance is claimed.
