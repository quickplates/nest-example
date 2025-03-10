import type { Options, ThemeConfig } from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";

import { themes } from "prism-react-renderer";

const url = new URL("https://quickplates.github.io/nest-example");

export default {
  baseUrl: url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`,
  favicon: "favicon.svg?v=1",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  presets: [
    [
      "classic",
      {
        // Disable blog
        blog: false,

        docs: {
          // Use docs on root
          routeBasePath: "/",

          // Use autogenerated sidebar
          sidebarPath: undefined,
        },

        theme: {
          customCss: "custom.css",
        },
      } satisfies Options,
    ],
  ],

  themeConfig: {
    navbar: {
      items: [
        {
          "aria-label": "GitHub repository",
          className: "header-github-link",
          href: "https://github.com/quickplates/nest-example",
          position: "right",
        },
      ],

      logo: {
        alt: "nest-example docs logo",
        src: "logo.svg?v=1",
      },

      title: "nest-example docs",
    },

    prism: {
      darkTheme: themes.dracula,
      theme: themes.github,
    },
  } satisfies ThemeConfig,

  title: "nest-example docs",
  url: `${url.protocol}//${url.host}`,
} satisfies Config;
