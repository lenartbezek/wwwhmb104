import { Request, Response } from "express";
import { Db } from "mongodb";
import { connectToDb } from "./mongo";

export class Context {

    public db?: Db;

    constructor(
        public readonly req: Request,
        public readonly res: Response,
    ) {
        connectToDb().then(({ db }) => this.db = db);
    }

}
