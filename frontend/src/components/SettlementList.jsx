export default function SettlementList({ settlements, history, onSettle }) {
  const visibleSettlements = settlements.filter((item) => item.fromUser && item.toUser);
  const visibleHistory = history.filter((item) => item.fromUser && item.toUser);

  return (
    <section className="panel">
      <h2>Settle up</h2>
      {visibleSettlements.length === 0 ? (
        <p className="empty">Everyone is settled.</p>
      ) : (
        <div className="stack">
          {visibleSettlements.map((item) => (
            <div className="settlement-row" key={`${item.fromUser._id}-${item.toUser._id}-${item.amount}`}>
              <span>
                <strong>{item.fromUser.name}</strong> pays <strong>{item.toUser.name}</strong>
              </span>
              <button onClick={() => onSettle(item)}>₹{item.amount.toFixed(2)}</button>
            </div>
          ))}
        </div>
      )}
      <h3>History</h3>
      {visibleHistory.length === 0 ? (
        <p className="empty">No settlements recorded.</p>
      ) : (
        <div className="stack compact">
          {visibleHistory.map((item) => (
            <div className="history-row" key={item._id}>
              <span>
                {item.fromUser.name} paid {item.toUser.name}
              </span>
              <strong>₹{item.amount.toFixed(2)}</strong>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
