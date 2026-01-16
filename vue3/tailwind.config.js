/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'color-background': "var(--color-background)",
        'color-background-soft': "var(--color-background-soft)",
        'color-background-mute': "var(--color-background-mute)",
        'color-text': "var(--color-text)",
        'color-text-soft': "var(--color-text-soft)",
        // 自动生成 el-color，生成 --el-color-primary-light-1 这种的，参考 src\assets\styles\element-plus.scss
        ...(() => {
          const lightSteps = [1, 2, 3, 4, 5, 6, 7, 8, 9];
          const darkSteps = [1, 2, 3, 4, 5, 6, 7, 8, 9];
          const colorTypes = [
            "primary", "success", "info", "warning", "danger", "error"
          ]
          const colorPrefixName = 'el'
          const colorPrefixNameVar = '--el-color'

          const result = Object.fromEntries(
            colorTypes.flatMap(type => [
              // base color
              [`${colorPrefixName}-${type}`, `var(${colorPrefixNameVar}-${type})`],
              ...lightSteps.map(step => [
                `${colorPrefixName}-${type}-light-${step}`,
                `var(${colorPrefixNameVar}-${type}-light-${step})`
              ]),
              ...darkSteps.map(step => [
                `${colorPrefixName}-${type}-dark-${step}`,
                `var(${colorPrefixNameVar}-${type}-dark-${step})`
              ]),
            ])
          );
          return result
        })(),
        // 自动生成透明度背景色变量，参考 src\assets\styles\color.scss
        ...Object.fromEntries(
          [10, 20, 30, 40, 50, 60, 70, 80, 90, 95].flatMap(opacity => [
            [`color-background-a${opacity}`, `var(--color-background-a${opacity})`],
            [`color-background-soft-a${opacity}`, `var(--color-background-soft-a${opacity})`],
            [`color-background-mute-a${opacity}`, `var(--color-background-mute-a${opacity})`],
          ])
        ),
        // 自动生成 poto-color 参考 src\assets\styles\color.scss
        ...(() => {
          const lightSteps = [3, 5, 7, 8, 9];
          const darkSteps = [2];
          const colorTypes = [
            "harvest-wheat",
            "amber-sand",
            "clay-orange",
            "ember-rust",
            "terra-red",
            "plum-rose",
            "violet-dusk",
            "indigo-mist",
            "mist-blue",
            "dusk-cyan",
            "moss-green",
            "olive-haze",
          ];
          const colorPrefixName = 'poto'
          const colorPrefixNameVar = '--poto-color'

          const result = Object.fromEntries(
            colorTypes.flatMap(type => [
              // base color
              [`${colorPrefixName}-${type}`, `var(${colorPrefixNameVar}-${type})`],
              ...lightSteps.map(step => [
                `${colorPrefixName}-${type}-light-${step}`,
                `var(${colorPrefixNameVar}-${type}-light-${step})`
              ]),
              ...darkSteps.map(step => [
                `${colorPrefixName}-${type}-dark-${step}`,
                `var(${colorPrefixNameVar}-${type}-dark-${step})`
              ]),
            ])
          );
          return result
        })(),
      }
    }
  },
  plugins: [],
}

