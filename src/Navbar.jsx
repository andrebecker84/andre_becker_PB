import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Button, Menu, MenuItem } from '@mui/material';
import { PropTypes } from 'prop-types';

import { useAuth } from './contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from './configs/firebaseConfig';

import HomeIcon from '@mui/icons-material/Home';
// import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ListIcon from '@mui/icons-material/List';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded';
import RequisicoesIcon from '@mui/icons-material/Assignment';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

import MenuButton from './components/MenuButton';
import AdminColab from './components/AdminColab';
import Container from './components/Container';
import Loading from './components/Loading';

import './css/Navbar.css';

const Navbar = ({ setNavbarHeight }) => {
  const navbarRef = useRef(null);
  const dropdownRefRequisicoes = useRef(null);
  const dropdownRefConta = useRef(null);
  const navigate = useNavigate();
  const { logado, admin, usuarioLogado, loading } = useAuth();
  
  // Estado separado para cada menu
  const [estadoRequisicoes, setEstadoRequisicoes] = useState({ menuAberto: false });
  const [estadoConta, setEstadoConta] = useState({ menuAberto: false });
  const [anchorElRequisicoes, setAnchorElRequisicoes] = useState(null);
  const [anchorElConta, setAnchorElConta] = useState(null);

  const menuItems = [
    { nome: 'Cadastrar Compras', rota: '/cadastro-compras', icone: <ShoppingCartIcon /> },
    admin && { nome: 'Cadastrar Cotações', rota: '/cadastro-cotacoes', icone: <PriceCheckIcon /> },
    { nome: 'Lista de Requisições', rota: '/lista-requisicoes', icone: <ListIcon /> },
  ].filter(Boolean);

  const menuConta = [
    { nome: 'Gerenciar Usuários', rota: '/gerenciar-usuarios', icone: <ManageAccountsIcon /> },
    { nome: 'Adicionar Colaborador', rota: '/criar-colab', icone: <AccountCircleIcon /> },
    { nome: 'Adicionar Administrador', rota: '/criar-admin', icone: <AdminPanelSettingsIcon /> },
  ];

  useEffect(() => {
    if (navbarRef.current) {
      setNavbarHeight(navbarRef.current.offsetHeight);
    }

    const handleClickOutside = (event) => {
  // Verifica se o clique foi fora do dropdown de Requisições
  if (dropdownRefRequisicoes.current && !dropdownRefRequisicoes.current.contains(event.target)) {
    setEstadoRequisicoes({ menuAberto: false });
    setAnchorElRequisicoes(null);
  }
  
  // Verifica se o clique foi fora do dropdown de Conta
  if (dropdownRefConta.current && !dropdownRefConta.current.contains(event.target)) {
    setEstadoConta({ menuAberto: false });
    setAnchorElConta(null);
  }
};

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setNavbarHeight]);

  const toggleDropdownRequisicoes = (event) => {
    setEstadoRequisicoes((prev) => ({
      menuAberto: !prev.menuAberto,
    }));
    setAnchorElRequisicoes(event.currentTarget);
  };

  const toggleDropdownConta = (event) => {
    setEstadoConta((prev) => ({
      menuAberto: !prev.menuAberto,
    }));
    setAnchorElConta(event.currentTarget);
  };

  const handleLogout = async () => {
    console.log("Tentativa de logout iniciada...");
    try {
      await signOut(auth);
      console.log("Logout realizado com sucesso!");
      navigate('/login');
    } catch (error) {
      console.error("Erro ao realizar logout:", error);
    }
  };

  return (
    <Box
      component="nav"
      ref={navbarRef}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        border: '1px solid rgb(29, 33, 38)',
        backgroundColor: 'rgba(15, 18, 20, 0.6)',
        padding: '4px 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backdropFilter: 'blur(5px)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: '8px' }}>
        <img
          className="neon-image"
          src="./public/images/logoHorizontal.png"
          alt="logomarca ACME"
          title="logomarca ACME"
          style={{ height: '35px' }}
        />
      </Box>

      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <ul style={{ display: 'flex', listStyleType: 'none', padding: 0, margin: 0 }}>
          <li>
            <MenuButton to="/" startIcon={<HomeIcon />} label="Home" />
          </li>
          {logado && admin && (
            <>
              <li>
                <MenuButton to="/lista-fornecedores" startIcon={<LocalShippingIcon />} label="Fornecedores" />
              </li>
              <li>
                <MenuButton to="/lista-contatos" startIcon={<PeopleIcon />} label="Contatos" />
              </li>
              <li>
                <MenuButton to="/lista-produtos" startIcon={<InventoryIcon />} label="Produtos" />
              </li>
            </>
          )}
        </ul>
        
        {logado && (
          <Box sx={{ position: 'relative' }} ref={dropdownRefRequisicoes}>
            <MenuButton 
              onClick={toggleDropdownRequisicoes} 
              startIcon={<RequisicoesIcon />} 
              label="Requisições" 
              endIcon={<ArrowDropDownRoundedIcon sx={{ color: 'rgba(226, 29, 72, 1)' }} />} 
            />
            <Menu
              anchorEl={anchorElRequisicoes}
              open={estadoRequisicoes.menuAberto}
              onClose={() => setEstadoRequisicoes({ menuAberto: false })}
              MenuListProps={{
                'aria-labelledby': 'botao-requisicoes',
                role: 'menu',  // Define o papel de menu corretamente
              }}
              sx={{
                color: '#fff',
                '& .MuiPaper-root': {
                  padding: '0 2px',
                  backgroundColor: 'rgba(29, 33, 38, 0.4)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  border: '1px solid rgb(29, 33, 38)',
                  margin: '10px',
                  transition: '100ms ease-in',
                },
                '& .MuiMenuItem-root': {
                  display: 'flex',
                  gap: '10px',
                  margin: '4px 8px',
                  justifyContent: 'left',
                  borderRadius: '8px',
                  backgroundColor: 'none',
                  '&:hover': {
                    color: 'rgba(226, 29, 72, 1)',
                    backgroundColor: 'rgba(115, 33, 48, 0.2)'
                  },
                },
              }}
            >
              {menuItems.map((item, index) => (
                <MenuItem
                  key={index}
                  onClick={(event) => {
                    event.stopPropagation(); // Evita que o evento se propague
                    navigate(item.rota);
                    setEstadoRequisicoes({ menuAberto: false }); // Fecha o menu
                    setAnchorElRequisicoes(null); // Reseta o anchor
                  }}
                  sx={{ color: 'lightgrey', fontSize: '12px', textTransform: 'capitalize', letterSpacing: '0.5px' }}
                >
                  {item.icone}
                  {item.nome}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        )}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '8px' }}>
        {loading ? (
          <Loading />
        ) : logado && usuarioLogado ? (
          <>
            <AdminColab admin={admin} />
            {admin && (
              <Box sx={{ position: 'relative' }} ref={dropdownRefConta}>
                <Container bradius="30px">
                  <MenuButton
                    onClick={toggleDropdownConta}
                    cor="#fff"
                  >
                    <ManageAccountsIcon sx={{ fontSize: '20px' }} />
                  </MenuButton>
                  <Menu
                    anchorEl={anchorElConta}
                    open={estadoConta.menuAberto}
                    onClose={() => setEstadoConta({ menuAberto: false })}
                    MenuListProps={{ 'aria-labelledby': 'botao-admin' }}
                    sx={{
                      color: '#fff',
                      '& .MuiPaper-root': {
                        padding: '0 2px',
                        backgroundColor: 'rgba(29, 33, 38, 0.4)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '12px',
                        border: '1px solid rgb(29, 33, 38)',
                        margin: '10px',
                        transition: '100ms ease-in',
                      },
                      '& .MuiMenuItem-root': {
                        display: 'flex',
                        gap: '10px',
                        margin: '4px 8px',
                        justifyContent: 'left',
                        borderRadius: '8px',
                        backgroundColor: 'none',
                        '&:hover': {
                          color: 'rgba(226, 29, 72, 1)',
                          backgroundColor: 'rgba(115, 33, 48, 0.2)'
                        },
                      },
                    }}
                  >
                    {menuConta.map((item, index) => (
                      <MenuItem
                        key={index}
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate(item.rota);
                          setEstadoConta({ menuAberto: false });
                          setAnchorElConta(null);
                        }}
                        sx={{ color: 'lightgrey', fontSize: '12px', textTransform: 'capitalize', letterSpacing: '0.5px' }}
                      >
                        {item.icone}
                        {item.nome}
                      </MenuItem>
                    ))}
                  </Menu>
                </Container>
              </Box>
            )}
            <Container bradius="30px" corFundo="rgba(100, 0, 0, 1)">
              <Button
                onClick={handleLogout}
                startIcon={<LogoutIcon style={{ fontSize: '18px' }} />}
                sx={{
                  fontSize: '11px',
                  textTransform: 'capitalize',
                  letterSpacing: '1px',
                  borderRadius: '30px',
                  padding: '6px 12px',
                  color: '#fff',
                  '&:hover': { backgroundColor: 'rgba(160, 0, 0, 1)' },
                }}
              >
                Sair
              </Button>
            </Container>
          </>
        ) : (
          <Container bradius="30px" corFundo="rgb(0, 60, 160)">
            <Button
              component={Link}
              to="/login"
              startIcon={<LoginIcon style={{ fontSize: '18px' }} />}
              sx={{
                fontSize: '11px',
                textTransform: 'Capitalize',
                letterSpacing: '1px',
                borderRadius: '30px',
                padding: '6px 12px',
                color: '#fff',
                '&:hover': { backgroundColor: 'rgb(0, 100, 255)' },
              }}
            >
              Login
            </Button>
          </Container>
        )}
      </Box>
    </Box>
  );
};

Navbar.propTypes = {
  setNavbarHeight: PropTypes.func.isRequired,
};

export default Navbar;
