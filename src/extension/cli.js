import Path from 'path';
import _ from 'lodash';
import scandir from 'sb-scandir';
import deepmerge from "../framework/Merge";

const outputFileSync = require('output-file-sync');
const {readFileSync} = require('fs');


const EXTENSION_PATH = 'src/extension/';

const IMPORT_LINES = 'IMPORT_LINES';
const MODULE_LINES = 'MODULE_LINES';
let configTemplate = `
import deepmerge from "../framework/Merge";
${IMPORT_LINES}
/**
 *  collect all config.js each extension module
 *
 * @return {*}
 */
function getConfig() {
    return deepmerge.all([
        {},
        {},
        /** ADD config class in here  */
${MODULE_LINES}
    ])
}

let cachedConfig = getConfig();

/**
 *
 * cache config
 *
 * @return {*}
 */
export default () => {
    if (!cachedConfig) {
        cachedConfig = getConfig()
    }

    return cachedConfig
}

export function updateConfig(newConfig) {
    cachedConfig = newConfig;
}
`;

/**
 * generate config.js file
 *  Scan all config files except in src/extension/config.js
 */
scandir(EXTENSION_PATH, true, function (path) {
    const baseName = Path.basename(path);
    return path !== `${EXTENSION_PATH}config.js` &&
        (baseName === 'config.js' || baseName.indexOf('.') === -1)
}).then(function (result) {

    let modules = [];
    let moduleLines = result.files.map((file, index) => {
        const moduleName = file.replace(EXTENSION_PATH, '').replace('/etc/config.js', '');
        modules.push(moduleName);
        return `__${index}_${_.snakeCase(moduleName)}Config`;
    });

    let importLines = result.files.map((file, index) => {
        const pathFile = file.replace(EXTENSION_PATH, '');
        return `import ${moduleLines[index]} from './${pathFile}';`;
    });

    let configFile = configTemplate.replace(IMPORT_LINES, importLines.length
        ? importLines.join('\n')
        : '');
    configFile = configFile.replace(MODULE_LINES, moduleLines.length
        ? moduleLines.join(',\n')
        : '');

    createModuleFile(modules);
    outputFileSync(`${EXTENSION_PATH}/config.js`, configFile);
});

/**
 * generate module.json file
 * @param modules
 */
function createModuleFile(modules) {
    let content = {};
    modules.forEach(module => {
        content[module] = 1;
    });
    outputFileSync(`${EXTENSION_PATH}/modules.json`, JSON.stringify(content ,null,2), 'utf-8');
}

scandir(EXTENSION_PATH, true, function (path) {
    const baseName = Path.basename(path);
    return path !== `${EXTENSION_PATH}config.js` &&
        (baseName === 'package.json' || baseName.indexOf('.') === -1)
}).then(function (result) {
    let packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
    result.files.forEach( (filePath) => {
        let file = JSON.parse(readFileSync(filePath, 'utf-8'));
        packageJson = deepmerge(packageJson, file);
    });

    let jsonPretty = JSON.stringify(packageJson ,null,2);
    outputFileSync('package.json', jsonPretty, 'utf-8');
});

/* update package */
const exec = require('child_process').exec;
exec('npm install')
    .on('exit', (exit) => console.log('exit: ', exit)) //eslint-disable-line
    .on('err', (err) => console.log('err: ', err)) //eslint-disable-line
    .on('message', (message) => console.log('message: ', message)) //eslint-disable-line
;
