import { useEffect, useState } from "react";
import styles from "./Explore.module.css";

export default function Explore() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/explore?limit=60", { credentials: "include" });
        const data = await res.json();
        setItems(data.items || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className={styles.loading}>Загружаю…</div>;

  return (
    <div className={styles.grid}>
      {items.map((p) => {
        // ты уже делала replace("/public","") — оставляю как на фронте, чтоб ничего не ломать
        const src = (p.image || "").replace("/public", "");
        return (
          <a key={p._id} className={styles.card} href={`/p/${p._id}`} aria-label="Открыть пост">
            <img src={src} alt={p.caption || "post"} loading="lazy" />
          </a>
        );
      })}
    </div>
  );
}
