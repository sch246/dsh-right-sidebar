# C5 live web profile evidence

Observed on 2026-08-26 under the previously granted install and restart authority.

- shell source: `aa4baa3660f0ab7a06793baf576166340343bd09`;
- Harness target: `b642a10626a950cc95c2d6f839810cb01fe599fe` plus the governed patch;
- standard adapter source: `580b330323c13ec568adab2c35fabf8f8fa6b194`;
- `@dsh-external/dsh-right-sidebar -> link:/root/dsh-right-sidebar`;
- `@dsh-std/adapter-dsh -> link:/root/dsh-std/packages/adapter-dsh`;
- `dsh-web` returned to `active` after rebuild and restart;
- `https://dsh.sch246.top/` returned HTTP 200;
- public shell bundle revision: `0489213d29c2`;
- public layout bundle revision: `053fe3abee29`;
- public conversation bundle revision: `11697f17fe6c`;
- the layout bundle contains the 12-pixel navbar inset and navbar-clearance producer;
- the conversation bundle contains the clearance consumer;
- the shell bundle contains the 32-pixel transparent, borderless toggle declaration, contains no shadow, and omits the internal collapse class plus both removed empty-state strings.

This proves production assembly and delivery, not browser execution or visual acceptance. Pixel separation, the invisible divider's pointer target, width restoration and the resulting visual quietness still require a real browser observation.
