import { Request, Response } from "express";
import { Db } from "mongodb";

export class Context {

    public db: Db;

    constructor(
        public readonly req: Request,
        public readonly res: Response,
        dependencies: {
            db: Db;
        },
    ) {
        this.db = dependencies.db;
    }

}
