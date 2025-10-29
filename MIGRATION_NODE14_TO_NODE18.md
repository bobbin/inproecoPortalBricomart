### Migración de Node 14 a Node 18 en proyectos CRA antiguos (base de este repo)

- Objetivo: compilar y ejecutar en Node 18 un proyecto Create React App antiguo (Webpack 4/Node 14).
- Resultado: proyecto ejecutándose en Node 18 con CRA 5, Sass moderno, polyfills de Webpack 5, imports corregidos y GraphQL funcionando sin apollo-boost.

## 1) Sustituir node-sass por sass

Por qué: node-sass 4.x no soporta Node 18.

- Desinstalar node-sass y node-sass-chokidar; instalar sass.
- Actualizar scripts en package.json:

```json
{
  "scripts": {
    "build-css": "sass --load-path=./src --load-path=./node_modules src:src",
    "watch-css": "npm run build-css && sass --load-path=./src --load-path=./node_modules src:src --watch"
  }
}
```

Notas: Sass mostrará advertencias deprecadas por `@import` y `lighten/darken`. No bloquean; migrar a `@use`/`@forward` y `color.adjust/scale` cuando sea posible.

## 2) Actualizar CRA y React

- Subir `react-scripts` a `^5.0.1` (Webpack 5 y Node 18 OK).
- Subir `react` y `react-dom` a `^18.2.0`.

Esperar “peer dependency warnings” de librerías antiguas; no suelen bloquear.

## 3) Polyfills de Node para Webpack 5

Webpack 5 ya no incluye polyfills automáticos.

- Instalar: `react-app-rewired`, `crypto-browserify`, `stream-browserify`, `util`, `process`, `buffer`.
- Crear `config-overrides.js` en la raíz:

```js
const webpack = require('webpack');

module.exports = function override(config) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    util: require.resolve('util'),
    vm: false,
  };

  config.resolve.alias = {
    ...(config.resolve.alias || {}),
    // Opcional: ignorar módulos no usados
    'aws-amplify': false,
    '@aws-amplify/core': false,
    '@aws-amplify/pubsub': false,
    '@aws-amplify/api-graphql': false,
    'apollo-boost': false,
    graphql: false,
  };

  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ]);

  return config;
};
```

- Cambiar scripts a `react-app-rewired`:

```json
{
  "scripts": {
    "start-js": "react-app-rewired start",
    "start": "npm-run-all -p watch-css start-js",
    "build": "npm run build-css && react-app-rewired --max_old_space_size=8192 build"
  }
}
```

## 4) Corregir imports estrictos de CRA 5

Cambiar imports tipo módulo dentro de `src` a relativos, o habilitar imports absolutos:

- `import "assets/..."` → `import "./assets/..."`
- `import "routes/index.jsx"` → `import "./routes/index.jsx"`

O bien crear `jsconfig.json` (en la raíz):

```json
{
  "compilerOptions": { "baseUrl": "src" },
  "include": ["src"]
}
```

## 5) Rutas de imágenes en CSS

En ficheros CSS/SCSS dentro de `src/assets/scss`, usar rutas relativas al CSS generado:

- `background-image: url(../img/fondo.jpg);`

Evitar rutas absolutas `/fondo.jpg` salvo que el archivo esté en `public/` (entonces `url(/fondo.jpg)` es válido).

## 6) AWS Amplify / GraphQL (dos opciones)

Muchos errores se deben a versiones antiguas (`apollo-boost`, Amplify 3.x, `graphql` ESM). Dos caminos:

### Opción A (rápida para salir del paso)

- Eliminar `aws-amplify`, `apollo-boost`, `graphql` de `package.json`.
- Añadir alias `false` en `config-overrides.js` (ver arriba) para ignorar módulos si algún import quedó.
- Sustituir `apollo-boost` por un cliente mínimo basado en `fetch`:

```js
// src/components/graphql.js
const gql = (strings) => strings[0];

export const client = {
  query: async ({ query, variables }) => {
    const token = sessionStorage.getItem('token');
    const res = await fetch('https://<tu-endpoint>/v1/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ query, variables }),
    });
    const json = await res.json();
    if (json.errors) throw new Error(JSON.stringify(json.errors));
    return { data: json.data };
  },
  mutate: async ({ mutation, variables }) => {
    const token = sessionStorage.getItem('token');
    const res = await fetch('https://<tu-endpoint>/v1/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ query: mutation, variables }),
    });
    const json = await res.json();
    if (json.errors) throw new Error(JSON.stringify(json.errors));
    return { data: json.data };
  },
};
```

- Donde se usaba `ConsoleLogger` de Amplify, usar stub:

```js
const ConsoleLogger = function () { return console; };
```

### Opción B (recomendada a medio plazo)

- Migrar a `@apollo/client` v3 y `graphql` ^16.
- Subir `aws-amplify` a v5.
- Sustituir `apollo-boost` (deprecated) por Apollo Client v3 (`InMemoryCache`, `HttpLink`, etc.).

## 7) Limpieza e instalación

```bash
# Windows (cmd)
rmdir /s /q node_modules
del package-lock.json 2>nul
yarn install
```

Asegurar que `npm-run-all` (`4.1.5`) está en dependencias (se usa en scripts).

## 8) Verificación

- `yarn start` sin errores de compilación.
- Revisar consola del navegador por errores de imports/rutas.
- Probar pantallas que hacen `client.query`/`client.mutate`.

## 9) Cambios típicos en package.json (resumen)

- Dependencias:
  - + `sass`, `react-app-rewired`, `crypto-browserify`, `stream-browserify`, `util`, `process`, `buffer`
  - ↑ `react-scripts` a `^5.0.1`; ↑ `react`/`react-dom` a `^18.2.0`
  - − `node-sass`, `node-sass-chokidar`, `apollo-boost`, `aws-amplify`, `graphql` (si usas Opción A)
- Scripts:
  - `build-css`/`watch-css` con `sass`
  - `start-js: react-app-rewired start`
  - `build: react-app-rewired --max_old_space_size=8192 build`

## 10) Siguientes pasos recomendados

- Migrar Sass `@import`→`@use/@forward` y funciones `lighten/darken`→`color.adjust/scale`.
- Si necesitas funcionalidades avanzadas de cache/link, migrar a `@apollo/client` v3 (Opción B).
- Planificar actualización de librerías antiguas (Material UI v4, reactstrap 8, etc.).

## 11) Checklist rápido para repetir en otros proyectos

1. Reemplazar `node-sass`→`sass` y scripts CSS.
2. Subir `react-scripts` a 5 y `react/react-dom` a 18.
3. Instalar polyfills + `react-app-rewired`; crear `config-overrides.js`.
4. Corregir imports o crear `jsconfig.json` con `baseUrl: "src"`.
5. Arreglar rutas de imágenes CSS.
6. Elegir:
   - A) Quitar Amplify/apollo-boost y usar cliente `fetch` temporal.
   - B) Migrar a `@apollo/client` v3 + `aws-amplify` v5.
7. Borrar `node_modules` y reinstalar; verificar `npm-run-all`.
8. `yarn start` y ajustar lo que falte.


