import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const JobStatus = ({ status }) => {
    const statusText = () => {
        switch (status) {
            case 'assigned':
                return 'Assigned';
            case 'on_the_way':
                return 'On the way';
            case 'working':
                return 'Working';
            case 'done':
                return 'Done';
            default:
                return 'Unknown Status';
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.statusText}>{statusText()}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#f8f8f8',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default JobStatus;