import React from 'react';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import WorkIcon from '@mui/icons-material/Work';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PersonIcon from '@mui/icons-material/Person';
import { useHistory } from 'react-router-dom';

const BottomNavigationComponent = () => {
    const history = useHistory();
    const [value, setValue] = React.useState('home');

    const handleNavigation = (newValue) => {
        setValue(newValue);
        history.push(`/${newValue}`);
    };

    return (
        <BottomNavigation
            value={value}
            onChange={(event, newValue) => handleNavigation(newValue)}
        >
            <BottomNavigationAction label="Home" value="home" icon={<HomeIcon />} />
            <BottomNavigationAction label="Jobs" value="jobs" icon={<WorkIcon />} />
            <BottomNavigationAction label="Earnings" value="earnings" icon={<MonetizationOnIcon />} />
            <BottomNavigationAction label="Profile" value="profile" icon={<PersonIcon />} />
        </BottomNavigation>
    );
};

export default BottomNavigationComponent;