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
declare const load: (filePath: string, config?: CSVConfig) => Promise<CSVEntry[]>;
declare const write: (filePath: string, data: CSVEntry[], config?: WriteConfig) => Promise<void>;
declare const fileExists: (filePath: string) => Promise<boolean>;
export { load, write, fileExists };
