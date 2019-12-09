import { ApolloServer } from "apollo-server-express";
import { GraphQLSchema } from "graphql";
import { Context } from "./context";

export function buildServer(schema: GraphQLSchema) {

    return new ApolloServer({
        context: ({ req, res }) => new Context(req, res),
        schema,
        playground: true,
        debug: false,
    });
}
