import useScrollToBottom from "../../hooks/useScrollToBottom";
import { MessageBubble } from "./MessageBubble";
import { NoConversationPlaceholder } from "./NoConversationPlaceholder";
import { useSelectedConversation } from "../../hooks/useSelectedConversation";

function getMessageDateLabel(date, today) {
  const messageDate = new Date(date);
  if (
    messageDate.getFullYear() === today.getFullYear() &&
    messageDate.getMonth() === today.getMonth() &&
    messageDate.getDate() === today.getDate()
  ) {
    return "Today";
  }

  return messageDate.toLocaleDateString([], {
    year: messageDate.getFullYear() === today.getFullYear() ? undefined : "numeric",
    month: "long",
    day: "numeric",
  });
}

export function MessageList() {
  const { activeConversation, activeConversationId } = useSelectedConversation();

  const lastMessageId = activeConversation?.messages.at(-1)?.id;
  const messagesScrollRef = useScrollToBottom(activeConversationId, lastMessageId);
  const today = new Date();

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {activeConversation ? (
        <div
          ref={messagesScrollRef}
          className="flex flex-1 flex-col gap-1 overflow-y-auto overscroll-contain px-2 py-3 sm:px-3 sm:py-4"
        >
          {activeConversation.messages.map((message, index) => {
            const messageDateLabel = getMessageDateLabel(message.createdAt, today);
            const previousMessage = activeConversation.messages[index - 1];
            const startsDateGroup =
              !previousMessage ||
              getMessageDateLabel(previousMessage.createdAt, today) !== messageDateLabel;

            return (
              <div key={message.id}>
                {startsDateGroup ? (
                  <p className="mb-3 mt-2 text-center text-[11px] font-medium uppercase tracking-wide text-muted">
                    {messageDateLabel}
                  </p>
                ) : null}
                <MessageBubble message={message} />
              </div>
            );
          })}
        </div>
      ) : (
        <NoConversationPlaceholder />
      )}
    </div>
  );
}
