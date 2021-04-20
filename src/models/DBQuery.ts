import mysql from "mysql";

export type DBQuery = {
  result: (query: string, params: any, callback: mysql.queryCallback) => any;
};
