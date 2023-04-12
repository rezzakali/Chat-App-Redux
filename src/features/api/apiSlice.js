import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_PORT,
  }),
  tagTypes: [],
  endpoints: (builder) => ({}),
});

export default apiSlice;
