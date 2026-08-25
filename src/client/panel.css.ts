/**
 * Plugin-owned stylesheet (injected as one tagged <style> by the client
 * apply; removed on unload). Classes are namespaced `dsh-rightbar-*`;
 * colors ride the official `--dsw-*` tokens.
 */
export const PANEL_CSS = `
.dsh-rightbar-root{display:flex;flex-direction:column;height:100%;min-width:0;overflow:hidden;background:var(--dsw-alias-bg-base,transparent);}
.dsh-rightbar-header{display:flex;align-items:center;justify-content:flex-start;gap:8px;padding:8px 48px 8px 12px;border-bottom:1px solid var(--dsw-alias-border-l2,transparent);flex:none;}
.dsh-rightbar-title{font-size:13px;font-weight:600;color:var(--dsw-alias-text-primary,inherit);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.dsh-rightbar-collapse{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;padding:0;border:none;border-radius:6px;background:transparent;color:var(--dsw-alias-text-secondary,inherit);cursor:pointer;}
.dsh-rightbar-collapse:hover{background:var(--dsw-alias-bg-layer-1,transparent);color:var(--dsw-alias-text-primary,inherit);}
.dsh-rightbar-tabbar{display:flex;gap:4px;padding:6px 8px 0;border-bottom:1px solid var(--dsw-alias-border-l2,transparent);flex:none;overflow-x:auto;}
.dsh-rightbar-tab{display:inline-flex;align-items:center;gap:4px;padding:5px 10px;border:none;border-bottom:2px solid transparent;background:transparent;color:var(--dsw-alias-text-secondary,inherit);font-size:12px;cursor:pointer;white-space:nowrap;}
.dsh-rightbar-tab:hover{color:var(--dsw-alias-text-primary,inherit);}
.dsh-rightbar-tab[data-active='true']{color:var(--dsw-alias-brand-primary,inherit);border-bottom-color:var(--dsw-alias-brand-primary,transparent);font-weight:600;}
.dsh-rightbar-body{flex:1;min-height:0;overflow:auto;padding:10px 12px;}
.dsh-rightbar-empty{color:var(--dsw-alias-text-secondary,inherit);font-size:12px;}
.dsh-rightbar-toggle{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;border:1px solid transparent;border-radius:8px;background:var(--dsw-alias-button-floating-fill,transparent);color:var(--dsw-alias-text-secondary,inherit);cursor:pointer;box-shadow:0 1px 2px rgb(0 0 0 / 8%);}
.dsh-rightbar-toggle:hover{background:var(--dsw-alias-bg-layer-1,transparent);color:var(--dsw-alias-text-primary,inherit);}
`
