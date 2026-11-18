import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';
import { Button } from './Button';

export function PublicNav({ children }) {
  const navigate = useNavigate();
  const { authed } = useAuth();

  return (
    <header className="pubnav">
      <div className="pubnav-in">
        <Logo onClick={() => navigate('/')} />
        <div className="pubnav-actions">
          {children}
          {authed ? (
            <Button size="sm" onClick={() => navigate('/app')}>
              Dashboard
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                Log in
              </Button>
              <Button size="sm" onClick={() => navigate('/signup')}>
                Sign up
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default PublicNav;
