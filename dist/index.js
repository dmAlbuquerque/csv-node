"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileExists = exports.write = exports.load = void 0;
const fs = __importStar(require("fs"));
const util = __importStar(require("util"));
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);
const load = async (filePath, config = {
    delimiter: ';',
    encoding: 'utf8',
    log: true,
    objName: undefined,
    parse: true,
}) => {
    try {
        const fileContent = await readFileAsync(filePath, { encoding: config.encoding });
        const parsedData = parseCSV(fileContent.toString(), config);
        return parsedData;
    }
    catch (error) {
        throw new Error(`Error loading CSV file: ${error.message}`);
    }
};
exports.load = load;
const parseCSV = (csvString, config) => {
    const lines = csvString.split('\n');
    const header = lines[0].split(config.delimiter);
    const data = lines.slice(1).map((line) => {
        if (line.trim() !== '') {
            const values = line.split(config.delimiter);
            const entry = {};
            header.forEach((key, index) => {
                let valueObject = values[index];
                if (config.parse) {
                    if (valueObject === '') {
                        valueObject = '';
                    }
                    else {
                        valueObject = parseValue(values[index]);
                    }
                }
                else {
                    valueObject = values[index];
                }
                entry[key] = valueObject;
            });
            return entry;
        }
    });
    const filteredData = data.filter(entry => entry !== undefined);
    console.log('DATADKDJKJ');
    console.log(filteredData);
    return config.objName ? convertToObjName(filteredData, config.objName) : filteredData;
};
const convertToObjName = (data, objName) => {
    const result = {};
    data.forEach((entry) => {
        const key = entry[objName];
        result[key] = entry;
    });
    return result;
};
const parseValue = (value) => {
    const numberValue = Number(value);
    return isNaN(numberValue) ? value : numberValue;
};
const write = async (filePath, data, config = {
    append: false,
    delimiter: ';',
    empty: false,
    encoding: 'utf8',
    header: '',
    log: true,
}) => {
    try {
        const csvString = await stringifyCSV(data, config, filePath);
        await writeFileAsync(filePath, csvString + '\n', { encoding: config.encoding, flag: config.append ? 'a' : 'w' });
        if (config.log) {
            console.log('Gerado com sucesso...');
        }
    }
    catch (error) {
        throw new Error(`Error writing to CSV file: ${error.message}`);
    }
};
exports.write = write;
const fileExists = async (filePath) => {
    try {
        await readFileAsync(filePath);
        return true;
    }
    catch (error) {
        return false;
    }
};
exports.fileExists = fileExists;
const stringifyCSV = async (data, config, filePath) => {
    const lines = [];
    const exists = await fileExists(filePath);
    if (config.header) {
        if (!exists) {
            lines.push(config.header);
        }
    }
    data.forEach((item) => {
        const values = Object.values(item).map((value) => {
            if (value instanceof Promise) {
                throw new Error('Promise values are not supported in CSV data.');
            }
            return value !== undefined ? value : '';
        });
        lines.push(values.join(config.delimiter));
    });
    return lines.join('\n');
};
