/** Namespaced workbench styles installed and removed with the client plugin. */
export const PANEL_CSS = `
.dsh-rightbar-root{position:relative;container-type:inline-size;display:flex;flex-direction:column;height:100%;min-width:0;overflow:hidden;background:var(--dsw-alias-bg-base,transparent);}
.dsh-rightbar-root button:focus-visible,.dsh-rightbar-root [role='separator']:focus-visible,.dsh-rightbar-toggle:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,currentColor);outline-offset:1px;}
.dsh-rightbar-launcher-toggle,.dsh-rightbar-orientation{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;border:1px solid transparent;border-radius:6px;background:transparent;color:var(--dsw-alias-text-secondary,inherit);cursor:pointer;flex:none;}
.dsh-rightbar-launcher-toggle{font-size:18px;line-height:1;}
.dsh-rightbar-launcher-toggle:hover,.dsh-rightbar-orientation:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(38,49,72,.06));color:var(--dsw-alias-text-primary,inherit);}
.dsh-rightbar-operation-error{position:absolute;z-index:30;top:56px;right:8px;max-width:calc(100% - 16px);padding:6px 10px;border:1px solid var(--dsw-alias-border-l2,rgba(38,49,72,.1));border-radius:6px;background:var(--dsw-alias-bg-base,#fff);color:var(--dsw-alias-status-error,var(--dsw-alias-text-primary,inherit));font-size:12px;}
.dsh-rightbar-workspace{position:relative;min-width:0;min-height:0;overflow:hidden;flex:1;}
.dsh-rightbar-group{position:absolute;z-index:2;min-width:0;min-height:0;padding:2px;box-sizing:border-box;overflow:visible;pointer-events:none;}
.dsh-rightbar-group-layout{display:flex;width:100%;height:100%;min-width:0;min-height:0;border:1px solid var(--dsw-alias-border-l2,rgba(38,49,72,.1));border-radius:5px;box-sizing:border-box;overflow:hidden;background:transparent;}
.dsh-rightbar-group[data-active='true'] .dsh-rightbar-group-layout{border-color:var(--dsw-alias-brand-primary,rgba(74,104,255,.55));}
.dsh-rightbar-group[data-orientation='horizontal'] .dsh-rightbar-group-layout{flex-direction:column;}
.dsh-rightbar-group[data-orientation='vertical'] .dsh-rightbar-group-layout{flex-direction:row;}
.dsh-rightbar-tabs{display:flex;min-width:0;min-height:0;background:var(--dsw-alias-bg-layer-1,rgba(38,49,72,.025));pointer-events:auto;flex:none;}
.dsh-rightbar-group[data-orientation='horizontal'] .dsh-rightbar-tabs{align-items:center;width:100%;height:34px;border-bottom:1px solid var(--dsw-alias-border-l2,rgba(38,49,72,.1));box-sizing:border-box;}
.dsh-rightbar-group[data-orientation='horizontal'][data-top='true'] .dsh-rightbar-tabs{height:56px;padding-block:12px;}
.dsh-rightbar-group[data-orientation='horizontal'][data-top='true'][data-right='true'] .dsh-rightbar-tabs{padding-right:var(--dsh-shell-navbar-width,80px);}
.dsh-rightbar-group[data-orientation='vertical'] .dsh-rightbar-tabs{flex-direction:column;height:100%;border-right:1px solid var(--dsw-alias-border-l2,rgba(38,49,72,.1));}
.dsh-rightbar-group[data-orientation='vertical'][data-top='true'][data-right='true'] .dsh-rightbar-tabs{padding-top:56px;box-sizing:border-box;}
.dsh-rightbar-tabscroll{display:flex;align-items:center;gap:2px;min-width:0;min-height:0;scrollbar-width:thin;flex:1 1 auto;}
.dsh-rightbar-group[data-orientation='horizontal'] .dsh-rightbar-tabscroll{overflow-x:auto;overflow-y:hidden;padding:2px 3px;}
.dsh-rightbar-group[data-orientation='vertical'] .dsh-rightbar-tabscroll{align-items:stretch;flex-direction:column;overflow-x:hidden;overflow-y:auto;padding:3px 2px;}
.dsh-rightbar-group-actions{display:flex;align-items:center;gap:1px;flex:none;}
.dsh-rightbar-group[data-orientation='vertical'] .dsh-rightbar-group-actions{flex-direction:column;padding:2px;}
.dsh-rightbar-orientation{margin:1px;}
.dsh-rightbar-tab{position:relative;display:flex;align-items:center;min-width:64px;max-width:210px;height:28px;border:1px solid transparent;border-radius:5px;background:transparent;color:var(--dsw-alias-text-secondary,inherit);flex:none;}
.dsh-rightbar-group[data-orientation='vertical'] .dsh-rightbar-tab{width:100%;max-width:none;min-height:30px;}
.dsh-rightbar-tab:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(38,49,72,.06));color:var(--dsw-alias-text-primary,inherit);}
.dsh-rightbar-tab[data-active='true']{border-color:var(--dsw-alias-border-l2,rgba(38,49,72,.12));background:var(--dsw-alias-bg-base,rgba(38,49,72,.07));color:var(--dsw-alias-text-primary,inherit);}
.dsh-rightbar-tab-label{min-width:0;height:100%;padding:0 3px 0 7px;border:0;background:transparent;color:inherit;font:inherit;font-size:12px;line-height:1;overflow:hidden;text-align:left;text-overflow:ellipsis;white-space:nowrap;cursor:pointer;flex:1;}
.dsh-rightbar-tab[data-preview='true'] .dsh-rightbar-tab-label{font-style:italic;}
.dsh-rightbar-tab-close,.dsh-rightbar-tab-actions{display:inline-flex;align-items:center;justify-content:center;width:22px;height:24px;padding:0;border:0;border-radius:4px;background:transparent;color:inherit;cursor:pointer;flex:none;}
.dsh-rightbar-tab-actions{width:18px;font-size:13px;}
.dsh-rightbar-tab-close:hover,.dsh-rightbar-tab-actions:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(38,49,72,.1));}
.dsh-rightbar-tab-close:disabled{cursor:wait;opacity:.5;}
.dsh-rightbar-tab-menu{position:absolute;z-index:18;top:34px;right:6px;display:grid;width:150px;padding:4px;border:1px solid var(--dsw-alias-border-l2,rgba(38,49,72,.16));border-radius:6px;background:var(--dsw-alias-bg-base,#fff);box-shadow:0 4px 16px rgba(0,0,0,.14);pointer-events:auto;}
.dsh-rightbar-group[data-top='true'] .dsh-rightbar-tab-menu{top:56px;}
.dsh-rightbar-tab-menu button{min-height:28px;padding:4px 7px;border:0;border-radius:4px;background:transparent;color:var(--dsw-alias-text-primary,inherit);font:inherit;font-size:12px;text-align:left;cursor:pointer;}
.dsh-rightbar-tab-menu button:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(38,49,72,.08));}
.dsh-rightbar-group-body{position:relative;min-width:0;min-height:0;overflow:hidden;flex:1;}
.dsh-rightbar-surface{position:absolute;z-index:1;min-width:0;min-height:0;padding:3px;box-sizing:border-box;overflow:auto;pointer-events:auto;}
.dsh-rightbar-surface:not([data-active='true']){display:none;}
.dsh-rightbar-view{width:100%;height:100%;min-width:0;min-height:0;overflow:auto;}
.dsh-rightbar-launcher-home{width:min(100%,420px);margin:0 auto;padding:20px 12px;box-sizing:border-box;}
.dsh-rightbar-launcher-home h2{margin:0 0 14px;font-size:14px;font-weight:600;color:var(--dsw-alias-text-primary,inherit);}
.dsh-rightbar-launcher-list{display:grid;gap:6px;}
.dsh-rightbar-launcher{min-height:34px;padding:7px 10px;border:1px solid var(--dsw-alias-border-l2,rgba(38,49,72,.12));border-radius:7px;background:var(--dsw-alias-bg-layer-1,transparent);color:var(--dsw-alias-text-primary,inherit);font:inherit;font-size:12px;text-align:left;cursor:pointer;}
.dsh-rightbar-launcher:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(38,49,72,.06));}
.dsh-rightbar-launcher:disabled{cursor:wait;opacity:.6;}
.dsh-rightbar-default-setting{display:block;margin-top:18px;padding:5px 0;border:0;background:transparent;color:var(--dsw-alias-text-secondary,inherit);font:inherit;font-size:12px;text-align:left;text-decoration:underline;text-underline-offset:2px;cursor:pointer;}
.dsh-rightbar-default-setting:hover{color:var(--dsw-alias-text-primary,inherit);}
.dsh-rightbar-launcher-error{display:flex;min-height:34px;align-items:center;justify-content:space-between;gap:8px;color:var(--dsw-alias-status-error,var(--dsw-alias-text-primary,inherit));font-size:12px;}
.dsh-rightbar-state{display:flex;min-height:96px;height:100%;box-sizing:border-box;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:16px;text-align:center;color:var(--dsw-alias-text-secondary,inherit);font-size:12px;}
.dsh-rightbar-retry,.dsh-rightbar-rail-recover{min-height:28px;padding:4px 10px;border:1px solid var(--dsw-alias-border-l2,currentColor);border-radius:6px;background:var(--dsw-alias-bg-base,transparent);color:var(--dsw-alias-text-primary,inherit);cursor:pointer;}
.dsh-rightbar-rail-recover{position:absolute;z-index:3;top:6px;left:6px;pointer-events:auto;}
.dsh-rightbar-drop-preview{position:absolute;z-index:12;border:2px solid var(--dsw-alias-brand-primary,currentColor);box-sizing:border-box;background:color-mix(in srgb,var(--dsw-alias-brand-primary,#4a68ff) 16%,transparent);pointer-events:none;}
.dsh-rightbar-split-handle{position:absolute;z-index:15;background:transparent;touch-action:none;}
.dsh-rightbar-split-handle[data-axis='horizontal']{width:10px;margin-left:-5px;cursor:col-resize;}
.dsh-rightbar-split-handle[data-axis='vertical']{height:10px;margin-top:-5px;cursor:row-resize;}
.dsh-rightbar-split-handle:hover,.dsh-rightbar-split-handle:focus-visible{background:color-mix(in srgb,var(--dsw-alias-brand-primary,#4a68ff) 25%,transparent);}
.dsh-rightbar-rail-handle{width:8px;margin-inline:-4px;z-index:5;cursor:col-resize;touch-action:none;pointer-events:auto;flex:none;}
.dsh-rightbar-rail-handle:hover,.dsh-rightbar-rail-handle:focus-visible{background:color-mix(in srgb,var(--dsw-alias-brand-primary,#4a68ff) 25%,transparent);}
.dsh-rightbar-toggle{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;padding:0;border:none;border-radius:8px;background:transparent;color:var(--dsw-alias-text-secondary,inherit);cursor:pointer;}
.dsh-rightbar-toggle:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(38,49,72,.06));color:var(--dsw-alias-text-primary,inherit);}
.dsh-rightbar-toggle[data-active='true']{background:var(--dsw-alias-button-ghost-active-fill,rgba(38,49,72,.1));color:var(--dsw-alias-text-primary,inherit);}
@container (max-width:260px){.dsh-rightbar-tab{max-width:130px}}
@media (prefers-reduced-motion:no-preference){.dsh-rightbar-tab,.dsh-rightbar-launcher-toggle,.dsh-rightbar-launcher,.dsh-rightbar-toggle,.dsh-rightbar-retry,.dsh-rightbar-default-setting{transition:background-color 120ms ease,color 120ms ease,border-color 120ms ease;}}
`
