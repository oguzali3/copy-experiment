import { gql, useQuery } from '@apollo/client';

const GET_EXAMPLE = gql`
  query GetExample {
    example {
      id
      name
    }
  }
`;

export const ExampleQuery = () => {
  const { loading, error, data } = useQuery(GET_EXAMPLE);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data.example.map((item: any) => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
};