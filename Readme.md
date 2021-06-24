# EazyDDNS

Using different DNS service and IP query service to maintain your DDNS service easily and quickly.

At current, this project only support IPv4.

## Usage

You should clone this repo first by the following command:

```bash
git clone https://github.com/backrunner/eazyddns.git -b main --depth 1
```

Then create a JSON file named `easyddns.config.json` at the project root, here's a template:

```json
{
  "cron": "*/30 * * * * *", // cron string
  "providers": {
    "ip": {
      "use": "", // name of the provider
      "config": {} // config which will be passed to the provider
    },
    "dns": {
      "use": "",
      "config": {}
    }
  }
}
```

Then start it with npm or pm2:

```bash
npm run start
# or
pm2 start
```

If you're suffering some unsolvable problems with `ts-node`, you can try to build it with `npm run build` and run it with `npm run start:node`.

## Providers

In the current version, you can only use the built-in providers, we'll support external custom providers soon.

### IP Provider

IP Provider is a service wrap that the program can get the IP address you want to update to the record from it.

Project now has two built-in IP providers, named `taobao` and `custom`.

#### Taobao IP Provider

This provider will send a `GET` request to the Taobao IP helper to get the address of your machine.

You can use it directly without any configuration.

#### Custom Provider

This provider allow you to achieve an IP address from a custom HTTP service.

The service should return a response with a recognizable IPv4 address, the provider will extract it by regex.

Here's a template of config:

```json
{
  "api": "" // api url
}
```

### DNS Provider

DNS Provider is a wrap of the DNS service, provider will call the APIs of the service to update your DNS record.

#### DNSPod Provider

To use it, You should set up the provider config like this:

```json
{
  "loginToken": "YOUR_LOGIN_TOKEN",
  "domain": "YOUR_DOMAIN",
  "subDomain": "YOUR_SUBDOMAIN"
}
```

The `loginToken` is the `DNSPod Token`, not the auth token of Tencent Cloud.

The line of the record should be default.

If the record doesn't exist, this provider will create it automatically.

## License

MIT
