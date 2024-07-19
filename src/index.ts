import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone'
import { buildSubgraphSchema } from '@apollo/subgraph';
import gql from 'graphql-tag';
import fs from 'fs';

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.

const schemaOne = gql(fs.readFileSync('./schema/one.graphql', 'utf8'));
  
const schemaTwo =  gql(fs.readFileSync('./schema/two.graphql', 'utf8'));

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolversOne = {
  Query: {
    grandParent: () => ({ id: "1", user: {id: 4 }, parent: { id: "2", child: { id: "3" } }, __typename: "T" }), // Resolve the t field
  },
  GrandParent: {
    __resolveReference: (obj: any) => {
      console.log('in resolve reference T', obj);
      return obj;
    },
    __resolveType(_obj, _context, _info) {
      console.log('in resolve type T');
      return 'A';
    }
  },
  Child: {
    field: (parent: any, args: any, context: any) => {
      // Implement your logic to resolve the 'field' field of type U
      // You can access the parent object which represents the T type containing the U type
      // Args contains the arguments passed to the 'field' field
      // Context contains any context data you want to pass

      console.log('in Child.field resolver', args);
      return `Received argument to resolver '${args.a}'`;
    },
  },
};

const resolversTwo = {
  Query: {
    a: () => 7,
  },
  GrandParent: {
  },
  User: {
    name: (parent: any, args: any, context: any) => {
      return 'Joe User';
    }
  }
}


// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const serverOne = new ApolloServer({
  schema: buildSubgraphSchema({
    typeDefs: schemaOne,
    resolvers: resolversOne,
  })
});

const serverTwo = new ApolloServer({
  schema: buildSubgraphSchema({
    typeDefs: schemaTwo,
    resolvers: resolversTwo,
  })
});


// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
const { url: a } = await startStandaloneServer(serverOne, { listen: { port: 4001 } });
const { url: b } = await startStandaloneServer(serverTwo, { listen: { port: 4002 } });

console.log(`🚀 Server listening at: ${a}`);
console.log(`🚀 Server listening at: ${b}`);
