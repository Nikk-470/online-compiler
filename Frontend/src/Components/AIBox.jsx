const AIBox = ({ messages }) => {
  return (
    <div className="ai-chat">

      {messages.length === 0 ? (
        <div className="empty-ai">
          Ask AI about your code...
        </div>
      ) : (
        messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-bubble ${msg.role}`}
          >
            {msg.content}
          </div>
        ))
      )}

    </div>
  );
};

export default AIBox;