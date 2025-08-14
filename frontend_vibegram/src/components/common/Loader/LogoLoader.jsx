import s from "./LogoLoader.module.css";

export default function LogoLoader({
  src,
  size = 72,
  duration = "1.2s",
  fullScreen = false,
  overlay = false,
  label = "Загрузка…",
  className = "",
  style = {},
}) {
  const cls = [
    s.root,
    fullScreen ? s.fullScreen : "",
    overlay ? s.overlay : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={cls}
      role="status"
      aria-live="polite"
      aria-label={label}
      style={style}
    >
      <img
        src={src}
        alt=""
        className={s.logo}
        style={{ width: size, height: size, animationDuration: duration }}
      />
      <span className={s.srOnly}>{label}</span>
    </div>
  );
}
