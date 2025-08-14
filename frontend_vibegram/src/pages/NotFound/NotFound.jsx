import styles from '../NotFound/NotFound.module.css';
import loginImage from '../../assets/images/LoginSideImage.jpg'; 

export default function NotFoundPage() {
  return (
    <div className={styles.container}>
      <div className={styles.imageContainer}>
        <img 
          src={loginImage} 
          alt="Страница не найдена"
          className={styles.loginImage}
        />
      </div>
      <div className={styles.textContent}>
        <h1 className={styles.title}>Oops! Page Not Found (404 Error)</h1>
        <p className={styles.description}>
          We're sorry, but the page you're looking for doesn't seem to exist.
          If you typed the URL manually, please double-check the spelling.
          If you clicked on a link, it may be outdated or broken.
        </p>
      </div>
    </div>
  );
}