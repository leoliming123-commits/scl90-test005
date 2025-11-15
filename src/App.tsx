import { useState, useEffect } from 'react';
import IntroPage from './components/IntroPage';
import TestPage from './components/TestPage';
import ResultPage from './components/ResultPage';
import InvalidLinkPage from './components/InvalidLinkPage';
import AccessCodePage from './components/AccessCodePage';
import AdminLoginPage from './components/AdminLoginPage';
import AdminDashboard from './components/AdminDashboard';
import { PageType } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const VERIFY_API_URL = `${SUPABASE_URL}/functions/v1/verify-access-code`;

function App() {
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [sessionValid, setSessionValid] = useState<boolean | null>(null);
  const [showAccessCodeInput, setShowAccessCodeInput] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPage, setCurrentPage] = useState<PageType>('intro');
  const [answers, setAnswers] = useState<number[]>([]);

  useEffect(() => {
    const path = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    const isAdmin = urlParams.get('admin') === 'true';

    if (path === '/admin' || isAdmin) {
      setIsAdminRoute(true);
      const adminAuth = localStorage.getItem('admin_authenticated');
      setIsAdminAuthenticated(adminAuth === 'true');
    } else {
      validateSession();
    }
  }, []);

  const handleAdminLogin = () => {
    setIsAdminAuthenticated(true);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('admin_authenticated');
    setIsAdminAuthenticated(false);
  };

  const validateSession = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessCode = urlParams.get('code');

    let sessionToken = localStorage.getItem('session_token');

    if (!sessionToken) {
      sessionToken = crypto.randomUUID();
      localStorage.setItem('session_token', sessionToken);
    }

    const storedCode = localStorage.getItem('access_code');
    const storedFirstAccess = localStorage.getItem('first_access_at');

    if (storedCode && storedFirstAccess) {
      const firstAccessTime = new Date(storedFirstAccess).getTime();
      const now = Date.now();
      const hoursPassed = (now - firstAccessTime) / (1000 * 60 * 60);

      if (hoursPassed <= 24) {
        setSessionValid(true);
        return;
      } else {
        localStorage.removeItem('access_code');
        localStorage.removeItem('first_access_at');
      }
    }

    if (!accessCode) {
      setShowAccessCodeInput(true);
      setSessionValid(false);
      return;
    }

    try {
      const response = await fetch(VERIFY_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          code: accessCode.trim(),
          sessionToken,
        }),
      });

      const result = await response.json();

      if (!result.valid) {
        setErrorMessage(result.message || '验证失败');
        setSessionValid(false);
        return;
      }

      localStorage.setItem('access_code', accessCode.trim());
      localStorage.setItem('first_access_at', result.firstAccessAt);
      setSessionValid(true);
    } catch (err) {
      console.error('验证访问码时出错:', err);
      setErrorMessage('系统错误，请稍后重试。');
      setSessionValid(false);
    }
  };

  const handleAccessCodeSuccess = () => {
    setShowAccessCodeInput(false);
    setSessionValid(true);
  };

  const handleStartTest = () => {
    setCurrentPage('test');
    setAnswers([]);
  };

  const handleComplete = (completedAnswers: number[]) => {
    setAnswers(completedAnswers);
    setCurrentPage('result');
  };

  if (isAdminRoute) {
    if (!isAdminAuthenticated) {
      return <AdminLoginPage onLogin={handleAdminLogin} />;
    }
    return <AdminDashboard onLogout={handleAdminLogout} />;
  }

  if (sessionValid === null) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 flex items-center justify-center">
        <div className="text-neutral-600">加载中...</div>
      </div>
    );
  }

  if (showAccessCodeInput) {
    return <AccessCodePage onSuccess={handleAccessCodeSuccess} />;
  }

  if (!sessionValid) {
    return <InvalidLinkPage message={errorMessage} />;
  }

  return (
    <>
      {currentPage === 'intro' && (
        <IntroPage onStart={handleStartTest} />
      )}
      {currentPage === 'test' && (
        <TestPage onComplete={handleComplete} />
      )}
      {currentPage === 'result' && (
        <ResultPage answers={answers} />
      )}
    </>
  );
}

export default App;
