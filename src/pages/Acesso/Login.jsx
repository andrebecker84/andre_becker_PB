import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { auth, firestore } from '../../configs/firebaseConfig';
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence, onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import TextFieldPadrao from '../../components/TextFieldPadrao';
import Botao from '../../components/Botao';
import CardExercicio from '../../components/CardExercicio';
import { doc, getDoc } from 'firebase/firestore';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import '../../css/Home.css';
import CircularLoading from '../../components/CircularLoading';
import Loading from '../../components/Loading';

const Login = () => {
  const [erro, setErro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const [strengthColor, setStrengthColor] = useState('');
  
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(false);

      if (user) {
        const userDoc = doc(firestore, 'usuarios', user.uid);
        const userSnapshot = await getDoc(userDoc);
        
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          navigate(userData.role === 'admin' ? '/admin' : '/colaborador');
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const evaluatePasswordStrength = (password) => {
    if (password.length >= 8) {
      setPasswordStrength('Forte');
      setStrengthColor('#4caf50');
    } else if (password.length >= 6) {
      setPasswordStrength('Média');
      setStrengthColor('#ffc107');
    } else if (password.length > 0) {
      setPasswordStrength('Fraca');
      setStrengthColor('#f44336');
    } else {
      setPasswordStrength('');
      setStrengthColor('');
    }
  };

  const handleChangePassword = (e) => {
    setPassword(e.target.value);
    evaluatePasswordStrength(e.target.value);
  };

  const onLoginSubmit = async (dados) => {
    const { email, senha } = dados;
    setLoginLoading(true);

    try {
      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;
      const userDoc = doc(firestore, 'usuarios', user.uid);
      const userSnapshot = await getDoc(userDoc);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();

        // Verificar se o usuário está bloqueado
        if (userData.blocked === true) {
          alert('Seu acesso foi bloqueado. Entre em contato com o administrador.');
          setErro('Seu acesso foi bloqueado. Entre em contato com o administrador.');
          setLoginLoading(false);
          await signOut(auth);
          navigate('/login');
          return;
        }

        alert('Login bem-sucedido!');
        navigate('/');
        // navigate(userData.role === 'admin' ? '/admin' : '/colaborador');
      } else {
        setErro('Usuário não encontrado.');
      }
    } catch (error) {
      setErro('Erro ao fazer login. Verifique suas credenciais.');
      console.error('Erro no login:', error);
    } finally {
      setLoginLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <CardExercicio largura='450px' bdradius='70px' bDir='#983146 solid 3px' bEsq='#983146 solid 3px' bshadow='0 10px 20px rgba(0, 0, 0, 0.7), 0 0 200px rgba(152, 49, 70, 0.3)'>
        <img src='./public/images/logoACME.png' alt="logomarca ACME" title="logomarca ACME" style={{ width: '300px', marginBottom: '20px' }} />
        <form onSubmit={handleSubmit(onLoginSubmit)} style={{ width: '100%' }}>
          <TextFieldPadrao
            label="E-mail"
            name="email"
            type="email"
            {...register('email', { required: 'E-mail é obrigatório' })}
          />
          {errors.email && <p style={{ color: 'red', textAlign: 'center', marginTop: '-10px', marginBottom: '20px', fontSize: '12px' }}>{errors.email.message}</p>}

          <div style={{ position: 'relative' }}>
            <TextFieldPadrao
              label="Senha"
              name="senha"
              type={mostrarSenha ? 'text' : 'password'}
              {...register('senha', { required: 'Senha é obrigatória' })}
              onChange={handleChangePassword}
            />
            <span
              style={{ position: 'absolute', right: '20px', top: '37px', transform: 'translateY(-50%)', cursor: 'pointer', color: 'hsl(215, 15%, 75%)' }}
              onClick={() => setMostrarSenha(!mostrarSenha)}
            >
              {mostrarSenha ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </span>
          </div>
          {errors.senha && <p style={{ color: 'red', textAlign: 'center',  marginTop: '-10px', marginBottom: '20px', fontSize: '12px' }}>{errors.senha.message}</p>}

          {/* Barra de força da senha */}
          {password && (
            <div
              style={{
                height: '5px',
                borderRadius: '2px',
                backgroundColor: strengthColor,
                transition: 'width 0.3s ease',
                width:
                  passwordStrength === 'Forte'
                    ? '100%'
                    : passwordStrength === 'Média'
                    ? '50%'
                    : passwordStrength === 'Fraca'
                    ? '25%'
                    : '0%',
              }}
            />
          )}

          {/* Texto de feedback da força da senha */}
          {password && (
            <p
              style={{
                color: strengthColor,
                textAlign: 'right',
                margin: '10px 0',
                fontSize: '12px'
              }}
            >
              {passwordStrength === 'Forte'
                ? 'Senha Forte'
                : passwordStrength === 'Média'
                ? 'Senha Média'
                : passwordStrength === 'Fraca'
                ? 'Senha Fraca'
                : ''}
            </p>
          )}

          {erro && <p style={{ color: 'red', textAlign: 'center',  marginTop: '-10px', marginBottom: '20px', fontSize: '12px' }}>{erro}</p>}

          <Botao type="submit" largura="100%" texto="Login" cor='rgba(226, 29, 72, 0.5)' hoverCor='rgba(226, 29, 72, 1)' />
        </form>
        {loginLoading && <CircularLoading margin='20px' />}
        
        <p style={{ textAlign: 'center', fontSize: '14px', fontWeight: 'bold', marginTop: '10px' }}>Ainda não tem uma conta?</p>
        <p style={{ textAlign: 'center', fontSize: '13px', textDecoration: 'underline', marginBottom: '10px' }}>Faça uma conta de colaborador:</p>
        <Botao type="button" startIcon={<PersonAddIcon />} texto="Criar Colaborador" hoverCor='rgba(253, 149, 13, 1)' onClick={() => navigate('/criar-colab')} style={{ width: '100%' }} />
      </CardExercicio>
    </div>
  );
};

export default Login;
