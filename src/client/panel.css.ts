/** Namespaced workbench styles installed and removed with the client plugin. */
export const PANEL_CSS = `
.dsh-rightbar-root{container-type:inline-size;display:flex;flex-direction:column;height:100%;min-width:0;overflow:hidden;background:var(--dsw-alias-bg-base,transparent);}
.dsh-rightbar-tab-label:focus-visible,.dsh-rightbar-tab-close:focus-visible,.dsh-rightbar-launcher-toggle:focus-visible,.dsh-rightbar-launcher:focus-visible,.dsh-rightbar-toggle:focus-visible,.dsh-rightbar-retry:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,currentColor);outline-offset:1px;}
.dsh-rightbar-tabbar{display:flex;align-items:center;min-width:0;height:38px;padding:5px var(--dsh-shell-navbar-width,80px) 5px 7px;border-bottom:1px solid var(--dsw-alias-border-l2,rgba(38,49,72,.1));flex:none;box-sizing:border-box;}
.dsh-rightbar-tabscroll{display:flex;align-items:center;gap:3px;min-width:0;overflow-x:auto;scrollbar-width:thin;flex:1 1 auto;}
.dsh-rightbar-tab{display:flex;align-items:center;min-width:58px;max-width:180px;height:28px;border:1px solid transparent;border-radius:6px;background:transparent;color:var(--dsw-alias-text-secondary,inherit);flex:none;}
.dsh-rightbar-tab:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(38,49,72,.06));color:var(--dsw-alias-text-primary,inherit);}
.dsh-rightbar-tab[data-active='true']{border-color:var(--dsw-alias-border-l2,rgba(38,49,72,.12));background:var(--dsw-alias-bg-layer-1,rgba(38,49,72,.07));color:var(--dsw-alias-text-primary,inherit);}
.dsh-rightbar-tab-label{min-width:0;height:100%;padding:0 3px 0 8px;border:0;background:transparent;color:inherit;font:inherit;font-size:12px;line-height:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer;flex:1;}
.dsh-rightbar-tab-close{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;margin-right:1px;padding:0;border:0;border-radius:5px;background:transparent;color:inherit;cursor:pointer;flex:none;}
.dsh-rightbar-tab-close:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(38,49,72,.1));}
.dsh-rightbar-tab-close:disabled{cursor:wait;opacity:.5;}
.dsh-rightbar-launcher-toggle{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;margin-left:4px;padding:0;border:1px solid transparent;border-radius:6px;background:transparent;color:var(--dsw-alias-text-secondary,inherit);font-size:18px;line-height:1;cursor:pointer;flex:none;}
.dsh-rightbar-launcher-toggle:hover,.dsh-rightbar-launcher-toggle[data-active='true']{background:var(--dsw-alias-interactive-bg-hover,rgba(38,49,72,.06));color:var(--dsw-alias-text-primary,inherit);}
.dsh-rightbar-body{flex:1;min-height:0;overflow:auto;padding:10px 12px;}
.dsh-rightbar-launcher-home{width:min(100%,420px);margin:0 auto;padding:20px 8px;}
.dsh-rightbar-launcher-home h2{margin:0 0 14px;font-size:14px;font-weight:600;color:var(--dsw-alias-text-primary,inherit);}
.dsh-rightbar-launcher-list{display:grid;gap:6px;}
.dsh-rightbar-launcher{min-height:34px;padding:7px 10px;border:1px solid var(--dsw-alias-border-l2,rgba(38,49,72,.12));border-radius:7px;background:var(--dsw-alias-bg-layer-1,transparent);color:var(--dsw-alias-text-primary,inherit);font:inherit;font-size:12px;text-align:left;cursor:pointer;}
.dsh-rightbar-launcher:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(38,49,72,.06));}
.dsh-rightbar-launcher:disabled{cursor:wait;opacity:.6;}
.dsh-rightbar-launcher-error{display:flex;min-height:34px;align-items:center;justify-content:space-between;gap:8px;color:var(--dsw-alias-status-error,var(--dsw-alias-text-primary,inherit));font-size:12px;}
.dsh-rightbar-operation-error{padding:6px 12px;border-bottom:1px solid var(--dsw-alias-border-l2,rgba(38,49,72,.1));color:var(--dsw-alias-status-error,var(--dsw-alias-text-primary,inherit));font-size:12px;}
.dsh-rightbar-state{display:flex;min-height:96px;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:16px;text-align:center;color:var(--dsw-alias-text-secondary,inherit);font-size:12px;}
.dsh-rightbar-retry{min-height:28px;padding:4px 10px;border:1px solid var(--dsw-alias-border-l2,currentColor);border-radius:6px;background:transparent;color:var(--dsw-alias-text-primary,inherit);cursor:pointer;}
.dsh-rightbar-retry:hover{background:var(--dsw-alias-bg-layer-1,transparent);}
.dsh-rightbar-toggle{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;padding:0;border:none;border-radius:8px;background:transparent;color:var(--dsw-alias-text-secondary,inherit);cursor:pointer;}
.dsh-rightbar-toggle:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(38,49,72,.06));color:var(--dsw-alias-text-primary,inherit);}
.dsh-rightbar-toggle[data-active='true']{background:var(--dsw-alias-button-ghost-active-fill,rgba(38,49,72,.1));color:var(--dsw-alias-text-primary,inherit);}
@container (max-width:260px){.dsh-rightbar-tab{max-width:120px}.dsh-rightbar-body{padding-inline:8px}}
@media (prefers-reduced-motion:no-preference){.dsh-rightbar-tab,.dsh-rightbar-launcher-toggle,.dsh-rightbar-launcher,.dsh-rightbar-toggle,.dsh-rightbar-retry{transition:background-color 120ms ease,color 120ms ease,border-color 120ms ease;}}
`
