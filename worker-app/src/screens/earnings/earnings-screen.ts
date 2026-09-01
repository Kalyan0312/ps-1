import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getEarnings } from '../../services/earnings-api';

const EarningsScreen = () => {
    const [todayEarnings, setTodayEarnings] = useState(0);
    const [weeklyEarnings, setWeeklyEarnings] = useState(0);
    const [totalJobs, setTotalJobs] = useState(0);
    const [welfare, setWelfare] = useState(0);

    useEffect(() => {
        const fetchEarnings = async () => {
            try {
                const earningsData = await getEarnings();
                setTodayEarnings(earningsData.today);
                setWeeklyEarnings(earningsData.weekly);
                setTotalJobs(earningsData.totalJobs);
                setWelfare(earningsData.welfare);
            } catch (error) {
                console.error('Error fetching earnings:', error);
            }
        };

        fetchEarnings();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Earnings</Text>
            <Text style={styles.earningText}>Today's Earnings: ₹{todayEarnings}</Text>
            <Text style={styles.earningText}>This Week's Earnings: ₹{weeklyEarnings}</Text>
            <Text style={styles.earningText}>Total Jobs: {totalJobs}</Text>
            <Text style={styles.earningText}>Welfare: ₹{welfare}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    earningText: {
        fontSize: 18,
        marginBottom: 10,
    },
});

export default EarningsScreen;