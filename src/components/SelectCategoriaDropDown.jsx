import { Select, InputLabel, FormControl, OutlinedInput, ListItemText, MenuItem } from '@mui/material';
import { useState } from 'react';
import PropTypes from 'prop-types';

const ITEM_HEIGHT = 100;
const ITEM_PADDING_TOP = 20;

const SelectCategoriaDropDown = ({ label, categorias, categoriaSelecionada, handleChange }) => {
  const [open, setOpen] = useState(false);

  return (
    <FormControl fullWidth>
      <InputLabel 
        shrink 
        id="select-categoria-label"
        sx={{ marginTop: '7px', color: 'hsl(215, 15%, 75%)' }}
      >
        {label}
      </InputLabel>
      <Select
        labelId="select-categoria-label"
        id="select-categoria"
        open={open}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        value={categoriaSelecionada ? categoriaSelecionada.strCategory : ''}
        onChange={(event) => {
          const categoriaSelecionada = categorias.find(categoria => categoria.strCategory === event.target.value);
          handleChange(categoriaSelecionada);
        }}
        displayEmpty
        input={<OutlinedInput label={label} />}
        renderValue={(selected) => selected}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
              width: 'auto',
              padding: '0 2px',
              backgroundColor: 'rgba(29, 33, 38, 0.4)',
              backdropFilter: 'blur(10px)',
              borderRadius: '15px',
              border: '1px solid rgb(29, 33, 38)',
              marginTop: '10px',
              transition: '100ms ease-in',
            },
          },
        }}
        sx={{
          border: '1px solid rgb(29, 33, 38)',
          borderRadius: '30px',
          margin: '7px 0',
          backgroundColor: 'rgba(29, 33, 38, 0.4)',
          color: '#f0f0f0',
          // '&:hover': { borderColor: '#983146' },
          // '&.Mui-focused': { borderColor: 'rgba(226, 29, 72, 1)' },
          '& .MuiSelect-select': {
            color: 'hsl(215, 15%, 75%)',
          },
          '& .MuiSelect-icon': {
            color: 'rgb(190, 83, 111, 1)',
          },
        }}
      >
        {categorias.map((categoria) => (
          <MenuItem 
            key={categoria.idCategory} 
            value={categoria.strCategory} 
            sx={{
              display: 'flex',
              gap: '10px',
              margin: '4px 8px',
              justifyContent: 'left',
              borderRadius: '8px',
              backgroundColor: 'none',
              color: 'hsl(215, 15%, 75%)',
              '&:hover': {
                color: 'rgba(226, 29, 72, 1)', // Cor do texto ao passar o mouse
                backgroundColor: 'rgba(115, 33, 48, 0.2)', // Cor do fundo ao passar o mouse
              },
              '&.Mui-selected': {
                backgroundColor: 'rgba(226, 29, 72, 0.5)', // Cor do fundo para item selecionado
                color: 'rgba(226, 29, 72, 1)', // Cor do texto para item selecionado
                '&:hover': {
                  color: '#fff',
                  backgroundColor: 'rgba(226, 29, 72, 1)', // Cor do fundo para item selecionado ao passar o mouse
                },
              },
            }}
          >
            <ListItemText primary={categoria.strCategory} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

SelectCategoriaDropDown.propTypes = {
  label: PropTypes.string.isRequired,
  categorias: PropTypes.arrayOf(PropTypes.shape({
    idCategory: PropTypes.string.isRequired,
    strCategory: PropTypes.string.isRequired,
  })).isRequired,
  categoriaSelecionada: PropTypes.object,
  handleChange: PropTypes.func.isRequired,
};

export default SelectCategoriaDropDown;
