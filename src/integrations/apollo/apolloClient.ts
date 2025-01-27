import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: "http://localhost:4000/graphql", // Use the environment variable
  cache: new InMemoryCache(),
});

export default client;
