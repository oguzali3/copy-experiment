// src/graphql/queries.js
import { gql } from '@apollo/client';

export const SCREEN_COMPANIES = gql`
  query ScreenCompanies($filters: [FinancialFilter!]!) {
    screenCompanies(filters: $filters) {
      symbol
      fields {
        fieldName
        value
      }
    }
  }
`;
