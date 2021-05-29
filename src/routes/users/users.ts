import * as express from "express";
import { Request, Response } from "express";
import database from "../../database/database";
import { MysqlError } from "mysql";
import * as bcrypt from "bcrypt";

const router = express.Router();

router.post("/loginUser", (req: Request, res: Response) => {
  const str: string = req.body.name;
  const name = str.split(" ");
  const saltRounds = 10;
  let finishedLastName: string = "";
  let finishedFirstName: string = "";

  const hashString: string = req.body.token + req.body.loginDate.toString();

  name.forEach((element) => {
    const capitalize = (s) => {
      if (typeof s !== "string") return "";
      return s.charAt(0).toUpperCase() + s.slice(1);
    };

    if (element === element.toUpperCase()) {
      if (finishedLastName.length > 0) {
        finishedLastName +=
          finishedLastName + " " + capitalize(element.toLowerCase());
      } else finishedLastName = capitalize(element.toLowerCase());
    } else {
      if (finishedFirstName.length > 0) {
        finishedFirstName += " " + element;
      } else finishedFirstName = element;
    }
  });

  bcrypt.hash(hashString, saltRounds, function (err, hash) {
    if (err) {
      return res
        .status(406)
        .json({ error: "An error occured while registering" });
    } else {
      database(
        `SELECT email FROM benutzer WHERE benutzer.email =  ?`,
        [req.body.email],
        (err: MysqlError, results) => {
          if (results.length != 0) {
            database(
              `UPDATE benutzer SET token=? WHERE email=?`,
              [hash, req.body.email],
              (err: MysqlError) => {
                if (err) {
                  return res
                    .status(500)
                    .json({ error: "Internal Server Error" });
                } else {
                  return res.sendStatus(200);
                }
              }
            );
          } else {
            database(
              `INSERT INTO benutzer(benutzer_id, vorname, nachname, email, mitarbeiter, token) VALUES (?, ?, ?, ?, ?, ?)`,
              [
                null,
                finishedFirstName,
                finishedLastName,
                req.body.email,
                0,
                hash,
              ],
              (err: MysqlError) => {
                if (err) {
                  console.log(err);
                  return res
                    .status(406)
                    .json({ error: "An error occured while registering" });
                } else {
                  return res.sendStatus(200);
                }
              }
            );
          }
        }
      );
    }
  });
});

router.get("/checkIfAdmin", (req: Request, res: Response) => {
  database(
    `SELECT mitarbeiter FROM benutzer WHERE email=?`,
    [req.headers.email],
    (err: MysqlError, results) => {
      if (err) return res.status(500).json({ error: "Internal Server Error" });
      return res.send(results);
    }
  );
});

export default router;
