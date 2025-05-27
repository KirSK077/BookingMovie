import { useEffect, useState } from "react";
import AdminInterface from "./components/AdminInterface/Admin";
import ClientInterface from "./components/ClientInterface/Client";
import LoginButton from "./components/LogInLogOut/LogInLogOutBtn";
import LoginForm from "./components/LogInLogOut/LoginForm";
import './App.css'


export default function App() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowLoginForm(false);
    setIsAdminMode(true);
  };

  const toggleLoginForm = () => {
    setShowLoginForm(!showLoginForm);
    setIsAdminMode(!isAdminMode);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowLoginForm(false);
    setIsAdminMode(false);
  };

  useEffect(() => {
    const loggedInUser = localStorage.getItem('shfe-diplom@netology.ru')
    if (loggedInUser) {
      setIsLoggedIn(true);
      setIsAdminMode(true);
    }
  }, [])
  
  return (
    <>
      <div className={`container ${isAdminMode ? 'mode-admin' : 'mode-client'}`}>
        <div className='container__row'>
          <div className='container__col-lg-8'>
            <header className="header">
              <div className={`${isAdminMode ? 'header__box_admin' : 'header__box_client'}`}>
                <h1 className="header__client_thick-letter">Идём<span className="header__client_thin-letter">в</span>кино</h1>
                <h2 className={`${isAdminMode ? 'header__admin' : 'header__admin_hidden'}`}>Администраторррская</h2>
              </div>
              <LoginButton isLoggedIn={isLoggedIn} onToggleAdmin={toggleLoginForm} onLogout={handleLogout} />
            </header>
            {showLoginForm && <LoginForm onLoginSuccess={handleLoginSuccess} />}
            {!showLoginForm && !isLoggedIn && <ClientInterface />} 
            {isLoggedIn && <AdminInterface />}
          </div>
        </div>
      </div>
    </>
  )
}

