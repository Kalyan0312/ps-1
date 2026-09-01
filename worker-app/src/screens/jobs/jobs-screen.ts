import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { getActiveJob, updateJobStatus } from '../../services/jobs-api';
import JobStatus from './components/job-status';
import JobActionButton from './components/job-action-button';

const JobsScreen = () => {
    const [activeJob, setActiveJob] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActiveJob = async () => {
            try {
                const job = await getActiveJob();
                setActiveJob(job);
            } catch (error) {
                console.error('Error fetching active job:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchActiveJob();
    }, []);

    const handleJobAction = async () => {
        if (activeJob.status === 'Assigned') {
            await updateJobStatus(activeJob.id, 'Working');
        } else if (activeJob.status === 'Working') {
            await updateJobStatus(activeJob.id, 'Done');
        }
        // Refresh the job status after action
        const updatedJob = await getActiveJob();
        setActiveJob(updatedJob);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {activeJob ? (
                <>
                    <JobStatus status={activeJob.status} />
                    <JobActionButton status={activeJob.status} onPress={handleJobAction} />
                </>
            ) : (
                <Text>No active jobs available.</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default JobsScreen;