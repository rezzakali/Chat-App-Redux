import { io } from 'socket.io-client';
import apiSlice from '../api/apiSlice';

const messagesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMessages: builder.query({
      query: (id) =>
        `/messages?conversationId=${id}&_sort=timestamp&_order=desc&_page=1&_limit=${
          import.meta.env.VITE_API_MESSAGES_PER_PAGE
        }`,

      async onQueryStarted(arg, { queryFulfilled, dispatch, getState }) {
        try {
          await queryFulfilled;
          // create socket
          const socket = io(import.meta.env.VITE_API_PORT, {
            reconnectionDelay: 1000,
            reconnection: true,
            reconnectionAttemps: 10,
            transports: ['websocket'],
            agent: false,
            upgrade: false,
            rejectUnauthorized: false,
          });

          socket.on('messages', ({ data }) => {
            const loggedInUser = getState().auth?.user?.email;
            const receiver = data?.receiver?.email;
            if (loggedInUser === receiver) {
              dispatch(
                apiSlice.util.updateQueryData(
                  'getMessages',
                  data.conversationId.toString(),
                  (draft) => {
                    draft.push(data);
                  }
                )
              );
            }
          });
        } catch (err) {}
      },
    }),

    addMessage: builder.mutation({
      query: (data) => ({
        url: '/messages',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const { useGetMessagesQuery, useAddMessageMutation } = messagesApi;

export default messagesApi;
