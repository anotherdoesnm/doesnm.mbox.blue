# doesnm.mbox.blue

My link page, spread over three repositories:

| repository | role |
|---|---|
| this one | `site.json`, `links.json`, icons, avatar — nothing else |
| [action-littlelink](https://github.com/anotherdoesnm/action-littlelink) | the renderer: fetches upstream `brands.css` at a pinned commit and emits one HTML file |
| [littlelink-template](https://github.com/anotherdoesnm/littlelink-template) | the template this repository was created from |

The renderer and the vendored stylesheets used to live here, which meant every fork
carried its own copy and they drifted. Now updating the styles is a bump in the
action, with no change in this repository.

## Editing

- content — `site.json`, `links.json`;
- images — `assets/avatar.png`, `assets/icons/<name>.svg`;
- a button with no upstream style — `{ "brand": "myservice", "icon": "myservice", "color": "#123456" }`.

Push to `main`, GitHub Actions builds, Pages publishes.
