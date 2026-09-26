/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  'extends': [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-prettier/skip-formatting'
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  overrides: [
    {
      // App root panel routed via HomeView — single-word name is intentional
      files: ['src/components/Scoreboard.vue'],
      rules: {
        'vue/multi-word-component-names': 'off'
      }
    }
  ]
}
