import mysql from "mysql";

export type DBQuery = {
  (query: string, params: any, callback: mysql.queryCallback): any;
};
