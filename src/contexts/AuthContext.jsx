import { createContext, useContext, useEffect, useState } from 'react';
import { auth, firestore } from '../configs/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import PropTypes from 'prop-types';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [logado, setLogado] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [bloqueado, setBloqueado] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLogado(true);
        setUsuarioLogado(user);
        const userDoc = doc(firestore, 'usuarios', user.uid);
        const userSnapshot = await getDoc(userDoc);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setAdmin(userData.role === 'admin');
          setUsuarioLogado(userData); // Define os dados completos do usuário
          setBloqueado(userData.blocked);
        }
      } else {
        setLogado(false);
        setAdmin(false);
        setUsuarioLogado(null);
        setBloqueado(true);
      }
      setLoading(false); // Finaliza o estado de carregamento
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ logado, admin, usuarioLogado, bloqueado, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);
