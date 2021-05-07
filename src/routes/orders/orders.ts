import * as express from "express";
import { Request, Response } from "express";
import searchInDatabase from "../../database/database";
import { MysqlError } from "mysql";

const router = express.Router();

router.post("/orders", (req: Request, res: Response) => {});
export default router;
