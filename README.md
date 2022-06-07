# Stencil SSR Hydrate Error Reproduction

## Intall and prepare

As a first step install the projects dependencies.

```
npm install
```

This installs all required dependencies and builds the project afterwards.

## Reproduce

To reproduce the bug, I've created an index.html which shows the error. In order to run and access it, run:

```
npm start
```

The `start` script will start a local web server on port 3333 which prerenders the `views/index.html`. In here, you can
see the same component placed twice on the page.

The first instance is placed inside an `app-section` component, which just renders its slotted content with a few
additional styles. As you can see, the slotted content does not get re-hydrated correctly. It instead appears twice on
the page.

The second instance is **not** nested inside the `app-section` component. Here you can see, that it gets rendered and
re-hydrated correctly.
