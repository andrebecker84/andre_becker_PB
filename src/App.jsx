import { Suspense, lazy, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './Navbar';
import Loading from './components/Loading';
import PaginaNaoEncontrada from './pages/PaginaNaoEncontrada';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const Home = lazy(() => import('./Home'));
const Login = lazy(() => import('./pages/Acesso/Login'));
const Administrador = lazy(() => import('./pages/PaginaAdmin'));
const Colaborador = lazy(() => import('./pages/PaginaColaborador'));
const GerenciarUsuarios = lazy(() => import('./pages/Configuracoes/GerenciarUsuarios'));
const CriarColab = lazy(() => import('./pages/CriarUsuarios/CriarColab'));
const CriarAdmin = lazy(() => import('./pages/CriarUsuarios/CriarAdmin'));
const CadastroContatos = lazy(() => import('./pages/Contatos/CadastroContatos'));
const CadastroCotacoes = lazy(() => import('./pages/Requisicoes/CadastroCotacoes'));
const CadastroFornecedores = lazy(() => import('./pages/Fornecedores/CadastroFornecedores'));
const CadastroProdutos = lazy(() => import('./pages/Produtos/CadastroProdutos'));
const CadastroCompras = lazy(() => import('./pages/Requisicoes/CadastroCompras'));
const ListaContatos = lazy(() => import('./pages/Contatos/ListaContatos'));
const ListaFornecedores = lazy(() => import('./pages/Fornecedores/ListaFornecedores'));
const ListaProdutos = lazy(() => import('./pages/Produtos/ListaProdutos'));
const ListaRequisicoes = lazy(() => import('./pages/Requisicoes/ListaRequisicoes'));

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Main />
      </Router>
    </AuthProvider>
  );
};

const Main = () => {
  const { logado, admin, usuarioLogado } = useAuth();
  const [navbarHeight, setNavbarHeight] = useState(0);

  return (
    <>
      <Navbar setNavbarHeight={setNavbarHeight} admin={admin} usuarioLogado={usuarioLogado} />

      <div style={{ paddingTop: `${navbarHeight}px` }}>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/criar-colab" element={<CriarColab />} />

            {logado && (
              <>
                <Route path="/criar-admin" element={admin ? <CriarAdmin /> : <h3>Você não tem permissão para acessar esta página.</h3>} />
                <Route path="/admin" element={admin ? <Administrador /> : <h3>Você não tem permissão para acessar esta página.</h3>} />
                <Route path="/gerenciar-usuarios" element={admin ? <GerenciarUsuarios /> : <h3>Você não tem permissão para acessar esta página.</h3>} />
                <Route path="/cadastro-contatos" element={admin ? <CadastroContatos /> : <h3>Você não tem permissão para acessar esta página.</h3>} />
                <Route path="/cadastro-cotacoes" element={admin ? <CadastroCotacoes /> : <h3>Você não tem permissão para acessar esta página.</h3>} />
                <Route path="/cadastro-fornecedores" element={admin ? <CadastroFornecedores /> : <h3>Você não tem permissão para acessar esta página.</h3>} />
                <Route path="/cadastro-produtos" element={admin ? <CadastroProdutos /> : <h3>Você não tem permissão para acessar esta página.</h3>} />
                
                <Route path="/colaborador" element={<Colaborador />} />
                <Route path="/cadastro-compras" element={<CadastroCompras />} />
                <Route path="/lista-contatos" element={<ListaContatos />} />
                <Route path="/lista-fornecedores" element={<ListaFornecedores />} />
                <Route path="/lista-produtos" element={<ListaProdutos />} />
                <Route path="/lista-requisicoes" element={<ListaRequisicoes />} />
              </>
            )}

            <Route path="*" element={<PaginaNaoEncontrada />} />
          </Routes>
        </Suspense>
      </div>
    </>
  );
};

export default App;
