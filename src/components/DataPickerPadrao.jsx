import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

const DatePickerPadrao = ({ label, value, onChange, ...props }) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        value={value}
        onChange={onChange}
        label={label}
        sx={{
          width: '100%',
          margin: '7px 0',
          borderRadius: '30px',
          backgroundColor: 'rgba(29, 33, 38, 0.4)',
          '& label': { 
            color: 'hsl(215, 15%, 75%)', 
            fontWeight: 'regular' 
          },
          '& label.Mui-focused': { color: 'rgba(226, 29, 72, 1)' },
          '& input': { color: '#f0f0f0' },
          '& .MuiOutlinedInput-root': {
            borderRadius: '30px',
            '& fieldset': { borderColor: 'rgb(29, 33, 38)' },
            '&:hover fieldset': { borderColor: '#983146' },
            '&.Mui-focused fieldset': { borderColor: 'rgba(226, 29, 72, 1)' },
            '& .MuiSvgIcon-root': {
              color: '#f0f0f0',
            },
          },
        }}
        {...props}
      />
    </LocalizationProvider>
  );
};

DatePickerPadrao.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.instanceOf(dayjs), PropTypes.string]), // Aceita string se necessário
  onChange: PropTypes.func,
};

export default DatePickerPadrao;
