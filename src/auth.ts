import * as core from '@actions/core';
import { BASIC_AUTHENTICATION, TOKEN_AUTHENTICATION, NO_AUTHENTICATION } from './constants';
import { Command } from './command';

export interface OpenShiftEndpoint {
    /** URL to the OpenShiftServer */
    serverUrl: string;
  
    /** dictionary of auth data */
    parameters: {
      [key: string]: string;
    };
  
    /** auth scheme such as OAuth or username/password etc... */
    scheme: string;
}

export class OcAuth {
    static async initOpenShiftEndpoint(openShiftServer: string, parameters: string) {
        return {
            serverUrl: openShiftServer,
            parameters: JSON.parse(parameters),
            scheme: 'Token'
        } as OpenShiftEndpoint; //for testing
    }

    static async createKubeConfig(endpoint: OpenShiftEndpoint, ocPath: string, runnerOS: string) {
        if (!endpoint) {
            core.debug('Null endpoint is not allowed');
            return Promise.reject('Endpoint is not valid');
        }

        // potential values for EndpointAuthorization:
        //
        // parameters:{"apitoken":***}, scheme:'Token'
        // parameters:{"username":***,"password":***}, scheme:'UsernamePassword'
        // parameters:{"kubeconfig":***}, scheme:'None'
        let authType = endpoint.scheme;
        let skip = OcAuth.skipTlsVerify(endpoint);
        switch (authType) {
            case BASIC_AUTHENTICATION:
                let username = endpoint.parameters['username'];
                let password = endpoint.parameters['password'];
                await Command.execute(
                    ocPath,
                    `login ${skip} -u ${username} -p ${password} ${endpoint.serverUrl}`
                );
                break;
            case TOKEN_AUTHENTICATION:
                let args = `login ${skip} --token ${endpoint.parameters['apitoken']} ${endpoint.serverUrl}`;
                await Command.execute(ocPath, args);
                break;
            case NO_AUTHENTICATION:
                //authKubeConfig(endpoint.parameters['kubeconfig'], runnerOS);
                break;
            default:
                throw new Error(`unknown authentication type '${authType}'`);
        }

    }

    static skipTlsVerify(endpoint: OpenShiftEndpoint): string {
        let skipTlsVerify = '';
        return skipTlsVerify;
    }
}