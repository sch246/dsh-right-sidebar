# Live web profile evidence

Observed on 2026-08-25 with explicit user authority.

- shell source: `a522fb187a8afef060216f919ec32448caf98129`;
- standard adapter source: `580b330323c13ec568adab2c35fabf8f8fa6b194`;
- profile dependency: `@dsh-external/dsh-right-sidebar -> link:/root/dsh-right-sidebar`;
- profile dependency: `@dsh-std/adapter-dsh -> link:/root/dsh-std/packages/adapter-dsh`;
- dumped configuration contained both bundle entries exactly once;
- `systemctl restart dsh-web` completed and the service returned to `active`;
- `GET http://127.0.0.1:3082/` returned HTTP 200;
- the generated client boot manifest contained both package IDs and revisioned module URLs;
- both revisioned client bundle URLs returned HTTP 200 with non-empty bodies;
- the new service process journal contained no startup or assembly error.

No browser automation runtime was available. This evidence does not prove client-side execution, visible controls, resizing, width restoration, portable view rendering, two-way feature state, target drift maintenance, or uninstall.
