declare module "sql.js" {
  export type SqlValue = string | number | Uint8Array | null;

  export interface QueryExecResult {
    columns: string[];
    values: SqlValue[][];
  }

  export interface Database {
    run(sql: string, params?: SqlValue[]): void;
    exec(sql: string): QueryExecResult[];
    export(): Uint8Array;
    prepare(sql: string): Statement;
    close(): void;
  }

  export interface Statement {
    bind(params: SqlValue[]): void;
    step(): boolean;
    getAsObject(): Record<string, SqlValue>;
    get(): SqlValue[];
    free(): void;
  }

  export interface InitSqlJsStatic {
    Database: new (data?: Uint8Array | Buffer) => Database;
  }

  export interface InitSqlJsOptions {
    locateFile?: (file: string) => string;
  }

  export default function initSqlJs(
    options?: InitSqlJsOptions
  ): Promise<InitSqlJsStatic>;
}
