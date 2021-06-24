# EazyDDNS

这个项目可以帮助你快速实现 DDNS，你只需要配置并启动这个项目即可。

目前这个项目只支持 IPv4，并不支持 IPv6。

## Usage

首先你需要克隆这个仓库：

```bash
git clone https://github.com/backrunner/eazyddns.git -b main --depth 1
```

在项目根目录，你需要手动创建一个名为 `easyddns.config.json`的 JSON 文件，下方是配置文件的模板：

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

你可以使用 npm 直接启动它，也可以使用 pm2。

```bash
npm run start
# or
pm2 start
```

如果你需要了一些由 `ts-node`引起的奇怪问题, 你可以尝试使用`npm run build`编译这个项目，然后使用`npm run start:node`直接使用 Node 运行编译产物。

## Providers

在当前的版本中，你只能使用内置的 Providers 配置服务。我们将会在后续的版本中支持引入外部的自定义 Provider。

### IP Provider

IP Provider 主要用于获取本机的 IP，目前我们内置了一个基于淘宝 API 的 Provider，以及一个自定义的 Provider，你可以配置`taobao`或`custom`使用它们。

#### Taobao IP Provider

这个 Provider 会调用淘宝的 IP Helper API 获取你当前网络的公网 IP，使用这个 Provider 不需要做任何配置。

#### 自定义 Provider

这个 Provider 可以自定义给某个 URL 发 GET 请求，只需要保证返回中包括可识别的 IPv4 地址即可。

配置示例如下：

```json
{
  "api": "" // api url
}
```

### DNS Provider

DNS Provider 用于对接 DNS 服务，通过调用 API 在 DNS 服务商处更新你的记录。

#### DNSPod Provider

我们内置了对接 DNSPod 的 Provider，请注意这里的 Token 使用的是 DNSPod Token，不是腾讯云 Token。

记录的线路需要为默认线路，

```json
{
  "loginToken": "YOUR_LOGIN_TOKEN",
  "domain": "YOUR_DOMAIN", // 域名
  "subDomain": "YOUR_SUBDOMAIN" // 子域名
}
```

如果相关的记录不存在，Provider 会自动创建它。

## License

MIT
