/**
 * Plugin-owned stylesheet (injected as one tagged <style> by the client
 * apply; removed on unload). Classes are namespaced `dsh-rightbar-*`;
 * colors ride the official `--dsw-*` tokens.
 */
export const PANEL_CSS = `
.dsh-rightbar-root{container-type:inline-size;display:flex;flex-direction:column;height:100%;min-width:0;overflow:hidden;background:var(--dsw-alias-bg-base,transparent);}
.dsh-rightbar-tab:focus-visible,.dsh-rightbar-toggle:focus-visible,.dsh-rightbar-retry:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,currentColor);outline-offset:2px;}
.dsh-rightbar-tabbar{display:flex;gap:4px;padding:6px 48px 0 8px;border-bottom:1px solid var(--dsw-alias-border-l2,transparent);flex:none;overflow-x:auto;}
.dsh-rightbar-tab{display:inline-flex;align-items:center;gap:4px;padding:5px 10px;border:none;border-bottom:2px solid transparent;background:transparent;color:var(--dsw-alias-text-secondary,inherit);font-size:12px;cursor:pointer;white-space:nowrap;}
.dsh-rightbar-tab:hover{color:var(--dsw-alias-text-primary,inherit);}
.dsh-rightbar-tab[data-active='true']{color:var(--dsw-alias-brand-primary,inherit);border-bottom-color:var(--dsw-alias-brand-primary,transparent);font-weight:600;}
.dsh-rightbar-body{flex:1;min-height:0;overflow:auto;padding:10px 12px;}
.dsh-rightbar-state{display:flex;min-height:96px;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:16px;text-align:center;color:var(--dsw-alias-text-secondary,inherit);font-size:12px;}
.dsh-rightbar-retry{min-height:28px;padding:4px 10px;border:1px solid var(--dsw-alias-border-l2,currentColor);border-radius:6px;background:transparent;color:var(--dsw-alias-text-primary,inherit);cursor:pointer;}
.dsh-rightbar-retry:hover{background:var(--dsw-alias-bg-layer-1,transparent);}
.dsh-rightbar-toggle{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;padding:0;border:none;border-radius:8px;background:transparent;color:var(--dsw-alias-text-secondary,inherit);cursor:pointer;}
.dsh-rightbar-toggle:hover{background:var(--dsw-alias-bg-layer-1,transparent);color:var(--dsw-alias-text-primary,inherit);}
.dsh-rightbar-toggle[data-active='true']{background:var(--dsw-alias-bg-layer-1,transparent);color:var(--dsw-alias-text-primary,inherit);}
@container (max-width:260px){.dsh-rightbar-tab{padding-inline:8px}.dsh-rightbar-body{padding-inline:8px}}
@media (prefers-reduced-motion:no-preference){.dsh-rightbar-tab,.dsh-rightbar-toggle,.dsh-rightbar-retry{transition:background-color 120ms ease,color 120ms ease,border-color 120ms ease;}}
`
