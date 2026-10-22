import figmaPlugins from '@figma/eslint-plugin-figma-plugins';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/', 'node_modules/', 'scripts/', '*.config.*'] },
  ...tseslint.configs.recommended,
  {
    files: ['src/main/**/*.ts'],
    plugins: { '@figma/figma-plugins': figmaPlugins },
    rules: { ...figmaPlugins.configs.recommended.rules },
    languageOptions: { globals: { figma: 'readonly', __html__: 'readonly', __TODE_API_KEY__: 'readonly' } },
  },
);
