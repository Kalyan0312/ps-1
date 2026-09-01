import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const EarningsSummary = ({ earnings, jobsToday, rating }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.earningsText}>Today's Earnings: ₹{earnings}</Text>
            <Text style={styles.jobsText}>Jobs Today: {jobsToday}</Text>
            <Text style={styles.ratingText}>Rating: {rating}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    earningsText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    jobsText: {
        fontSize: 16,
        marginVertical: 4,
    },
    ratingText: {
        fontSize: 16,
        color: '#FFA500', // Orange color for rating
    },
});

export default EarningsSummary;