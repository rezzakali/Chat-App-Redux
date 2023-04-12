import { configureStore } from '@reduxjs/toolkit';
import apiSlice from '../features/api/apiSlice';
import authSliceReducer from '../features/auth/authSlice';
import conversationsSliceReducer from '../features/conversations/conversationsSlice';
import messagesSliceReducer from '../features/messages/messagesSlice';

const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authSliceReducer,
    conversations: conversationsSliceReducer,
    messages: messagesSliceReducer,
  },
});

export default store;
