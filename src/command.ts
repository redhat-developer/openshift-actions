import * as exec from '@actions/exec';


export class Command {
    static async execute(ocPath: string, args: string) {
        if (!ocPath) {
            return Promise.reject('Unable to find oc bundle');
        }

        const cmdArgs = await Command.prepareOcArgs(args);
        await exec.exec(ocPath, cmdArgs);
        return;
    }

    static async prepareOcArgs(ocArgs: string) {
        let args = ocArgs.split(' ');
        if (args[0] === 'oc' || args[0] === 'oc.exe') {
            args = args.slice(1);
        }
        return args;
    }
}