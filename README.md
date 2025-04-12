<div align="center">

# signal-logger

[![Latest Release](https://badgen.net/github/release/oleg-putseiko/signal-logger?icon=github&cache=240)](https://github.com/oleg-putseiko/signal-logger/releases)
[![Total Downloads](https://badgen.net/npm/dt/signal-logger?icon=npm&cache=240)](https://www.npmjs.com/package/signal-logger)
[![Install Size](https://badgen.net/packagephobia/install/signal-logger?color=purple&cache=240)](https://www.npmjs.com/package/signal-logger)
[![License](https://badgen.net/npm/license/signal-logger?color=black&cache=240)](https://github.com/oleg-putseiko/signal-logger/blob/main/LICENSE.md)

</div>

Signal Logger is a logger that allows you to send stylized or custom messages to a variety of services.

## Advantages

✨ Logging to an unlimited number of services with on call

✨ Built-in console, Telegram, Mattermost and JetBrains Space log providers

✨ The ability to create your own log providers

## Installation

```bash
npm install signal-logger

# or
pnpm install signal-logger

# or
yarn add signal-logger
```

## Getting Started

### Logging

To access the logger API, create its instance:

```ts
const logger = new Logger({
  providers: {
    // …
  },
});
```

Logging requires providers, which are a service for sending or displaying messages.

To register a provider, specify a property in the `providers` object. The property key can be any, it will be used to access the provider options. And the property value must be an instance of a log provider:

```ts
const logger = new Logger({
  providers: {
    console: new ConsoleLogProvider(),
    telegram: new TelegramLogProvider({
      // …
    }),

    // another loggers…
  },
});
```

To log messages you can pass an array of these messages:

```ts
logger.info(['Some info message', { foo: 'bar' }]);
```

Or you can specify them in the `messages` property. For example, this is the same:

```ts
logger.info({
  messages: ['Some info message', { foo: 'bar' }],
});
```

To specify a different set of messages for a specific provider, you need to override the options for it using the key specified in the logger constructor:

```ts
logger.info({
  messages: ['Some info message', { foo: 'bar' }],
  providers: {
    telegram: {
      messages: ['Another info message'],
    },
  },
});
```

Log providers may have message templates. To log a template message, pass an options required for a provider you are using in the `template` property:

```ts
logger.info({
  template: {
    title: 'Some info message',
    description: '…',
    // …
  },
});

logger.info({
  template: {
    title: 'Some info message',
    description: '…',
    // …
  },
  providers: {
    telegram: {
      template: {
        title: 'Another info message',
        description: '…',
        // …
      },
    },
  },
});
```

### Enable and disable logging

The logger supports disabling logging. This may be necessary, for example, to prevent messages from being displayed in production.

To disable all providers, specify the value of the `enabled` property in the logger constructor:

```ts
const logger = new Logger({
  enabled: process.env.NODE_ENV !== 'production',
  // …
});
```

To enable or disable logging for a specific provider specify the value of the `enabled` property for it in the `providers` property:

```ts
logger.info({
  // …
  providers: {
    telegram: {
      enabled: false,
    },
  },
});
```

### Log deduplication

Log deduplication prevents logging of duplicate messages. Of all the identical messages found in a certain period of time, only one will be logged.

By default, deduplication is disabled. To enable it, specify `true` as the value of the `deduplicate` property in the logger constructor options:

```ts
const logger = new Logger({
  deduplicate: true,
  // …
});
```

The default interval during which duplicates will be detected from the moment the logging method is called is `100` milliseconds. To specify a different interval, pass a value in milliseconds for the `interval` property in the `deduplicate` property:

```ts
const logger = new Logger({
  deduplicate: { interval: 1000 },
  // …
});
```
