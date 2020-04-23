# Openshift Extension for GitHub Actions

The OpenShift Extension for GitHub Actions gives you the ability to create workflows to automate the deployment process to [OpenShift](https://github.com/openshift/origin) 

## Inputs:

| Name                  | Requirement | Description |
| --------------------- | ----------- | ----------- |
| `version`        | _optional_ | Default: "latest". Must be in form `version: 'latest'`; It accepts 3 different values: version number (such as 3.11.36), url where to download oc bundle (i.e https://mirror.openshift.com/pub/openshift-v3/clients/3.11.36/linux/oc.tar.gz) or latest (which will download the latest version available). N.B: By using the version number you have to make sure it exists in our Oc repo - v.3 (https://mirror.openshift.com/pub/openshift-v3/clients/) or v.4 (https://mirror.openshift.com/pub/openshift-v4/clients/oc/) |
| `openshift_server_url`        | _required_ | The URL of the Openshift cluster. We suggest to use [secrets](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets#creating-encrypted-secrets) to store Openshift URL. Must be in form `openshift_server_url: ${{ secrets.OPENSHIFT_SERVER_URL }}` |
| `parameters`            | _required_ | JSON with values to connect to the Openshift cluster. We suggest to use secrets to store sensitive data. Must be in form `parameters: '{"apitoken": "${{ secrets.API_TOKEN }}", "acceptUntrustedCerts": "true"}'` [More Info](#openshift-authentication-methods-supported) |
| `cmd`   | _required_ | One or more oc commands to be executed. |
| `useLocalOc` | _optional_ | It forces the extension to use, if present, the oc cli found in the machine where the agent is running. If no version is specified, the extension will use the local oc cli no matter its version. If a version is specified then the extension will first check if the oc cli installed has the same version requested by the user, if not, the correct oc cli will be downloaded. |

### Openshift Authentication Methods Supported

To configure an OpenShift connection you need to feed in the extension with some informations related to your Openshift cluster so that it can authenticate. Currently we support these authentication methods:

#### Basic Authentication

It uses username and password to connect to the cluster. 

| Name                  | Requirement | Description |
| --------------------- | ----------- | ----------- |
| `username`        | _required_ | OpenShift username. |
| `password`        | _required_ | Password for the specified user. |
| `acceptUntrustedCerts`            | _optional_ | Whether it is ok to accept self-signed (untrusted) certificated. |
| `certificateAuthorityFile`   | _optional_ | Path where the certificate authority file is stored. |

The parameters input must be in form `parameters: '{"username": "${{ secrets.USERNAME }}", "password": "${{ secrets.PASSWORD }}", "acceptUntrustedCerts": "true"}'`

#### Token Authentication

It uses an API token to connect to the cluster. 

| Name                  | Requirement | Description |
| --------------------- | ----------- | ----------- |
| `apitoken`        | _required_ | The API token used for authentication. |
| `acceptUntrustedCerts`            | _optional_ | Whether it is ok to accept self-signed (untrusted) certificated. |
| `certificateAuthorityFile`   | _optional_ | Path where the certificate authority file is stored. |

The parameters input must be in form `parameters: '{"apitoken": "${{ secrets.API_TOKEN }}"}'`

## Example `workflow.yml` with Openshift Action

```yaml
name: Example workflow for Openshift Action
on: [push]
env:
  PROJECT: dev

jobs:
  run:
    runs-on: macos-latest
    steps:
    - uses: actions/checkout@v1
    - name: OpenShift Action
      uses: redhat-developer/openshift-actions@v1.1
      with:
        version: 'latest'
        openshift_server_url: ${{ secrets.OPENSHIFT_SERVER_URL }}
        parameters: '{"apitoken": "${{ secrets.API_TOKEN }}", "acceptUntrustedCerts": "true"}'
        cmd: |          
          'version'
          'new-project ${PROJECT}'
```

N.B: The openshift action's step needs to run after actions/checkout@v1

## Proxy Support

If you need a self-hosted runner to communicate via a proxy server you can use one of the following methods, as described in the official [GitHub Actions website](https://help.github.com/en/actions/hosting-your-own-runners/using-a-proxy-server-with-self-hosted-runners):

- Configuring a proxy server using environment variables (https_proxy, http_proxy)
- Using a .env file to set the proxy configuration

Below an example of workflow setting up environment variables

```yaml
name: Example workflow for Openshift Action
on: [push]
jobs:
  run:
    env:
      HTTPS_PROXY: "${{ secrets.PROXY }}"
      HTTP_PROXY: "${{ secrets.PROXY }}"
    runs-on: macos-latest
    steps:
    - uses: actions/checkout@v1
    - name: OpenShift Action
      uses: redhat-developer/openshift-actions@v1.1
      with:
        version: 'latest'
        openshift_server_url: ${{ secrets.OPENSHIFT_SERVER_URL }}
        parameters: '{"apitoken": "${{ secrets.API_TOKEN }}", "acceptUntrustedCerts": "true"}'
        cmd: |          
          'version'
          'new-project my-project'
```

## Contributing

This is an open source project open to anyone. This project welcomes contributions and suggestions!

## Feedback & Questions

If you discover an issue please file a bug in [GitHub issues](https://github.com/redhat-developer/openshift-actions/issues) and we will fix it as soon as possible.

## License

MIT, See [LICENSE](https://github.com/redhat-developer/openshift-actions/blob/master/LICENSE.md) for more information.
