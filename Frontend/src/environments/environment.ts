export interface Environment {
  production: boolean;
  /** Base URL of the Node/Express backend. */
  apiUrl: string;
  /** Base URL of the Flask ML API. */
  mlApiUrl: string;
  /** When true, services return realistic dummy data instead of hitting the network. */
  useMock: boolean;
  /** Simulated network latency (ms) applied to mock responses. */
  mockDelay: number;
}

export const environment: Environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  mlApiUrl: 'http://localhost:5000',
  useMock: false,
  mockDelay: 900
};
