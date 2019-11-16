import * as core from '@actions/core';
import * as io from '@actions/io';
import * as ioUtil from '@actions/io/lib/io-util';
import * as tc from '@actions/tool-cache';
import * as fs from 'mz/fs';
import * as path from 'path';
import * as validUrl from 'valid-url';
import { LINUX, MACOSX, WIN, OC_TAR_GZ, OC_ZIP, LATEST } from './constants';

export class Installer {
    static async installOc(version: string, runnerOS: string) {
        if (!version) {
            return null;
        }
        let url = '';
        if (validUrl.isWebUri(version)) {
            url = version;
        } else {
            url = await Installer.getOcBundleUrl(version, runnerOS);
        }
        
        if (!url) {
            return Promise.reject('Unable to determine oc download URL.');
        }

        core.debug(`downloading: ${url}`);
        let ocBinary = await Installer.downloadAndExtract(
            url,
            runnerOS
        );
        if (!ocBinary) {
            return Promise.reject('Unable to download or extract oc binary.');
        }

        return ocBinary;
    }

    static async downloadAndExtract(url: string, runnerOS: string) {
        if (!url) {
            return null;
        }
        const downloadDir = await Installer.getDownloadDir(runnerOS);
        core.debug(`download directory: ${downloadDir}`);
        const ocArchive = await tc.downloadTool(url);
        core.debug(`ocArchive: ${ocArchive}`);
        let ocBinary: string;
        if (runnerOS === 'win32') {
            await tc.extractZip(ocArchive, downloadDir);
            ocBinary = path.join(downloadDir, 'oc.exe');
        } else {
            await tc.extractTar(ocArchive, downloadDir);
            ocBinary = path.join(downloadDir, 'oc');
        }
        core.debug(`ocBinary: ${ocBinary}`);
        if (!await ioUtil.exists(ocBinary)) {
            return null;
        } else {
            fs.chmodSync(ocBinary, '0755');
            return ocBinary;
        }
    }

    static async getDownloadDir(runnerOS: string) {
        let root = process.env['GITHUB_WORKSPACE'] || '';
        if (!root) {
            if (runnerOS === 'win32') {
              // On windows use the USERPROFILE env variable
              root = process.env['USERPROFILE'] || 'C:\\';
            } else {
              if (runnerOS === 'darwin') {
                root = '/Users';
              } else {
                root = '/home';
              }
            }
        }
        const downloadDir = path.join(root, '.download');
        
        if (!await ioUtil.exists(downloadDir)) {
            await io.mkdirP(downloadDir);
        }
        return downloadDir;
    }

    static async getOcBundleUrl(version: string, runnerOS: string) {
        let url = '';
        if (version === 'latest') {
            url = await Installer.latest(version);
        }

        // determine the base_url based on version
        let reg = new RegExp('\\d+(?=\\.)');
        const vMajorRegEx: RegExpExecArray = reg.exec(version);
        if (!vMajorRegEx || vMajorRegEx.length === 0) {
            core.debug('Error retrieving version major');
            return null;
        }
        const vMajor: number = +vMajorRegEx[0];

        const ocUtils = await Installer.getOcUtils();
        if (vMajor === 3) {
            url = `${ocUtils.openshiftV3BaseUrl}/${version}/`;
        } else if (vMajor === 4) {
            url = `${ocUtils.openshiftV4BaseUrl}/${version}/`;
        } else {
            core.debug('Invalid version');
            return null;
        }

        const bundle = await Installer.getOcBundleByOS(runnerOS);
        if (!bundle) {
            core.debug('Unable to find bundle url');
            return null;
        }
    
        url += bundle;
    
        core.debug(`archive URL: ${url}`);
        return url;
    }

    static async latest(runnerOS: string) {
        const bundle = await Installer.getOcBundleByOS(runnerOS);
        if (!bundle) {
          core.debug('Unable to find bundle url');
          return null;
        }
        
        const ocUtils = await Installer.getOcUtils();
        const url = `${ocUtils.openshiftV4BaseUrl}/${LATEST}/${bundle}`;
    
        core.debug(`latest stable oc version: ${url}`);
        return url;
    }

    static async getOcBundleByOS(runnerOS: string): Promise<string | null> {
        let url: string = '';
    
        // determine the bundle path based on the OS type
        switch (runnerOS) {
          case 'Linux': {
            url += `${LINUX}/${OC_TAR_GZ}`;
            break;
          }
          case 'Darwin': {
            url += `${MACOSX}/${OC_TAR_GZ}`;
            break;
          }
          case 'Windows_NT': {
            url += `${WIN}/${OC_ZIP}`;
            break;
          }
          default: {
            return null;
          }
        }
    
        return url;
    }

    static async getOcUtils() {
        const rawData = await fs.readFile('../oc-utils.json');
        return JSON.parse(rawData);
    }
}