# C4 live web profile evidence

Observed on 2026-08-26 under the previously granted install and restart authority.

- shell source: `794ecd03fc9b80619b679b5d33f844f55b786eb9`;
- Harness target: `b642a10626a950cc95c2d6f839810cb01fe599fe` plus the governed patch;
- standard adapter source: `580b330323c13ec568adab2c35fabf8f8fa6b194`;
- `@dsh-external/dsh-right-sidebar -> link:/root/dsh-right-sidebar`;
- `@dsh-std/adapter-dsh -> link:/root/dsh-std/packages/adapter-dsh`;
- `dsh-web` returned to `active` after rebuild and restart;
- `https://dsh.sch246.top/` returned HTTP 200;
- public shell bundle revision: `c28f910c11d3`;
- public layout bundle revision: `8e0401f9441d`;
- public conversation bundle revision: `11697f17fe6c`;
- the layout bundle contains the navbar-clearance producer;
- the conversation bundle contains the clearance consumer;
- the shell bundle omits the internal collapse class and both removed empty-state strings.

This proves production assembly and delivery, not browser execution or visual acceptance. Pixel separation, the invisible divider's pointer target, width restoration and the resulting visual quietness still require a real browser observation.
