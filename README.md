# 📥📲 Express FCM to APNS middleware

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier) ![Coverage](https://bitbucket.org/tkfnetwork/express-fcm-to-apns/downloads/badge.svg)



Push notifications are (somewhat) supported inside the iOS simulator on mac.  They can be achieved by creating [APNS files](https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/generating_a_remote_notification) and pushing them to the iOS simulator by dragging and dropping onto the simulator or using `xcrun`.

This middleware takes advantage of the later by intercepting outgoing FCM tokens (when you make a request to save your FCM token to an API) and placing itself in the middle.

## Install

```
yarn add express-fcm-to-apns
```
```
npm i express-fcm-to-apns
```

### Application code
This middleware will only work if the application code has been setup to handle incoming APNS messages via the `userNotificationCenter`. For example, if you are using `react-native` and have followed the official guides to install firebase into your app then APNS will not work out of the box.

In order for the application to show notifications properly the following must be present in the `AppDelegate.m` and `AppDelegate.h`
#### `AppDelegate.h`

```objective-c
#import <UserNotifications/UserNotifications.h>

@interface AppDelegate : UIResponder <UNUserNotificationCenterDelegate>
```

#### `AppDelegate.m`
```objective-c
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    
    // ... rest of the application code

    // Assign at least one notification handler
    #if TARGET_IPHONE_SIMULATOR
        [[UNUserNotificationCenter currentNotificationCenter] setDelegate:self];
    #endif
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler {

  // Handle notification inside the simulator
  #if TARGET_IPHONE_SIMULATOR
    completionHandler(UNNotificationPresentationOptionAlert|UNNotificationPresentationOptionBanner);
  #endif

}
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
`apns.targetDevice`* | `string` | Supply the iOS simulator UUID, or simply supply `"booted"` when there is only one simulator running 
`interceptPath`* | `string` | The API proxy path that will be interecepted. For example if you post your token to `/api/v1/token` then you should supply that to this property
`logger` | `console \| Logger` | An optional logger. Currently will accept a `winston` logger or the `console`
`proxyOpts` | `object` | Supply options directly to the `express-http-proxy` function, [takes any of the core options](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/express-http-proxy/index.d.ts#L16)
`senderId`* | `string` | This is the FCM sender ID which can be found in your firebase console
`tokenPath`* | `string[]` | Supply the path, as array segments, in the post body to the token that is being posted e.g. `['data', 'token']` for `{ data: { token: '<some_token>' }}`

## How it works

This middleware utilises [`express-http-proxy`](https://www.npmjs.com/package/express-http-proxy) and [`push-receiver`](https://www.npmjs.com/package/push-receiver) under the hood with the former used to intercept the token call (and pass all other calls unaffected on to the underlying API) and the later used to register a GCM and FCM token and start listening for messages to that token.

For example, here is the typical firebase react-native flow:

![Default firebase react native flow](https://bitbucket.org/tkfnetwork/express-fcm-to-apns/downloads/fcm-default.png "Default firebase react native flow")

And here is the flow using this middleware:

![Intercepted firebase react native flow](https://bitbucket.org/tkfnetwork/express-fcm-to-apns/downloads/fcm-intercepted.png "Intercepted firebase react native flow")

As depicted above, this module will add it's own FCM token and start listening instead of the app.  When a message is receieved, it converts it to an APNS file and pushes to the simulator to display the message immediately.


# Licence
Licenced under MIT.