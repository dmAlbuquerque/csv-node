import * as fs from 'fs';
import * as util from 'util';

interface CSVConfig {
  delimiter: string;
  encoding: string;
  log: boolean;
  objName?: string;
  parse: boolean;
}

interface WriteConfig {
  append: boolean;
  delimiter: string;
  empty: boolean;
  encoding: string;
  header: string;
  log: boolean;
}

interface CSVEntry {
  [key: string]: string | number;
}

const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

const load = async (filePath: string, config: CSVConfig = {
  delimiter: ';',
  encoding: 'utf8',
  log: true,
  objName: undefined,
  parse: true,
}): Promise<CSVEntry[]> => {

  try {
    const fileContent = await readFileAsync(filePath, { encoding: config.encoding as BufferEncoding });
    const parsedData = parseCSV(fileContent.toString(), config);
    return parsedData;
  } catch (error: any) {
    throw new Error(`Error loading CSV file: ${error.message}`);
  }
};

const parseCSV = (csvString: string, config: CSVConfig): any => {
  const lines = csvString.split('\n');
  const header = lines[0].split(config.delimiter);

  const data = lines.slice(1).map((line) => {
    if (line.trim() !== '') {
      const values = line.split(config.delimiter);
      const entry: CSVEntry = {};

      header.forEach((key, index) => {
        let valueObject: any = values[index];

        if (config.parse) {
          if (valueObject === '') {
            valueObject = '';
          } else {
            valueObject = parseValue(values[index]);
          }
        } else {
          valueObject = values[index];
        }

        entry[key] = valueObject;
      });

      return entry;
    }
  });

  const filteredData = data.filter(entry => entry !== undefined) as CSVEntry[];

  console.log('DATADKDJKJ');
  console.log(filteredData);

  return config.objName ? convertToObjName(filteredData, config.objName) : filteredData;
};

const convertToObjName = (data: CSVEntry[], objName: string): { [key: string]: CSVEntry } => {
  const result: { [key: string]: CSVEntry } = {};
  data.forEach((entry) => {
    const key = entry[objName];
    result[key] = entry;
  });
  return result;
};

const parseValue = (value: string): number | string => {
  const numberValue = Number(value);
  return isNaN(numberValue) ? value : numberValue;
};

const write = async (filePath: string, data: CSVEntry[], config: WriteConfig = {
  append: false,
  delimiter: ';',
  empty: false,
  encoding: 'utf8',
  header: '',
  log: true,
}): Promise<void> => {

  try {
    const csvString = await stringifyCSV(data, config, filePath);

    await writeFileAsync(filePath, csvString + '\n', { encoding: config.encoding as BufferEncoding, flag: config.append ? 'a' : 'w' });

    if (config.log) {
      console.log('Gerado com sucesso...');
    }

  } catch (error: any) {
    throw new Error(`Error writing to CSV file: ${error.message}`);
  }
};

const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await readFileAsync(filePath);
    return true;
  } catch (error) {
    return false;
  }
};

const stringifyCSV = async (data: CSVEntry[], config: WriteConfig, filePath: string): Promise<string> => {
  const lines: string[] = [];

  const exists = await fileExists(filePath);

  if (config.header) {
    if (!exists) {
      lines.push(config.header);
    }
  }

  data.forEach((item) => {
    const values = Object.values(item).map((value: any) => {
      if (value instanceof Promise) {
        throw new Error('Promise values are not supported in CSV data.');
      }
      return value !== undefined ? value : '';
    });

    lines.push(values.join(config.delimiter));
  });

  return lines.join('\n');
};

export { load, write, fileExists };