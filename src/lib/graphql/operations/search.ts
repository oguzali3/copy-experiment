// src/lib/graphql/operations/search.ts
import { gql } from '@apollo/client';
import { USER_FRAGMENT, POST_FRAGMENT } from './fragments';

export const SEARCH_USERS = gql`
  query SearchUsers($query: String!) {
    searchUsers(query: $query) {
      ...UserFragment
      bio
    }
  }
  ${USER_FRAGMENT}
`;

export const SEARCH_POSTS = gql`
  query SearchPosts($query: String!) {
    searchPosts(query: $query) {
      ...PostFragment
    }
  }
  ${POST_FRAGMENT}
`;

export const SEARCH_HASHTAGS = gql`
  query SearchHashtags($query: String!) {
    searchHashtags(query: $query) {
      tag
      count
    }
  }
`;

export const SEARCH_TICKERS = gql`
  query SearchTickers($query: String!) {
    searchTickers(query: $query) {
      symbol
      name
      price
      change
      changePercent
    }
  }
`;