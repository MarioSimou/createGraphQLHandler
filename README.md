# solid-start-create-api-graphql-handler

## Description

`solid-start-create-api-graphql-handler` is a small utility function that allows to run a GraphQL server
in a `solid-start` API route. This aims to fill [this](https://start.solidjs.com/core-concepts/api-routes#exposing-a-graphql-api) gap from the official solid-start documentation, which at the time of writing this package, there isn't any other solution out there.

## Installation

```
npm install solid-start-create-api-graphql-handler
# pnpm i solid-start-create-api-graphql-handler
# yarn add solid-start-create-api-graphql-handler
```

## Usage

```ts
import {createApiGraphQLHandler} from 'solid-start-create-api-graphql-handler'
import type {Handler} from 'solid-start-create-api-graphql-handler'

// Implement GraphQL schema
const typeDefs = gql``
// Implement GraphQL resolvers
const resolvers = {}

const server = new ApolloServer({ typeDefs, resolvers })
await server.start()

type Data = Record<string, unknown>

const handler: Handler<Data> = (res) => {
    if(!res.success){
        const {errors} = res
        // process error response from the server
    }
    const {data} = res
    // process response from the server
}

export const POST = createApiGraphQLHandler({
    server,
    handler
})

```