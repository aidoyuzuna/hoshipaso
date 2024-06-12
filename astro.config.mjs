import tailwind from "@astrojs/tailwind"
import Compress from "astro-compress"
import icon from "astro-icon"
import { defineConfig } from "astro/config"
import Color from "colorjs.io"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeKatex from "rehype-katex"
import rehypeSlug from "rehype-slug"
import remarkMath from "remark-math"
import remarkReadingTime from "remark-reading-time"
import { GithubCardComponent, AdmonitionComponent } from "rehype-components"
import remarkDirective from "remark-directive" /* Handle directives */
import remarkDirectiveRehype from 'remark-directive-rehype' /* Pass directives to rehype */
import rehypeComponents from "rehype-components"; /* Render the custom directive content */
import svelte from "@astrojs/svelte"
import swup from '@swup/astro';
import sitemap from '@astrojs/sitemap';
import parseDirectiveNode from "remark-directive-rehype";

const oklchToHex = (str) => {
  const DEFAULT_HUE = 250
  const regex = /-?\d+(\.\d+)?/g
  const matches = str.string.match(regex)
  const lch = [matches[0], matches[1], DEFAULT_HUE]
  return new Color("oklch", lch).to("srgb").toString({
    format: "hex",
  })
}

// https://astro.build/config
export default defineConfig({
  site: "https://aidoyuzuna.github.io",
  base: '/hoshipaso',
  trailingSlash: "always",
  integrations: [
    tailwind(),
    swup({
      theme: false,
      animationClass: 'transition-',
      containers: ['main'],
      smoothScrolling: true,
      cache: true,
      preload: true,
      accessibility: true,
      globalInstance: true,
    }),
    icon({
      include: {
        "material-symbols": ["*"],
        "fa6-brands": ["*"],
        "fa6-regular": ["*"],
        "fa6-solid": ["*"],
      },
    }),
    Compress({
      Image: false,
    }),
    svelte(),
    sitemap(),
  ],
  markdown: {
    remarkPlugins: [remarkMath, remarkReadingTime, remarkDirective, parseDirectiveNode],
    rehypePlugins: [
      rehypeKatex,
      rehypeSlug,
      ["rehype-toc", { headings: ["h2", "h3"] }],
      [rehypeComponents, {
        components: {
          github: GithubCardComponent,
          note: (x, y) => AdmonitionComponent(x, y, "note"),
          tip: (x, y) => AdmonitionComponent(x, y, "tip"),
          important: (x, y) => AdmonitionComponent(x, y, "important"),
          caution: (x, y) => AdmonitionComponent(x, y, "caution"),
          warning: (x, y) => AdmonitionComponent(x, y, "warning"),
        },
      }],
      [
        rehypeAutolinkHeadings,
        {
          behavior: "append",
          properties: {
            className: ["anchor"],
          },
          content: {
            type: "element",
            tagName: "span",
            properties: {
              className: ["anchor-icon"],
              'data-pagefind-ignore': true,
            },
            children: [
              {
                type: "text",
                value: "#",
              },
            ],
          },
        },
      ],
    ],
  },
  vite: {
    build: {
      rollupOptions: {
        onwarn(warning, warn) {
          // temporarily suppress this warning
          if (warning.message.includes("is dynamically imported by") && warning.message.includes("but also statically imported by")) {
            return;
          }
          warn(warning);
        }
      }
    },
    css: {
      preprocessorOptions: {
        stylus: {
          define: {
            oklchToHex: oklchToHex,
          },
        },
      },
    },
  },
})
