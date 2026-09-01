import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useJobStatus } from '../../../state/worker-store';

const JobActionButton = () => {
    const { jobStatus, startJob, completeJob } = useJobStatus();

    const handlePress = () => {
        if (jobStatus === 'Assigned') {
            startJob();
        } else if (jobStatus === 'Working') {
            completeJob();
        }
    };

    return (
        <TouchableOpacity style={styles.button} onPress={handlePress}>
            <Text style={styles.buttonText}>
                {jobStatus === 'Assigned' ? 'Start' : 'Complete'}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#007BFF',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
});

export default JobActionButton;