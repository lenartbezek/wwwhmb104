import { start as startApmAgent } from "elastic-apm-node";

export const apm = startApmAgent({
    serviceName: process.env.npm_package_name,
    serviceVersion: process.env.npm_package_version,
    serverUrl: "http://localhost:8200",
});
