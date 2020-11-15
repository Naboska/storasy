# Storasy
<p>
  <a aria-label="NPM version" href="https://www.npmjs.com/package/@storasy/core">
    <img alt="" src="https://badgen.net/npm/v/@storasy/core">
  </a>
    <a aria-label="Package size" href="https://bundlephobia.com/result?p=@storasy/core">
      <img alt="" src="https://badgen.net/bundlephobia/minzip/@storasy/core">
    </a>
    <a aria-label="Hist" href="https://www.jsdelivr.com/package/npm/@storasy/core">
      <img alt="" src="https://data.jsdelivr.com/v1/package/npm/@storasy/core/badge">
    </a>
</p>

![Storasy Header](https://github.com/Naboska/storasy/raw/main/media/logo.png)
library for working with asynchronous data

**status**: in development

<br/>

## Usage

Inside your project directory, run in terminal:

```
yarn add @storasy/core
```

Or with npm:

```
npm install @storasy/core
```

## Quick Start

#### NodeJS

```js
import { subscribe } from '@storasy/core';
//in progress
```

#### Browser

Works by providing a library of "[SystemJS](https://github.com/systemjs/systemjs)"

```html
    ...
    <body>
    ...
    <script src="https://unpkg.com/systemjs/dist/system.js"></script>
    <script src="https://unpkg.com/systemjs/dist/extras/named-register.js"></script>
    <script>
        let storasy;
        
        async function main() {
            //TODO https://github.com/systemjs/systemjs/issues/2192
            await System.import('https://unpkg.com/@storasy/core/dist/browser.js').catch(() => void 0);
            await System.import("index").then(modules => storasy = modules);
            controller()
        }

        function controller() {
            let items;
            storasy.subscribe('key', data => items = data)
        }   
        
        main();
    </script>
    ...
    </body>
```

### API

```js
//in progress
```

## Examples

- [SystemJS (DEMO)](https://github.com/Naboska/storasy/tree/main/examples/browser)
- [Configuration](#configuration)

### Configuration

The storage configuration takes place through the function `initStoreOptions`.

#### Options
- `asyncEvents`: contains methods for asynchronous requests:
  - `controller = () => new AbortController()`: interface represents a controller object that allows you to abort one or more Web requests as and when desired.
  - `signal = (controller: AbortController) => controller.signal`: Used to communicate with/abort a DOM request.
  - `controller = (controller: AbortController) => controller.abort()`: Aborts a DOM request before it has completed.

##### Configure axios request:
```ts
import { initStoreOptions, ABORT_CONTROLLER_MESSAGE } from '@storasy/core';
import axios, { CancelTokenSource } from 'axios';

//ABORT_CONTROLLER_MESSAGE need for check error.message

initStoreOptions({
  asyncEvents: {
    controller: () => axios.CancelToken.source(),
    abort: (token: CancelTokenSource) => token.cancel(ABORT_CONTROLLER_MESSAGE),
    signal: (token: CancelTokenSource) => token.token,
  },
})

```

## License

The MIT License.