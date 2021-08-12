# Storasy
<p>
  <a aria-label="NPM version" href="https://www.npmjs.com/package/@storasy/core">
    <img alt="" src="https://badgen.net/npm/v/@storasy/core">
  </a>
    <a aria-label="Package size" href="https://bundlephobia.com/result?p=@storasy/core">
      <img alt="" src="https://badgen.net/bundlephobia/minzip/@storasy/core">
    </a>
    <a aria-label="Hist" href="https://www.jsdelivr.com/package/npm/@storasy/core">
      <img alt="" src="https://badgen.net/npm/dt/@storasy/core">
    </a>
</p>

![Storasy Header](https://github.com/Naboska/storasy/raw/main/media/logo.png)
library for working with asynchronous data


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
- [StorasyItem](#StorasyItem)

#### StorasyClient

```ts
import { createStorasyClient } from './create-storasy-client';

//options - optional
const storasyClient = createStorasyClient({
  abortController: {
    createAbortController: () => new AbortController(),
    getSignal: controller => controller.signal,
    abort: controller => controller.abort(),
    checkOnError: error => error.name === 'AbortError'
  }
});
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

###### - get

Getter for storasy item

```ts
const item = storasyClient.get('key');
```

###### - create

Creation storasy item.

```ts
//initialState - optional
storasyClient.create('key', initialState = 1)
```

###### - include

Checking for the presence of an item in the store.

```ts
storasyClient.include('key')
```

###### - put

Changing an existing item in the store.

```ts
storasyClient.put('key', 'newState');

// or with callback

storasyClient.put('key', oldState => 'newState');
```

###### - delete

Secure deletion of an item if there are no subscribers. Return a Boolean value.

```ts
const isDelete = storasyClient.delete('key');

console.log(isDelete);
```

###### - run

Starting the generator within the storasy item

```ts
function* generator(params) {}

const { refetch } = storasyClient.run('key', generator, {
    enabled: true, // If true, the generator will start immediately 
    params // Parameters that will get into the generator
});

// newParams - optional. Otherwise, the old ones get caught
refetch(newParams)
```

###### - subscribe

Subscription to change the state of the item

```ts
const state = null;

const unsubscribe = storasyClient.subscribe('key', item => state = item.state);
```

#### StorasyItem

```ts
const item = storasyClient.get('key');
```

###### - subscribersLength

Get the number of subscribers from the item

```ts
const subsLength = storasyClient.get('key').subscribersLength;
```

###### - getItem

Getter for state of the item

```ts
const item = storasyClient.get('key').getItem();

type TStorasyItem<T> = {
  state?: T;
  status: TStorasyItemStatus;
  error?: string;
  isLoaded: boolean;
  isLoading: boolean;
  isError: boolean;
  isStale: boolean;
};
```

###### - getState

Getter for item data

```ts
const data = storasyClient.get('key').getState();
```

###### - putState

Setter for item data

```ts
const item = storasyClient.get('key');

item.put('newData');

// or with callback

item.put(oldData => 'newData');
```

###### - putStatus

Set new item status

```ts
const item = storasyClient.get('key');
const newStatus = 'loading' | 'loaded';

item.putStatus(newStatus);
```

###### - putItem

Setter for item

```ts
const item = storasyClient.get('key');

item.putStatus(
    newState, //  newState | (oldState) => newState
    newStatus, // 'loading' | 'loaded'
    error, // string | undefined
);
```

###### - subscribe

Subscribe to item change

```ts
const item = storasyClient.get('key');
const state = null;

const unsubscribe = item.subscribe(itemState => state = itemState.state);
```

###### - getAbortController

Get the controller to cancel the request

```ts
const item = storasyClient.get('key');

const ac = item.getAbortController();
```


## Examples

- [Browser (DEMO)](https://github.com/Naboska/storasy/tree/main/examples/browser)

## License

The MIT License.