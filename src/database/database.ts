import mysql, { createPool } from "mysql";

const connectionCredentials: mysql.Pool = createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  connectionLimit: 20,
  multipleStatements: true,
});

const database = (
  query: string,
  params: any,
  callback: mysql.queryCallback
) => {
  connectionCredentials.getConnection(
    (err: mysql.MysqlError, connection: mysql.PoolConnection) => {
      if (err) {
        connection.release();
        callback(err);
        throw err;
      }

      connection.query(query, params, (err: mysql.MysqlError, results) => {
        connection.release();
        if (!err) {
          callback(err, results);
        } else {
          callback(err);
        }
      });

      connection.on("error", (err: mysql.MysqlError) => {
        connection.release();
        callback(err);
        throw err;
      });
    }
  );
};

export default database;
