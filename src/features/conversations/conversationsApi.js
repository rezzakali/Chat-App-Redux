import { io } from 'socket.io-client';
import apiSlice from '../api/apiSlice';
import messagesApi from '../messages/messagesApi';

const conversationsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getConversations: builder.query({
      query: (email) =>
        `/conversations?participants_like=${email}&_sort=timestamp&_order=desc&_page=1&_limit=${
          import.meta.env.VITE_API_CONVERSATIONS_PER_PAGE
        }`,
      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
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

        try {
          await cacheDataLoaded;
          socket.on('conversation', (data) => {
            updateCachedData((draft) => {
              const conversation = draft?.find((c) => c.id == data?.data?.id);

              if (conversation?.id) {
                conversation.message = data?.data?.message;
                conversation.timestamp = data?.data?.timestamp;
              } else {
                // do nothing
              }
            });
          });
        } catch (err) {}

        await cacheEntryRemoved;
        socket.close();
      },
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
        try {
          const conversation = await queryFulfilled;

          if (conversation?.data?.id) {
            const users = arg.data.users;

            const senderUser = users.find((user) => user.email === arg.sender);

            const receiverUser = users.find(
              (user) => user.email !== arg.sender
            );

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
        } catch (error) {}
      },
    }),

    editConversation: builder.mutation({
      query: ({ id, data, sender }) => ({
        url: `/conversations/${id}`,
        method: 'PATCH',
        body: data,
      }),

      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        // optimistic cache update start
        const result = dispatch(
          apiSlice.util.updateQueryData(
            'getConversations',
            arg.sender,
            (draft) => {
              const draftConversation = draft.find((c) => c.id == arg.id);
              draftConversation.message = arg.data.message;
              draftConversation.timestamp = arg.data.timestamp;
            }
          )
        );
        // optimistic cache update end
        try {
          const conversation = await queryFulfilled;

          if (conversation?.data?.id) {
            const users = arg.data.users;

            const senderUser = users.find((user) => user.email === arg.sender);

            const receiverUser = users.find(
              (user) => user.email !== arg.sender
            );

            const res = await dispatch(
              messagesApi.endpoints.addMessage.initiate({
                conversationId: conversation.data.id,
                sender: senderUser,
                receiver: receiverUser,
                message: arg.data.message,
                timestamp: arg.data.timestamp,
              })
            ).unwrap();

            // pasimistically update message start
            dispatch(
              apiSlice.util.updateQueryData(
                'getMessages',
                res.conversationId.toString(),
                (draft) => {
                  draft.push(res);
                }
              )
            );
            // pasimistically update message end
          }
        } catch (error) {
          result.undo();
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
