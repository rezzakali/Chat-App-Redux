import moment from 'moment/moment';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Error from '../../components/ui/Error';
import { useGetConversationsQuery } from '../../features/conversations/conversationsApi';
import ChatItem from './ChatItem';

export default function ChatItems() {
  const auth = useSelector((state) => state.auth) || {};
  const { user } = auth || {};
  const { email } = user || {};

  const {
    data: conversations,
    isLoading,
    isError,
    error,
  } = useGetConversationsQuery(email);

  let content = null;
  if (isLoading) content = <li className="text-center m-2">Loading...</li>;
  if (!isLoading && isError)
    content = (
      <li>
        <Error message={error} />
      </li>
    );
  if (!isLoading && !isError && conversations.length === 0)
    if (isLoading) content = <li className="text-center m-2">Loading...</li>;
  content = <li className="text-center m-2">No conversations</li>;

  if (!isLoading && !isError && conversations?.length !== 0)
    content = conversations.map((conversation) => {
      const { id, message, timestamp } = conversation;

      return (
        <li key={id}>
          <Link to={`/inbox/${id}`}>
            <ChatItem
              avatar="https://cdn.pixabay.com/photo/2018/09/12/12/14/man-3672010__340.jpg"
              name="Saad Hasan"
              lastMessage={message}
              lastTime={moment(timestamp).fromNow()}
            />
          </Link>
        </li>
      );
    });

  return <ul>{content}</ul>;
}
