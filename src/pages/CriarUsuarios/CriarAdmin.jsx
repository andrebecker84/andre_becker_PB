import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { auth, firestore } from '../../configs/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '../../contexts/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import TextFieldPadrao from '../../components/TextFieldPadrao';
import Botao from '../../components/Botao';
import CardExercicio from '../../components/CardExercicio';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CircularLoading from '../../components/CircularLoading';
import '../../css/Home.css';
import '../../css/Navbar.css';

const CriarAdmin = () => {
  const { logado, admin, loading } = useAuth();
  const [erro, setErro] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const [strengthColor, setStrengthColor] = useState('');
  const [senhaErro, setSenhaErro] = useState('');

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const navigate = useNavigate();
  
  const senha = watch('senha');
  const confirmarSenha = watch('confirmarSenha');

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

  useEffect(() => {
    if (!loading && (!logado || !admin)) {
      navigate('/login');
    }
  }, [logado, admin, loading, navigate]);

  const onSubmit = async (dados) => {
    const { nome, email, senha } = dados;
    setLoginLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      const usuarioRef = doc(firestore, 'usuarios', user.uid);
      await setDoc(usuarioRef, {
        uid: user.uid,
        role: 'admin',
        email: user.email,
        nome: nome,
        dataCriacao: new Date(),
      });

      setErro(null);
      alert('Administrador criado com sucesso!');
      // navigate('/');
    } catch (error) {
      console.error('Erro ao criar administrador:', error);
      setErro('Erro ao criar administrador: ' + error.message);
    } finally {
      setLoginLoading(false);
    }
  };

  // Regex para validação
  const regexNome = /^[A-Za-zÀ-ÿ\s]+$/; // Permite letras e espaços
  const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Validação básica de e-mail

  return (
    <div>
      <CardExercicio largura='450px' bdradius='70px' bDir='rgba(0, 255, 0, 1) solid 3px' bEsq='rgba(0, 255, 0, 1) solid 3px' bshadow='0 10px 20px rgba(0, 0, 0, 0.7), 0 0 200px rgba(0, 255, 0, 0.2)'>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '83px', height: '83px', margin: '10px', borderRadius: '50%' }}>
          <AdminPanelSettingsIcon style={{ color: 'rgba(0, 255, 0, 1)', fontSize: '100px' }} />
        </div>
        <h2 style={{ color: 'rgba(0, 255, 0, 1)', marginBottom: '20px' }}>Criar Administrador</h2>
        <form onSubmit={handleSubmit(onSubmit)} style={{ width: '300px' }}>
          {/* Campo Nome */}
          <TextFieldPadrao
            label="Nome"
            name="nome"
            type="text"
            {...register('nome', { 
              required: 'Nome é obrigatório',
              pattern: {
                value: regexNome,
                message: 'Nome inválido. Use apenas letras.'
              },
              onChange: (e) => setErro(e.target.value ? null : 'Nome é obrigatório')
            })}
          />
          {errors.nome && <p style={{ color: 'red', textAlign: 'center', marginTop: '-10px', marginBottom: '20px', fontSize: '12px' }}>{errors.nome.message}</p>}

          {/* Campo E-mail */}
          <TextFieldPadrao
            label="E-mail"
            name="email"
            type="email"
            {...register('email', { 
              required: 'E-mail é obrigatório',
              pattern: {
                value: regexEmail,
                message: 'E-mail inválido.'
              },
              onChange: (e) => setErro(e.target.value ? null : 'E-mail é obrigatório')
            })}
          />
          {errors.email && <p style={{ color: 'red', textAlign: 'center', marginTop: '-10px', marginBottom: '20px', fontSize: '12px' }}>{errors.email.message}</p>}

          {/* Campo Senha */}
          <div style={{ position: 'relative' }}>
            <TextFieldPadrao
              label="Senha"
              name="senha"
              type={mostrarSenha ? 'text' : 'password'}
              {...register('senha', { 
                required: 'Senha é obrigatória',
                onChange: (e) => {
                  handleChangePassword(e);
                  setErro(e.target.value ? null : 'Senha é obrigatória');
                }
              })}
            />
            <span
              style={{ position: 'absolute', right: '20px', top: '30px', transform: 'translateY(-50%)', cursor: 'pointer', color: 'hsl(215, 15%, 75%)' }}
              onClick={() => setMostrarSenha(!mostrarSenha)}
            >
              {mostrarSenha ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </span>
          </div>
          {errors.senha && <p style={{ color: 'red', textAlign: 'center', marginTop: '-10px', marginBottom: '20px', fontSize: '12px' }}>{errors.senha.message}</p>}

          {/* Campo Confirmar Senha */}
          <TextFieldPadrao
            label="Confirmar Senha"
            name="confirmarSenha"
            type={mostrarSenha ? 'text' : 'password'}
            {...register('confirmarSenha', {
              required: 'Confirmação de senha é obrigatória',
              onChange: (e) => {
                const valor = e.target.value;
                setSenhaErro(valor === senha ? '' : 'As senhas não correspondem');
              }
            })}
          />
          {senhaErro && <p style={{ color: 'red', textAlign: 'center', marginTop: '-10px', marginBottom: '20px', fontSize: '12px' }}>{senhaErro}</p>}

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

          {/* Mensagem de erro geral */}
          {erro && <p style={{ color: 'red', textAlign: 'center', marginTop: '-10px', marginBottom: '20px', fontSize: '12px' }}>{erro}</p>}

          {/* Botão de criação de administrador */}
          <Botao type="submit" largura="100%" texto="Criar Administrador" corTexto='#000' cor='rgba(0, 255, 0, 1)' hoverCor='rgba(0, 255, 0, 0.8)' startIcon={<PersonAddIcon />} />
        </form>
        {loginLoading && <CircularLoading />}
      </CardExercicio>
    </div>
  );
};

export default CriarAdmin;
