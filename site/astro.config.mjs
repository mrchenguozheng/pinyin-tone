// @ts-check
import { defineConfig } from 'astro/config';

// The site is published as a project page, so everything lives under /pinyin-tone/.
// Any in-site path must go through import.meta.env.BASE_URL — writing '/' by hand
// works in dev and 404s in production.
export default defineConfig({
    site: 'https://mrchenguozheng.github.io',
    base: '/pinyin-tone'
});
