
import { start as startApmAgent } from "elastic-apm-node";

export const apm = startApmAgent({
    serviceName: "my-microservice",
    serviceVersion: process.env.npm_package_version,
    serverUrl: "http://localhost:8200",
    usePathAsTransactionName: true,
    logLevel: "debug",

});

import * as express from "express";

async function start() {

    const app = express();

    app.get("/hello", (req, res, next) => {
        res.status(200).send("hello world");
    });

    app.listen({ port: 8081 }, () => {
        // tslint:disable-next-line: no-console
        console.log(`Listening on port 8081 ...`);
    });
}

start();
