import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

const AvailabilityToggle = () => {
    const [isAvailable, setIsAvailable] = useState(false);

    const toggleSwitch = () => {
        setIsAvailable(previousState => !previousState);
        // Here you can also add a call to the backend API to update the availability status
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Available for work</Text>
            <Switch
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={isAvailable ? "#f5dd4b" : "#f4f3f4"}
                onValueChange={toggleSwitch}
                value={isAvailable}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        elevation: 2,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AvailabilityToggle;