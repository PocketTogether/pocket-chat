import { globalIgnores } from 'eslint/config'
import {
  defineConfigWithVueTs,
  vueTsConfigs,
} from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

import eslintPluginPrettier from 'eslint-plugin-prettier'
import vueEslintParser from 'vue-eslint-parser'
// pnpm install --save-dev eslint-plugin-prettier vue-eslint-parser

import pluginQuery from '@tanstack/eslint-plugin-query'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  globalIgnores([
    '**/dist/**',
    '**/dist-ssr/**',
    '**/coverage/**',
    // 有报错但实际上无所谓，让eslint忽略即可
    'postcss.config.js',
    'tailwind.config.js',
    // 自动生成的 pocketbase-types 就不用eslint了
    // 'pocketbase-types.ts',
    './src/lib/pocketbase/pocketbase-types.ts',
    // 工具脚本不用
    './scripts/**',
  ]),

  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,
  skipFormatting,
  [
    ...pluginQuery.configs['flat/recommended'],
    {
      plugins: {
        prettier: eslintPluginPrettier,
        // '@typescript-eslint': eslintPluginTs
      },
      languageOptions: {
        // @typescript-eslint/strict-boolean-expressions 所需
        parser: vueEslintParser,
        parserOptions: {
          parser: '@typescript-eslint/parser', // vue-eslint-parser 转发给 ts 解析器
          project: './tsconfig.json', // 必须指定 tsconfig.json 路径，开启类型信息
          extraFileExtensions: ['.vue'],
          ecmaVersion: 2020,
          sourceType: 'module',
        },
      },
      rules: {
        // Standard 风格核心部分
        semi: ['error', 'never'],
        quotes: ['error', 'single'],
        // 'comma-dangle': ['error', 'always-multiline'],
        // 'space-before-function-paren': ['error', 'always'],
        // 'no-unused-vars': 'warn',
        'no-console': 'warn',
        // 'no-debugger': 'error',
        // 更严格的ESLint
        // 强制使用 ===，但允许 == null（这是一个约定俗成的例外）
        eqeqeq: ['error', 'always', { null: 'ignore' }],
        // 不允许使用隐式类型转换，比如 !!foo、+foo
        'no-implicit-coercion': 'error',
        // 避免非布尔值被 if 或 ! 语句使用
        // 'no-implicit-coercion': ['error', { boolean: false }], （好像不生效）
        // '@typescript-eslint/strict-boolean-expressions': 'error',
        '@typescript-eslint/strict-boolean-expressions': [
          'error',
          {
            allowNullableBoolean: false,
            allowString: false,
            allowNumber: false,
            allowNullableString: false,
            allowNullableNumber: false,
            allowAny: false,
          },
        ],
        // 禁止不必要的布尔转换，比如 if (!!foo)
        'no-extra-boolean-cast': 'error',
        // 禁用 alert、confirm、prompt（在生产代码中一般不建议使用）
        'no-alert': 'warn',
        // 禁用未使用的变量（默认已启用）
        // 'no-unused-vars': [
        //   'warn',
        //   { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
        // ],
        // 禁止 debugger，避免调试代码遗留
        'no-debugger': 'error',
        // 禁用 with（严格模式中已废弃）
        'no-with': 'error',
        // 禁止使用 arguments.callee 和 arguments.caller（已过时）
        'no-caller': 'error',
        // 禁止将 await 写在非 async 函数中
        'no-return-await': 'error',
        // 禁止混用 tabs 和 spaces（Prettier 会处理，但冗余提示也可以启用）
        'no-mixed-spaces-and-tabs': 'error',
        // 禁止 eval（安全问题）
        'no-eval': 'error',
        // 强制函数参数有明确顺序（如默认参数不能在非默认之后）
        'default-param-last': 'error',
        // 禁止 function 声明出现在嵌套块中（避免提升问题）
        'no-inner-declarations': ['error', 'functions'],

        'vue/multi-word-component-names': [
          'warn',
          {
            ignores: ['index'], // vue组件名称多单词组成（忽略index.vue）
          },
        ],
        'vue/no-setup-props-destructure': ['off'], // 关闭 props 解构的校验
        // 未定义变量错误提示
        // 'no-undef': 'error',
        // Nuxt/Vue 常见优化
        'vue/no-v-html': 'off',
        // 组件参数不用连字符命名，用小驼峰命名
        'vue/attribute-hyphenation': ['warn', 'never'],
        // 组件名大驼峰
        'vue/component-name-in-template-casing': [
          'warn',
          'PascalCase',
          {
            registeredComponentsOnly: false,
            ignores: [],
          },
        ],
        // 关闭 Vue 组件的自闭合标签检查，允许 <img> 和 <br> 等标签不使用自闭合写法
        'vue/html-self-closing': 'off',
        // 关闭单一根元素限制（适用于 Vue 3 及以上）
        'vue/no-multiple-template-root': 'off',
        // 未使用值警告
        '@typescript-eslint/no-unused-vars': [
          'warn',
          { varsIgnorePattern: '^_' },
        ],
        // 空行控制
        'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }],
        // 规范属性顺序
        'vue/attributes-order': 'warn',
        // prettier 自己习惯的配置
        'prettier/prettier': [
          'warn',
          {
            singleQuote: true, // 单引号
            semi: false, // 无分号
            printWidth: 80, // 每行宽度至多80字符
            // trailingComma: 'none', // 不加对象|数组最后逗号
            endOfLine: 'auto', // 换行符号不限制（win mac 不一致）
            plugins: [
              // 规范 tailwindcss 类名顺序
              'prettier-plugin-tailwindcss',
            ],
          },
        ],
        '@typescript-eslint/consistent-type-imports': [
          'error',
          {
            prefer: 'type-imports', // `import type`
            fixStyle: 'separate-type-imports', // 让 ESLint 自动修复
          },
        ],
        // 'vue/no-undef-components': [
        //   'warn',
        //   {
        //     ignorePatterns: [
        //       // 允许的全局组件名（如果你有）
        //       // 'RouterView',
        //       // 'RouterLink',
        //     ],
        //   },
        // ],
        '@typescript-eslint/no-unsafe-member-access': 'error',
      },
    },
  ]
  // {
  //   plugins: {
  //     prettier: eslintPluginPrettier,
  //     // '@typescript-eslint': eslintPluginTs
  //   },
  //   languageOptions: {
  //     // @typescript-eslint/strict-boolean-expressions 所需
  //     parser: vueEslintParser,
  //     parserOptions: {
  //       parser: '@typescript-eslint/parser', // vue-eslint-parser 转发给 ts 解析器
  //       project: './tsconfig.json', // 必须指定 tsconfig.json 路径，开启类型信息
  //       extraFileExtensions: ['.vue'],
  //       ecmaVersion: 2020,
  //       sourceType: 'module',
  //     },
  //   },
  //   rules: {
  //     // Standard 风格核心部分
  //     semi: ['error', 'never'],
  //     quotes: ['error', 'single'],
  //     // 'comma-dangle': ['error', 'always-multiline'],
  //     // 'space-before-function-paren': ['error', 'always'],
  //     // 'no-unused-vars': 'warn',
  //     'no-console': 'warn',
  //     // 'no-debugger': 'error',
  //     // 更严格的ESLint
  //     // 强制使用 ===，但允许 == null（这是一个约定俗成的例外）
  //     eqeqeq: ['error', 'always', { null: 'ignore' }],
  //     // 不允许使用隐式类型转换，比如 !!foo、+foo
  //     'no-implicit-coercion': 'error',
  //     // 避免非布尔值被 if 或 ! 语句使用
  //     // 'no-implicit-coercion': ['error', { boolean: false }], （好像不生效）
  //     // '@typescript-eslint/strict-boolean-expressions': 'error',
  //     '@typescript-eslint/strict-boolean-expressions': [
  //       'error',
  //       {
  //         allowNullableBoolean: false,
  //         allowString: false,
  //         allowNumber: false,
  //         allowNullableString: false,
  //         allowNullableNumber: false,
  //         allowAny: false,
  //       },
  //     ],
  //     // 禁止不必要的布尔转换，比如 if (!!foo)
  //     'no-extra-boolean-cast': 'error',
  //     // 禁用 alert、confirm、prompt（在生产代码中一般不建议使用）
  //     'no-alert': 'warn',
  //     // 禁用未使用的变量（默认已启用）
  //     // 'no-unused-vars': [
  //     //   'warn',
  //     //   { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
  //     // ],
  //     // 禁止 debugger，避免调试代码遗留
  //     'no-debugger': 'error',
  //     // 禁用 with（严格模式中已废弃）
  //     'no-with': 'error',
  //     // 禁止使用 arguments.callee 和 arguments.caller（已过时）
  //     'no-caller': 'error',
  //     // 禁止将 await 写在非 async 函数中
  //     'no-return-await': 'error',
  //     // 禁止混用 tabs 和 spaces（Prettier 会处理，但冗余提示也可以启用）
  //     'no-mixed-spaces-and-tabs': 'error',
  //     // 禁止 eval（安全问题）
  //     'no-eval': 'error',
  //     // 强制函数参数有明确顺序（如默认参数不能在非默认之后）
  //     'default-param-last': 'error',
  //     // 禁止 function 声明出现在嵌套块中（避免提升问题）
  //     'no-inner-declarations': ['error', 'functions'],

  //     'vue/multi-word-component-names': [
  //       'warn',
  //       {
  //         ignores: ['index'], // vue组件名称多单词组成（忽略index.vue）
  //       },
  //     ],
  //     'vue/no-setup-props-destructure': ['off'], // 关闭 props 解构的校验
  //     // 未定义变量错误提示
  //     // 'no-undef': 'error',
  //     // Nuxt/Vue 常见优化
  //     'vue/no-v-html': 'off',
  //     // 组件参数不用连字符命名，用小驼峰命名
  //     'vue/attribute-hyphenation': ['warn', 'never'],
  //     // 组件名大驼峰
  //     'vue/component-name-in-template-casing': [
  //       'warn',
  //       'PascalCase',
  //       {
  //         registeredComponentsOnly: false,
  //         ignores: [],
  //       },
  //     ],
  //     // 关闭 Vue 组件的自闭合标签检查，允许 <img> 和 <br> 等标签不使用自闭合写法
  //     'vue/html-self-closing': 'off',
  //     // 关闭单一根元素限制（适用于 Vue 3 及以上）
  //     'vue/no-multiple-template-root': 'off',
  //     // 未使用值警告
  //     '@typescript-eslint/no-unused-vars': [
  //       'warn',
  //       { varsIgnorePattern: '^_' },
  //     ],
  //     // 空行控制
  //     'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }],
  //     // 规范属性顺序
  //     'vue/attributes-order': 'warn',
  //     // prettier 自己习惯的配置
  //     'prettier/prettier': [
  //       'warn',
  //       {
  //         singleQuote: true, // 单引号
  //         semi: false, // 无分号
  //         printWidth: 80, // 每行宽度至多80字符
  //         // trailingComma: 'none', // 不加对象|数组最后逗号
  //         endOfLine: 'auto', // 换行符号不限制（win mac 不一致）
  //         plugins: [
  //           // 规范 tailwindcss 类名顺序
  //           'prettier-plugin-tailwindcss',
  //         ],
  //       },
  //     ],
  //     '@typescript-eslint/consistent-type-imports': [
  //       'error',
  //       {
  //         prefer: 'type-imports', // `import type`
  //         fixStyle: 'separate-type-imports', // 让 ESLint 自动修复
  //       },
  //     ],
  //   },
  // }
)
