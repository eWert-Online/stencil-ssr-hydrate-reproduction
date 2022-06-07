import { Config } from "@stencil/core";
import { sass } from "@stencil/sass";
import resolvePlugin from "@rollup/plugin-node-resolve";

export const config: Config = {
  namespace: "ssr-repro-app",
  srcDir: "src/components",
  taskQueue: "async",
  rollupPlugins: {
    before: [resolvePlugin({ browser: true })],
  },
  buildEs5: "prod",
  extras: {
    cssVarsShim: false,
    dynamicImportShim: true,
    safari10: false,
    shadowDomShim: false,
  },
  outputTargets: [
    {
      type: "dist",
      dir: "public/dist",
      esmLoaderPath: "../loader",
      empty: true,
    },
    {
      type: "dist-hydrate-script",
      dir: "public/hydrate",
      empty: true,
    },
  ],
  plugins: [
    sass({
      injectGlobalPaths: ["tokens.scss"],
    }),
  ],
  globalStyle: "src/global.scss",
};
