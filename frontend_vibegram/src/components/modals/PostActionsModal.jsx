import styles from "./PostActionsModal.module.css";

const PostActionsModal = ({ onClose, onEdit, onDelete, onGoToPost, onCopyLink }) => {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.deleteBtn} onClick={onDelete}>
          Delete
        </button>
        <button onClick={onEdit}>Edit</button>
        <button onClick={onGoToPost}>Go to post</button>
        <button onClick={onCopyLink}>Copy link</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default PostActionsModal;
