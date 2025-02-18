import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { defineNuxtModule, extendViteConfig, extendWebpackConfig, addPluginTemplate, addComponentsDir } from '@nuxt/kit'
import { UserConfig } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import presetAttributify, { AttributifyOptions } from '@unocss/preset-attributify'
import presetIcons, { IconsOptions } from '@unocss/preset-icons'

const dir = dirname(fileURLToPath(import.meta.url))

export interface UnocssNuxtOptions extends UserConfig {
  /**
   * Injecting `uno.css` entry automatically
   *
   * @default true
   */
  autoImport?: boolean

  /**
   * Enable the default preset
   * Only works when `presets` is not specified
   * @default true
   */
  uno?: boolean

  /**
   * Enable attributify mode and the options of it
   * Only works when `presets` is not specified
   * @default false
   */
  attributify?: boolean | AttributifyOptions

  /**
   * Enable icons preset and the options of it
   * Only works when `presets` is not specified
   * @default false
   */
  icons?: boolean | IconsOptions
}

export default defineNuxtModule<UnocssNuxtOptions>({
  name: 'unocss',
  defaults: {
    autoImport: true,
    uno: true,
  },
  configKey: 'unocss',
  setup(options) {
    // preset shortcuts
    if (options.presets == null) {
      options.presets = []
      if (options.uno)
        options.presets.push(presetUno())
      if (options.attributify)
        options.presets.push(presetAttributify(typeof options.attributify == 'boolean' ? {} : options.attributify))
      if (options.icons)
        options.presets.push(presetIcons(typeof options.icons == 'boolean' ? {} : options.icons))
    }

    if (options.autoImport) {
      addPluginTemplate({
        filename: 'unocss.mjs',
        src: '',
        getContents: () => 'import \'uno.css\';export default () => {};',
      })
    }

    addComponentsDir({
      path: resolve(dir, '../runtime'),
      watch: false,
    })

    extendViteConfig(async(config) => {
      const { default: Plugin } = await import('@unocss/vite')
      config.plugins = config.plugins || []
      config.plugins.unshift(...Plugin(options))
    })

    extendWebpackConfig(async(config) => {
      const { default: Plugin } = await import('@unocss/webpack')
      config.plugins = config.plugins || []
      config.plugins.push(Plugin(options))
    })
  },
})

declare module '@nuxt/kit' {
  interface NuxtOptions {
    unocss?: UnocssNuxtOptions
  }
}
