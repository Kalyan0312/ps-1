import React from 'react';

const SOSButton = () => {
    const handleSOS = () => {
        // Logic to handle SOS action, e.g., sending a distress signal
        console.log("SOS button pressed!");
    };

    return (
        <button onClick={handleSOS} style={styles.button}>
            SOS
        </button>
    );
};

const styles = {
    button: {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: 'red',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '60px',
        height: '60px',
        fontSize: '24px',
        cursor: 'pointer',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
    },
};

export default SOSButton;