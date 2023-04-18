import gravatarUrl from 'gravatar-url';
import moment from 'moment/moment';
import { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Error from '../../components/ui/Error';
import conversationsApi, {
  useGetConversationsQuery,
} from '../../features/conversations/conversationsApi';
import getPartnerInfo from '../../utils/getPartnerInfo';
import ChatItem from './ChatItem';

export default function ChatItems() {
  const auth = useSelector((state) => state.auth) || {};
  const { user } = auth || {};
  const { email } = user || {};
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const dispatch = useDispatch();

  const { data, isLoading, isError, error } =
    useGetConversationsQuery(email) || {};

  const { data: conversations, totalCount } = data || {};

  const fetchMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  useEffect(() => {
    if (totalCount > 0) {
      const more =
        Math.ceil(
          totalCount / Number(import.meta.env.VITE_API_CONVERSATIONS_PER_PAGE)
        ) > page;

      setHasMore(more);
    }
  }, [totalCount, page]);

  useEffect(() => {
    if (page > 1) {
      dispatch(
        conversationsApi.endpoints.getMoreConversations.initiate({
          email,
          page,
        })
      );
    }
  }, [page, email, dispatch]);

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
    content = (
      <InfiniteScroll
        dataLength={conversations.length}
        next={fetchMore}
        hasMore={hasMore}
        loader={<h4>Loading...</h4>}
        height={window.innerHeight - 129}
      >
        {conversations.map((conversation) => {
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
        })}
      </InfiniteScroll>
    );

  return <ul>{content}</ul>;
}
