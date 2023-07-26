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

The `start` script will start a local web server on port 3333 which prerenders the `views/index.html`. If you load the
page enough times, the copytext below the headline will sometimes be shown and sometimes not.

The attached video ![Reproduction Video](reproduction-video.webm) also shows the issue.
