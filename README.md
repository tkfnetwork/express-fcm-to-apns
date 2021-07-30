# 📥📲 Express FCM to APN middleware

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)


Push notifications are (somewhat) supported inside the iOS simulator on mac.  They can be achieved by creating [APNS files](https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/generating_a_remote_notification) and pushing them to the iOS simulator by dragging and dropping onto the simulator or using `xcrun`.

This middleware takes advantage of the later by interecepting outgoing FCM tokens (when you make a request to save your FCM token to an API) and placing itself in the middle.

## Install

```
yarn add express-fcm-to-apns
```
```
npm i express-fcm-to-apns
```

## Usage
For this to work you will need to be running the iOS simulator and a small express app.  For example, if your app is pointing at `https://path.to.host/my/api/` , you'll want to point it to your local express app `http://localhost:8080/my/api/`.  You can then pass in the api url to listen to via the options.  Here is an example in express:

```ts
app.use(
  fcmToApns({
    apiUrl: 'https://path.to.host/',
    apns: {
      dir: '/tmp',
      targetBundle: 'com.my.app',
      targetDevice: 'booted',
    },
    interceptPath: '/api/v1/token/',
    logger: console,
    proxyOpts: {
      https: true,
    },
    senderId: '1234321234',
    tokenPath: ['data', 'token'],
  })
);
```

## Options

**\* required**.

Property | Type | Description
---------|------|-------------
`apiUrl`*   | `string` | This is your proxy API host (without any suffixes such as `/api/v1/`) as this will be handled when you make the requests to the root express app
`apns.dir`* | `string` | The directory to write the APNS files too
`apns.targetBundle`* | `string` | This is the bundle name on the simulator that will be targeted with the APNS files
`interceptPath`* | `string` | The API proxy path that will be interecepted. For example if you post your token to `/api/v1/token` then you should supply that to this property
`logger` | `console \| Logger` | An optional logger. Currently will accept a `winston` logger or the `console`
`proxyOpts` | `object` | Supply options directly to the `express-http-proxy` function, [takes any of the core options](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/express-http-proxy/index.d.ts#L16)
`senderId`* | `string` | This is the FCM sender ID which can be found in your firebase console
`tokenPath`* | `string`[] | Supply the path, as array segments, in the post body to the token that is being posted e.g. `['data', 'token']` for `{ data: { token: '<some_token>' }}`

## How it works

This middleware utilises [`express-http-proxy`](https://www.npmjs.com/package/express-http-proxy) and [`push-receiver`](https://www.npmjs.com/package/push-receiver) under the hood with the former used to intercept the token call (and pass all other calls unaffected on to the underlying API) and the later used to register a GCM and FCM token and start listening for messages to that token. 
