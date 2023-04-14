import apiSlice from '../api/apiSlice';

const conversationsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getConversations: builder.query({
      query: (email) => ({
        url: `/conversations?participants_like=${email}&_sort=timestamp&_order=desc&_page=1&_limit=${
          import.meta.env.VITE_API_CONVERSATIONS_PER_PAGE
        }`,
      }),
    }),

    getConversation: builder.query({
      query: ({ participantEmail, loggedInUserEmail }) => ({
        url: `/conversations?participants_like=${loggedInUserEmail}-${participantEmail}&&${participantEmail}-${loggedInUserEmail}
        }`,
      }),
    }),

    addConversation: builder.mutation({
      query: (data) => ({
        url: '/conversations',
        method: 'POST',
        body: data,
      }),
    }),

    editConversation: builder.mutation({
      query: ({ id, data }) => ({
        url: `/conversations/${id}`,
        method: 'PATCH',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetConversationsQuery,
  addConversation,
  editConversation,
  useGetConversationQuery,
} = conversationsApi;
