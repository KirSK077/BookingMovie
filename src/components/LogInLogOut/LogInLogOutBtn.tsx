import React, { useState } from "react";
import '../styles/LogInLogOutBtn.css';

type LoginButtonProps = {
  isLoggedIn: boolean;
  onToggleAdmin?: () => void;
  onLogout?: () => void;
}

const LoginButton: React.FC<LoginButtonProps> = ({ isLoggedIn, onToggleAdmin, onLogout }) => {
  const [isAdminMode, setAdminMode] = useState(true);

  const handleClick = () => {
    if (isLoggedIn) {
      if (onLogout) onLogout();
      setAdminMode(true);
      localStorage.removeItem('shfe-diplom@netology.ru')
    } else {
      setAdminMode(!isAdminMode);
      if (onToggleAdmin) {
        onToggleAdmin()
      };
    }
  };

  return (
    <>
      <button className='login-btn' onClick={handleClick}>
        <span className={isLoggedIn ? 'btn-sym__logout' : 'btn-sym__login'}></span>
        <span className="btn-text">{isLoggedIn ? 'Выйти' : 'Войти'}</span>
        </button>
    </>
  );
};

export default LoginButton;
