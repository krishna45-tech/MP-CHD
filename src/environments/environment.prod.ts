import { Environment } from './environment';

export const environment: Environment = {
  production: true,
  apiUrl: 'http://localhost:3000/api',
  mlApiUrl: 'http://localhost:5000',
  useMock: false,
  mockDelay: 900
};
