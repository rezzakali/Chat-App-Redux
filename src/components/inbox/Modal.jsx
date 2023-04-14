import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import conversationsApi, {
  useAddConversationMutation,
  useEditConversationMutation,
} from '../../features/conversations/conversationsApi';
import { useGetUserQuery } from '../../features/user/userApi';
import isValidEmail from '../../utils/isValidEmail';
import Error from '../ui/Error';

function Modal({ open, control }) {
  const { user } = useSelector((state) => state.auth);
  const { email: loggedInUserEmail } = user || {};

  const [to, setTo] = useState('');
  const [message, setMessage] = useState('');
  const [userChecked, setUserChecked] = useState(false);
  const [error, setError] = useState('');
  const [conversation, setConversation] = useState(undefined);

  const dispatch = useDispatch();

  const [addConversation, { isSuccess: isAddConversationsSuccess }] =
    useAddConversationMutation();

  const [editConversation, { isSuccess: isEditConversationsSuccess }] =
    useEditConversationMutation();

  // request api
  const { data: participant } = useGetUserQuery(to, {
    skip: !userChecked,
  });

  useEffect(() => {
    if (
      participant?.length > 0 &&
      participant[0]?.email !== loggedInUserEmail
    ) {
      // check existence conversations
      dispatch(
        conversationsApi.endpoints.getConversation.initiate({
          loggedInUserEmail: loggedInUserEmail,
          participantEmail: to,
        })
      )
        .unwrap()
        .then((data) => setConversation(data))
        .catch((err) => setError('There was a problem!'));
    }
  }, [participant, dispatch, to, loggedInUserEmail]);

  // handling debounce
  const debounceHandler = (fn, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fn(...args);
      }, delay);
    };
  };

  const doSearch = (value) => {
    if (isValidEmail(value)) {
      setUserChecked(true);
      setTo(value);
    }
  };

  const handleSearch = debounceHandler(doSearch, 500);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (conversation?.length > 0) {
      // edit conversation
      editConversation({
        id: conversation[0].id,
        sender: loggedInUserEmail,
        data: {
          participants: `${loggedInUserEmail}-${participant[0].email}`,
          users: [user, participant[0]],
          message,
          timestamp: new Date().getTime(),
        },
      });
    } else if (conversation?.length === 0) {
      // add conversation
      addConversation({
        sender: loggedInUserEmail,
        data: {
          participants: `${loggedInUserEmail}-${participant[0].email}`,
          users: [user, participant[0]],
          message,
          timestamp: new Date().getTime(),
        },
      });
    }
  };

  // for modal after edit || add conversation
  useEffect(() => {
    if (isAddConversationsSuccess || isEditConversationsSuccess) {
      control();
    }
  }, [isAddConversationsSuccess, isEditConversationsSuccess]);

  return (
    open && (
      <>
        <div
          onClick={control}
          className="fixed w-full h-full inset-0 z-10 bg-black/50 cursor-pointer"
        ></div>
        <div className="rounded w-[400px] lg:w-[600px] space-y-8 bg-white p-10 absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Send message
          </h2>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="to" className="sr-only">
                  To
                </label>
                <input
                  id="to"
                  name="to"
                  type="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm"
                  placeholder="Send to"
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="message" className="sr-only">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm"
                  placeholder="Message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  conversation === undefined ||
                  (participant?.length > 0 &&
                    participant[0]?.email === loggedInUserEmail)
                }
              >
                Send Message
              </button>
            </div>
            {participant?.length === 0 && (
              <Error message="User does not exist!" />
            )}
            {participant?.length > 0 &&
              participant[0]?.email === loggedInUserEmail && (
                <Error message="You can not send message to your self!" />
              )}
            {error !== '' && <Error message={error} />}
          </form>
        </div>
      </>
    )
  );
}

export default Modal;
