# Storasy
<p>
  <a aria-label="NPM version" href="https://www.npmjs.com/package/@storasy/core">
    <img alt="" src="https://badgen.net/npm/v/@storasy/core">
  </a>
    <a aria-label="Package size" href="https://bundlephobia.com/result?p=@storasy/core">
      <img alt="" src="https://badgen.net/bundlephobia/minzip/@storasy/core">
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

```js
import { subscribe } from '@storasy/core';
//in progress
```

### API

```js
//in progress
```

## Examples

- [Configuration](#configuration)

### Global Configuration

The storage configuration takes place through the function `initStoreOptions`.

#### Options
- `asyncEvents`: contains methods for asynchronous requests:
  - `controller = () => new AbortController()`: interface represents a controller object that allows you to abort one or more Web requests as and when desired.
  - `signal = (controller: AbortController) => controller.signal`: Used to communicate with/abort a DOM request.
  - `controller = (controller: AbortController) => controller.abort()`: Aborts a DOM request before it has completed.

##### Configure axios request:
```ts
import { initStoreOptions } from '@storasy/core';
import axios, { CancelTokenSource } from 'axios';

initStoreOptions({
  asyncEvents: {
    controller: () => axios.CancelToken.source(),
    abort: (token: CancelTokenSource) => token.cancel(),
    signal: (token: CancelTokenSource) => token.token,
  },
})

```

## License

The MIT License.