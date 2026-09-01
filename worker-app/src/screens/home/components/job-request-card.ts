import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface JobRequestCardProps {
    jobType: string;
    distance: string;
    payment: string;
    onAccept: () => void;
    onDecline: () => void;
}

const JobRequestCard: React.FC<JobRequestCardProps> = ({ jobType, distance, payment, onAccept, onDecline }) => {
    return (
        <View style={styles.card}>
            <Text style={styles.jobType}>{jobType}</Text>
            <Text style={styles.distance}>{distance}</Text>
            <Text style={styles.payment}>{payment}</Text>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
                    <Text style={styles.buttonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.declineButton} onPress={onDecline}>
                    <Text style={styles.buttonText}>Decline</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: 16,
        margin: 8,
        borderRadius: 8,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    jobType: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    distance: {
        fontSize: 14,
        color: '#666',
    },
    payment: {
        fontSize: 16,
        color: '#000',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    acceptButton: {
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 5,
        flex: 1,
        marginRight: 5,
    },
    declineButton: {
        backgroundColor: '#F44336',
        padding: 10,
        borderRadius: 5,
        flex: 1,
        marginLeft: 5,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
    },
});

export default JobRequestCard;