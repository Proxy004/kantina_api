import * as express from "express";
import { Request, Response } from "express";
import database from "../../database/database";
import { MysqlError } from "mysql";

const router = express.Router();

router.post("/loginUser", (req: Request, res: Response) => {
  const str: string = req.body.name;
  const name = str.split(" ");

  let finishedLastName: string = "";
  let finishedFirstName: string = "";

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
  database(
    `SELECT email FROM benutzer WHERE benutzer.email =  ?`,
    [req.body.email],
    (err: MysqlError, results) => {
      if (err) {
        return res.status(406).json({ error: "An error occured" });
      } else if (results.length === 0) {
        database(
          `INSERT INTO benutzer(benutzer_id, vorname, nachname, email, mitarbeiter) VALUES (?, ?, ?, ?, ?)`,
          [null, finishedFirstName, finishedLastName, req.body.email, 0],
          (err: MysqlError) => {
            if (err) {
              console.log(err);
              return res
                .status(406)
                .json({ error: "An error occured while registering" });
            }
          }
        );
      }
      return res.sendStatus(204);
    }
  );
});

export default router;
