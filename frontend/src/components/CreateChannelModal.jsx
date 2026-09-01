import "./CreateChannelModal.css";

function CreateChannelModal({
  show,
  onClose,
  newChannelName,
  setNewChannelName,
  createChannel,
}) {
  if (!show) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Új csatorna</h2>

        <input
          type="text"
          value={newChannelName}
          onChange={(e) =>
            setNewChannelName(e.target.value)
          }
          placeholder="Csatorna neve..."
        />

        <div className="modal-actions">

          <button
            className="cancel-btn"
            onClick={onClose}
          >
            Mégse
          </button>

          <button
            className="create-btn"
            onClick={() => {
              createChannel();
              onClose();
            }}
          >
            Létrehozás
          </button>

        </div>

      </div>
    </div>
  );
}

export default CreateChannelModal;