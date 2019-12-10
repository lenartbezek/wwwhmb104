import { ApolloServer } from "apollo-server-express";
import { GraphQLSchema } from "graphql";
import { Db } from "mongodb";
import { Context } from "./context";

export function buildServer(schema: GraphQLSchema, dependencies: {
    db: Db,
}) {

    return new ApolloServer({
        context: ({ req, res }) => new Context(req, res, dependencies),
        schema,
        playground: true,
        debug: false,
    });
}
