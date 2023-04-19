import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQueryWithReauth = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_PORT,
  prepareHeaders: async (headers, { getState, endpoints }) => {
    const token = getState()?.auth?.accessToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: async (args, api, extraOptions) => {
    let result = await baseQueryWithReauth(args, api, extraOptions);
    if (result?.error && result.error.status === 401) {
      api.dispatch(userLoggedOut());
      localStorage.clear();
    }
    return result;
  },
  tagTypes: [],
  endpoints: (builder) => ({}),
});

export default apiSlice;
