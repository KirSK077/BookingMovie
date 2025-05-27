import React, { useState, FormEvent } from 'react';
import BackendAPI from '../../api/BackendAPI';
import '../styles/LoginForm.css';

type LoginFormProps = {
  onLoginSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await BackendAPI.login(email, password)
      onLoginSuccess();
      localStorage.setItem(email, response);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Ошибка сети или сервера');
      } 
    } finally {
      setLoading(false)
    }
  }


  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <h2 className="login-form__header">Авторизация</h2>
      <div className="login-form__input-container">
        <div className="login-form__input-mail">
          <label className="login-form__label" htmlFor="email">
            E-mail
          </label>
          <input
            className="login-form__input"
            type="email"
            id="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="example@domain.xyz"
          />
        </div>
        <div className="login-form__input-pass">
          <label className="login-form__label" htmlFor="password">
            Пароль
          </label>
          <input
            className="login-form__input"
            type="password"
            id="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        {error && (
          <div className="login-form__error">
            {error}
          </div>
        )}
        <button type="submit" className="login-form__submit-btn" disabled={loading} style={error ? { marginTop: '5px' } : {}}>
          {loading ? 'Авторизация...' : 'Авторизоваться'}
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
