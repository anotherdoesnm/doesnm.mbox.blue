# doesnm.mbox.blue

Страница-визитка на трёх репозиториях:

| репозиторий | что делает |
|---|---|
| этот | конфиги (`site.json`, `links.json`), иконки, аватар — и всё |
| [action-littlelink](https://github.com/anotherdoesnm/action-littlelink) | сборщик: тянет апстримные `brands.css` по закреплённому коммиту и рендерит один HTML |
| [littlelink-template](https://github.com/anotherdoesnm/littlelink-template) | шаблон для новых сайтов; из него сделан этот репозиторий |

Раньше сборщик и вендоренные CSS лежали здесь же — тогда каждый форк тащил свою
копию, и они расходились. Теперь обновление стилей — это смена пина в action, без
правок в этом репозитории.

## Правки

- содержимое — `site.json`, `links.json`;
- картинки — `assets/avatar.png`, `assets/icons/<name>.svg`;
- своя кнопка без апстримного стиля: `{ "brand": "myservice", "icon": "myservice", "color": "#123456" }`.

Пуш в `main` → GitHub Actions собирает → Pages публикует.
