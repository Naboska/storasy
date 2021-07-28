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

## Quick Start

#### NodeJS

Inside your project directory, run in terminal:

```
yarn add @storasy/core
```

Or with npm:

```
npm install @storasy/core
```

#### Browser

```html
    ...
    <body>
    ...
    <script src="https://unpkg.com/@storasy/core/dist/umd/storasy.production.js"></script>
    <script>
      const storasy = window.storasy;
      ...
    </script>
    ...
    </body>
```

### API

- [StorasyClient](#StorasyClient)

#### StorasyClient

```ts
  import { createStorasyClient } from './create-storasy-client';

  //optional
  const options = {
    abortController: {
      createAbortController: () => new AbortController(),
      getSignal: controller => controller.signal,
      abort: controller => controller.abort(),
      checkOnError: error => error.name === 'AbortError'
    }
  };

  const storasyClient = createStorasyClient(options);
```

##### Accept:

###### - abortController

Optional, creates an AbortController by default. Allows you to cancel asynchronous requests.

Axios Example:
```ts
const abortController = {
  createAbortController: () => axios.CancelToken.source(),
  getSignal: (token: CancelTokenSource) => token.token,
  abort: (token: CancelTokenSource) => token.cancel(),
  checkOnError: error => axios.isCancel(error)
}
```

##### Return:

###### - instance

Getter for storasy instance, using setters `unsafe`. [API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map).

```ts
  const storasyClient = createStorasyClient();

  const item = storasyClient.instance.get('key');
```

###### - create

Secure key creation.

```ts
  const storasyClient = createStorasyClient();

  storasyClient.create('key', initialState = 1)
```

###### - delete
###### - run
###### - subscribe

## Examples

- [Browser (DEMO)](https://github.com/Naboska/storasy/tree/main/examples/browser)

## License

The MIT License.