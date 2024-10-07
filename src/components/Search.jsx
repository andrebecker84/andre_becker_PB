import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import PropTypes from 'prop-types';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  border: '1px solid rgb(29, 33, 38)',
  borderRadius: '30px',
  backgroundColor: alpha(theme.palette.common.white, 0.05),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.10),
    boxShadow: 'none',
  },
  boxShadow: 'rgba(48, 56, 64, 0.1) 0px 1px 0px inset, rgb(9, 11, 11) 0px -1px 0px inset, rgb(9, 11, 11) 0px 1px 2px 0px',
  marginLeft: 0,
  width: '100%',
  maxWidth: '250px', // Largura máxima
  height: '40px', // Altura fixa para a barra de busca
}));

const SearchIconWrapper = styled('div')(() => ({
  padding: '0 10px', // Padding em pixels
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(() => ({
  color: 'inherit',
  width: '100%',
  height: '100%', // Altura para o input
  '& .MuiInputBase-input': {
    padding: '10px 10px 10px 40px', // Padding em pixels
    transition: 'width 0.2s ease', // Transição suave
    '&:focus': {
      width: '200px', // Largura ao focar
    },
  },
}));

export default function SearchBar({ onChange, value = '' }) {
  return (
    <Search>
      <SearchIconWrapper>
        <SearchIcon />
      </SearchIconWrapper>
      <StyledInputBase
        placeholder="Buscar…"
        inputProps={{ 'aria-label': 'search' }}
        onChange={onChange}
        value={value}
      />
    </Search>
  );
}

SearchBar.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.string,
};
