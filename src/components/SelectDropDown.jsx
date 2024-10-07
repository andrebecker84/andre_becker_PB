import { Select, InputLabel, FormControl, OutlinedInput, ListItemText, MenuItem } from '@mui/material';
import CheckboxPadrao from './CheckboxPadrao';
import PropTypes from 'prop-types';

const ITEM_HEIGHT = 100;
const ITEM_PADDING_TOP = 20;

const SelectDropDown = ({ label, items, selectedItems, handleChange, multiple = false }) => {
  return (
    <FormControl sx={{ m: 1, width: 300 }}>
      <InputLabel id="select-dropdown-label" sx={{ color: 'hsl(215, 15%, 75%)' }}>{label}</InputLabel>
      <Select
        labelId="select-dropdown-label"
        id="select-dropdown"
        multiple={multiple}
        value={selectedItems}
        onChange={(event) => {
          const value = multiple ? event.target.value : event.target.value[0];
          handleChange(value);
        }}
        input={<OutlinedInput label={label} />}
        renderValue={(selected) => multiple ? selected.join(', ') : selected}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
              width: 250,
              padding: '5px',
              backgroundColor: 'rgba(29, 33, 38, 0.4)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              border: '1px solid rgb(29, 33, 38)',
              marginTop: '15px',
              transition: '100ms ease-in',
            },
          },
        }}
        sx={{
          border: '1px solid rgb(29, 33, 38)',
          borderRadius: '12px',
          backgroundColor: 'rgba(29, 33, 38, 0.4)',
          boxShadow: 'rgba(48, 56, 64, 0.1) 0px 1px 0px inset, rgb(9, 11, 11) 0px -1px 0px inset, rgb(9, 11, 11) 0px 1px 2px 0px',
          color: '#f0f0f0',
          '& .MuiSelect-select': {
            color: 'hsl(215, 15%, 75%)',
          },
          '& .MuiSelect-icon': {
            color: 'rgb(190, 83, 111, 1)',
          },
        }}
      >
        {items.map((item) => (
          <ListItemText sx={{ color: '#f0f0f0' }} key={item.idCategory || item} primary={
            multiple ? (
              <CheckboxPadrao
                label={item.strCategory || item}
                checked={selectedItems.includes(item)}
                onChange={() => handleChange(item)}
              />
            ) : (
              <MenuItem onClick={() => handleChange(item)}>
                {item.strCategory || item}
              </MenuItem>
            )
          } />
        ))}
      </Select>
    </FormControl>
  );
};

SelectDropDown.propTypes = {
  label: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({
    idCategory: PropTypes.string,
    strCategory: PropTypes.string,
  })).isRequired,
  selectedItems: PropTypes.array.isRequired,
  handleChange: PropTypes.func.isRequired,
  multiple: PropTypes.bool,
};

export default SelectDropDown;
