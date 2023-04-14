import apiSlice from '../api/apiSlice';
import messagesApi from '../messages/messagesApi';

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
        url: `/conversations?participants_like=${loggedInUserEmail}-${participantEmail}&&participants_like=${participantEmail}-${loggedInUserEmail}`,
      }),
    }),

    addConversation: builder.mutation({
      query: ({ sender, data }) => ({
        url: '/conversations',
        method: 'POST',
        body: data,
      }),

      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        const conversation = await queryFulfilled;

        if (conversation?.data?.id) {
          const users = arg.data.users;

          const senderUser = users.find((user) => user.email === arg.sender);

          const receiverUser = users.find((user) => user.email !== arg.sender);

          dispatch(
            messagesApi.endpoints.addMessage.initiate({
              conversationId: conversation.data.id,
              sender: senderUser,
              receiver: receiverUser,
              message: arg.data.message,
              timestamp: arg.data.timestamp,
            })
          );
        }
      },
    }),

    editConversation: builder.mutation({
      query: ({ id, data, sender }) => ({
        url: `/conversations/${id}`,
        method: 'PATCH',
        body: data,
      }),

      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        const conversation = await queryFulfilled;

        if (conversation?.data?.id) {
          const users = arg.data.users;

          const senderUser = users.find((user) => user.email === arg.sender);

          const receiverUser = users.find((user) => user.email !== arg.sender);

          dispatch(
            messagesApi.endpoints.addMessage.initiate({
              conversationId: conversation.data.id,
              sender: senderUser,
              receiver: receiverUser,
              message: arg.data.message,
              timestamp: arg.data.timestamp,
            })
          );
        }
      },
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useAddConversationMutation,
  useEditConversationMutation,
  useGetConversationQuery,
} = conversationsApi;

export default conversationsApi;
