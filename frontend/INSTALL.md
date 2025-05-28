# STEP BY STEP

## 1. Create project

```bash
npm create vite@latest
```

## 2. Add Tailwind CSS

Install tailwind:

```bash
npm install tailwindcss @tailwindcss/vite tw-animate-css
```

Then, replace everything in `src/index.css` with the following:

```css
@import 'tailwindcss';
```

## 3. Edit Typescript configuration

Add the baseUrl and paths properties to the compilerOptions section of the `tsconfig.json` and `tsconfig.app.json` files:

```json
// tsconfig.json
{
  // ...
  "compilerOptions": {
    // ...
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

```json
// tsconfig.app.json
{
  "compilerOptions": {
    // ...
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
    // ...
  }
}
```

## 4. Update Vite configuration

Install the node types first:

```bash
npm install -D @types/node
```

Add the following code to the vite.config.ts so your app can resolve paths without error:

```ts
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [...tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

## 5. Add Shadcn/ui

Now run the CLI:

```bash
npx shadcn@latest init
```

You will be asked a few questions to configure components.json.

## 6. Add Components

Run the following cli to add any component you want:

```bash
npx shadcn@latest add <component?>
```

## 7. Add React Router to handle project

```bash
npm install react-router-dom
```

## 8. Add more necessary dependencies

```bash
npm install vite-tsconfig-paths axios 
```

**Note: Use `--legacy-peer-deps` if needed.**
