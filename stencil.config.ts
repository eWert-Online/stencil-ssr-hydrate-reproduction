import { Config } from "@stencil/core";
import { sass } from "@stencil/sass";
import resolvePlugin from "@rollup/plugin-node-resolve";

export const config: Config = {
  namespace: "ssr-repro-app",
  srcDir: "src/components",
  taskQueue: "async",
  sourceMap: true,
  buildEs5: "prod",
  rollupPlugins: {
    before: [resolvePlugin({ browser: true })],
  },
  outputTargets: [
    {
      type: "dist",
      dir: "public/dist",
      esmLoaderPath: "../loader",
      empty: false,
    },
    {
      type: "dist-hydrate-script",
      dir: "public/hydrate",
      empty: false,
    },
  ],
  plugins: [
    sass({
      injectGlobalPaths: ["tokens.scss"],
    }),
  ],
  globalStyle: "src/global.scss",
};
