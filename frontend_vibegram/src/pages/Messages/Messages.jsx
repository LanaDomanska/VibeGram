import React from "react";
import styles from "./Messages.module.css";
import api from "@/api/axios";                
import { socket } from "@/lib/socket";        
import { useAuth } from "@/hooks/useAuth";    
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function formatRelative(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  const diff = Math.max(0, (Date.now() - d.getTime()) / 1000);
  const m = Math.floor(diff / 60);
  if (m < 1) return "now";
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days} d`;
  return `${Math.floor(days / 7)} wk`;
}
const idEq = (a, b) => String(a || "") === String(b || "");


const API_ORIGIN = (api.defaults.baseURL || "").replace(/\/api\/?$/, "");
const fileUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_ORIGIN}${p}`;
};

const normalizeMsg = (m) => ({
  _id: m._id,
  sender: typeof m.sender === "object" && m.sender?._id ? m.sender._id : m.sender,
  recipient:
    typeof m.recipient === "object" && m.recipient?._id
      ? m.recipient._id
      : m.recipient,
  content: m.content,
  createdAt: m.createdAt,
  read: m.read,
  _optimistic: m._optimistic,
});

export default function Messages() {
  const { user: me } = useAuth() || {};
  const ownerName = (me?.name && me.name.trim()) || me?.username || "Messages";
  const myId = me?._id || me?.id || null;

  const [inbox, setInbox] = React.useState([]);        
  const [selected, setSelected] = React.useState(null); 
  const [messages, setMessages] = React.useState([]);   
  const [draft, setDraft] = React.useState("");
  const [loadingInbox, setLoadingInbox] = React.useState(true);
  const [inboxError, setInboxError] = React.useState(null);
const navigate = useNavigate();

  const bodyRef = React.useRef(null);
  const activePeerRef = React.useRef(null); 

const [searchParams] = useSearchParams();

  
  React.useEffect(() => {
    const uid = String(me?._id || me?.id || "");
    if (!uid) return;
    socket.emit("register", uid);
  }, [me]);

  const upsertInbox = React.useCallback(({ user, content, createdAt, unreadDelta = 0 }) => {
    setInbox((prev) => {
      const idx = prev.findIndex((i) => String(i.user._id) === String(user._id));
      const nextItem = {
        user,
        lastMessage: { content, createdAt },
        unreadCount: Math.max(0, (idx >= 0 ? prev[idx].unreadCount : 0) + unreadDelta),
      };
      let next;
      if (idx === -1) next = [nextItem, ...prev];
      else {
        next = prev.slice();
        next[idx] = nextItem;
      }
      next.sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));
      return next;
    });
  }, []);

  const loadInbox = async ({ autoPick = true } = {}) => {
    try {
      setLoadingInbox(true);
      setInboxError(null);
      const { data } = await api.get("/messages/inbox");
      setInbox(data || []);
      if (autoPick && (!selected || !selected._id) && data?.length) {
        const first = data[0].user;
        setSelected(first);
        activePeerRef.current = String(first._id);
        await loadThread(first._id);
      }
    } catch (e) {
      setInboxError(e?.response?.status || "ERR");
      console.error("Inbox load error", e);
    } finally {
      setLoadingInbox(false);
    }
  };

  const loadThread = async (peerId) => {
    if (!peerId) return;
    const thisPeer = String(peerId);
    try {
   const { data } = await api.get(`/messages/${peerId}`, {
     params: { _: Date.now() }, 
   });
      if (activePeerRef.current !== thisPeer) return;
      setMessages((data || []).map(normalizeMsg));
      requestAnimationFrame(() => {
        bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
      });
    } catch (e) {
      console.error("Thread load error", e);
    }
  };

  React.useEffect(() => {
    const hasQueryTo = !!searchParams.get("to");
    loadInbox({ autoPick: !hasQueryTo });
  }, []);

  const openChat = async (user) => {
    setSelected(user);
    activePeerRef.current = String(user._id);
    setMessages([]);
    await loadThread(user._id);
    if (myId) socket.emit("messageRead", { from: user._id, to: myId });
  };

  React.useEffect(() => {
    const to = searchParams.get("to");
    if (!to) return;
    const userFromParams = {
      _id: to,
      username: searchParams.get("uname") || "user",
      avatar: searchParams.get("avatar") || "",
    };
    upsertInbox({
      user: userFromParams,
      content: "",
      createdAt: new Date().toISOString(),
      unreadDelta: 0,
    });
    openChat(userFromParams);
  }, [searchParams]);

  React.useEffect(() => {
    const onIncoming = (raw) => {
      const msg = normalizeMsg(raw);

      if (selected && (idEq(msg.sender, selected._id) || idEq(msg.recipient, selected._id))) {
        setMessages((p) => [...p, msg]);
        requestAnimationFrame(() => {
          bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
        });
      }

      const partnerId = String(msg.sender) === String(myId) ? msg.recipient : msg.sender;
      const existing = inbox.find((i) => String(i.user._id) === String(partnerId))?.user;
      const userObj =
        existing ||
        (selected && (idEq(selected._id, msg.sender) || idEq(selected._id, msg.recipient))
          ? selected
          : { _id: partnerId, username: "user", avatar: "" });

      const isInOpenChat =
        selected && (idEq(selected._id, msg.sender) || idEq(selected._id, msg.recipient));
      const unreadDelta =
        String(msg.recipient) === String(myId) && !isInOpenChat ? 1 : 0;

      upsertInbox({
        user: userObj,
        content: msg.content,
        createdAt: msg.createdAt,
        unreadDelta,
      });
    };

    const onSent = (raw) => {
      const base = normalizeMsg(raw);
      const msg = { ...base, sender: base.sender || (me?._id || me?.id) };

      setMessages((prev) => {
        const i = prev.findIndex(
          (m) => m._optimistic && idEq(m.recipient, msg.recipient) && m.content === msg.content
        );
        if (i !== -1) {
          const cp = prev.slice();
          cp[i] = msg;
          return cp;
        }
        return [...prev, msg];
      });

      const partnerId = msg.recipient;
      const existing = inbox.find((i) => String(i.user._id) === String(partnerId))?.user;
      const userObj = existing || selected || { _id: partnerId, username: "user", avatar: "" };
      upsertInbox({
        user: userObj,
        content: msg.content,
        createdAt: msg.createdAt,
        unreadDelta: 0,
      });
    };

    const onDeleted = () => loadInbox({ autoPick: false });

    socket.on("newMessage", onIncoming);   
    socket.on("messageSent", onSent);     
    socket.on("message:new", onIncoming);  
    socket.on("messageDeleted", onDeleted);

    return () => {
      socket.off("newMessage", onIncoming);
      socket.off("messageSent", onSent);
      socket.off("message:new", onIncoming);
      socket.off("messageDeleted", onDeleted);
    };
    
  }, [selected, me, inbox]);

  
  const sendBySocket = () => {
    const text = draft.trim();
    if (!text || !selected?._id) return;

    const tempId = `tmp-${Date.now()}`;
    const optimistic = {
      _id: tempId,
      sender: myId,
      recipient: selected._id,
      content: text,
      createdAt: new Date().toISOString(),
      _optimistic: true,
    };

  
    setMessages((p) => [...p, optimistic]);
    setDraft("");

  
    upsertInbox({
      user: selected,
      content: text,
      createdAt: optimistic.createdAt,
      unreadDelta: 0,
    });

    socket.emit("sendMessage", { to: selected._id, from: myId, content: text });
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendBySocket();
    }
  };

  const lastForSelected =
    selected && inbox.find((i) => idEq(i.user._id, selected._id))?.lastMessage;

  return (
    <div className={styles.page}>
      {/* Левая панель чатов */}
      <aside className={styles.list}>
 <div className={styles.listHeader} title={ownerName}>
   {ownerName}
 </div>
        <div className={styles.listScroll}>
          {loadingInbox && <div className={styles.emptyInbox}>Loading…</div>}
          {!loadingInbox && inboxError && <div className={styles.emptyInbox}>Error: {inboxError}</div>}
          {!loadingInbox && !inboxError && inbox.length === 0 && (
            <div className={styles.emptyInbox}>No messages yet</div>
          )}

          {!loadingInbox && !inboxError && inbox.map(({ user, lastMessage, unreadCount }) => (
            <button
              key={user._id}
              className={`${styles.item} ${selected && idEq(selected._id, user._id) ? styles.itemActive : ""}`}
              onClick={() => openChat(user)}
            >
              <img
                className={styles.itemAvatar}
                src={fileUrl(user.avatar) || "https://i.pravatar.cc/40"}
                alt={user.username}
                onError={(e) => { e.currentTarget.src = "https://i.pravatar.cc/40"; }}
              />
              <div className={styles.itemBody}>
                <div className={styles.itemRow}>
                  <strong className={styles.itemName}>{user.username}</strong>
                  <span className={styles.itemTime}>
                    {lastMessage?.createdAt ? formatRelative(lastMessage.createdAt) : ""}
                  </span>
                </div>
                <p className={styles.itemPreview}>{lastMessage?.content || "—"}</p>
              </div>
              {unreadCount > 0 && <span className={styles.unreadBadge}>{unreadCount}</span>}
            </button>
          ))}
        </div>
      </aside>

      <section className={styles.chat}>
        <header className={styles.header}>
          {selected ? (
            <>
              <img
                className={styles.headerAvatar}
                src={fileUrl(selected.avatar) || "https://i.pravatar.cc/96"}
                alt=""
                onError={(e) => { e.currentTarget.src = "https://i.pravatar.cc/96"; }}
              />
              <h4 className={styles.headerName}>{selected.username}</h4>
              <div className={styles.headerSub}> VibeGram</div>
               <button
   className={styles.viewProfile}
   disabled={!selected}
   onClick={() => {
     if (!selected) return;
     navigate(selected._id === myId ? "/profile" : `/profile/${selected.username}`);
   }}
 >
   View profile
 </button>
            </>
          ) : (
            <div className={styles.headerSub}>Choose a chat</div>
          )}
        </header>

        <div className={styles.stamp}>
          {lastForSelected?.createdAt ? new Date(lastForSelected.createdAt).toLocaleString() : ""}
        </div>

        <div className={styles.body} ref={bodyRef}>
          {selected && messages.map((m) => {
            const isMine = idEq(m.sender, myId);
            return (
              <div key={m._id} className={isMine ? styles.rightRow : styles.leftRow}>
                {!isMine && (
                  <img
                    className={styles.bubbleAvatar}
                    src={fileUrl(selected.avatar) || "https://i.pravatar.cc/32"}
                    alt=""
                    onError={(e) => { e.currentTarget.src = "https://i.pravatar.cc/32"; }}
                  />
                )}
                <div
                  className={isMine ? styles.bubbleRight : styles.bubbleLeft}
                  title={new Date(m.createdAt).toLocaleString()}
                >
                  {m.content}
                  {m._optimistic && <span className={styles.sendingDot}>…</span>}
                </div>
              </div>
            );
          })}

          {selected && messages.length === 0 && (
            <div className={styles.emptyInbox}>Start the conversation</div>
          )}
        </div>

        <div className={styles.inputBar}>
          <input
            className={styles.input}
            type="text"
            placeholder="Write message"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={!selected}
          />
          <button
            className={styles.sendBtn}
            onClick={sendBySocket}
            disabled={!draft.trim() || !selected}
          >
            Send
          </button>
        </div>
      </section>
    </div>
  );
}
