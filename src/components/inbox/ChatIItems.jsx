import gravatarUrl from 'gravatar-url';
import moment from 'moment/moment';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Error from '../../components/ui/Error';
import { useGetConversationsQuery } from '../../features/conversations/conversationsApi';
import getPartnerInfo from '../../utils/getPartnerInfo';
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

      const { email: partnerEmail, name } = getPartnerInfo(
        conversation.users,
        email
      );

      return (
        <li key={id}>
          <Link to={`/inbox/${id}`}>
            <ChatItem
              avatar={gravatarUrl(partnerEmail, { size: 80 })}
              name={name}
              lastMessage={message}
              lastTime={moment(timestamp).fromNow()}
            />
          </Link>
        </li>
      );
    });

  return <ul>{content}</ul>;
}
