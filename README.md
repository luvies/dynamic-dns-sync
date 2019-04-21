# Domain DNS Sync

A service that can be run inside a network and will continously check for external IP address changes, pushing these changes to route 53 and calling URL-based updaters (such as FreeDNS).

Upon launch, all the configured setups will be updated to the current IP address regardless, but after this they will only be updated if the services detects that the external IP address actually changes.

## Config

This service is designed to be ran via the docker image (https://hub.docker.com/r/luvies/dynamic-dns-sync), and can be configured via environment variables.

### Generic

- `DYN_DNS_CHECK_INTERVAL`
  - This is the [ms](https://npm.im/ms)-formatted string describing the interval time between IP address checks

### Route 53

To configure the route 53 sync, you need to use the following env var setup:

```
DYN_DNS_R53_{name}={zone},{resource}(,{resource})*
```

- `{name}`
  - This is a custom name that can be used to distingush multiple hosted zones
- `{zone}`
  - This is the hosted zone ID (which can be found in the AWS console or via APIs)
- `{resource}`
  - Each one of these is the actual A record that should be kept in sync
  - You need at least 1, but can have as many as you want

You will also need to set up your AWS credentials properly so that the AWS SDK can login properly. If route 53 sync is not configured, then the AWS SDK is not loaded at all, and so you can avoid passing in credentials compeletely.

### URL-based update

To configure an URL-based update, you need to use the following env var setup:

```
DYN_DNS_URL_{name}={url}
```

- `{name}`
  - This is a custom name that can be used to distingushed multiple URL-based updates
- `{url}`
  - This is the URL that will be called whenever an IP address change is detected
