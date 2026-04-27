import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

export default function AddExpenseForm({ group, onAdd }) {
  const [amount, setAmount] = useState("");
  const [payer, setPayer] = useState(group.members[0]?._id || "");
  const [splitBetween, setSplitBetween] = useState(group.members.map((member) => member._id));
  const [error, setError] = useState("");

  useEffect(() => {
    const memberIds = group.members.map((member) => member._id);
    setPayer((current) => (memberIds.includes(current) ? current : memberIds[0] || ""));
    setSplitBetween((current) => {
      const selected = current.filter((id) => memberIds.includes(id));
      return selected.length > 0 ? selected : memberIds;
    });
  }, [group.members]);

  function toggleMember(memberId) {
    setSplitBetween((current) =>
      current.includes(memberId) ? current.filter((id) => id !== memberId) : [...current, memberId]
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    try {
      await onAdd({ amount: Number(amount), payer, splitBetween });
      setAmount("");
      setSplitBetween(group.members.map((member) => member._id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <h2>Add expense</h2>
      <label>
        Amount
        <input min="0.01" step="0.01" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
      </label>
      <label>
        Payer
        <select value={payer} onChange={(e) => setPayer(e.target.value)} required>
          {group.members.map((member) => (
            <option key={member._id} value={member._id}>
              {member.name}
            </option>
          ))}
        </select>
      </label>
      <fieldset>
        <legend>Split equally</legend>
        <div className="checkbox-grid">
          {group.members.map((member) => (
            <label key={member._id} className="checkbox-row">
              <input
                type="checkbox"
                checked={splitBetween.includes(member._id)}
                onChange={() => toggleMember(member._id)}
              />
              {member.name}
            </label>
          ))}
        </div>
      </fieldset>
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={splitBetween.length === 0}>
        <Plus size={18} />
        Add expense
      </button>
    </form>
  );
}
