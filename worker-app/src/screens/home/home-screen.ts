import React, { useEffect, useState } from 'react';
import { View, Text, Switch, Button } from 'react-native';
import EarningsSummary from './components/earnings-summary';
import JobRequestCard from './components/job-request-card';
import { fetchJobRequests, fetchEarnings } from '../../services/worker-api';

const HomeScreen = () => {
    const [isAvailable, setIsAvailable] = useState(false);
    const [earnings, setEarnings] = useState({ today: 0, jobsToday: 0 });
    const [jobRequests, setJobRequests] = useState([]);

    useEffect(() => {
        loadEarnings();
        loadJobRequests();
    }, []);

    const loadEarnings = async () => {
        const data = await fetchEarnings();
        setEarnings(data);
    };

    const loadJobRequests = async () => {
        const requests = await fetchJobRequests();
        setJobRequests(requests);
    };

    const toggleAvailability = () => {
        setIsAvailable(previousState => !previousState);
    };

    return (
        <View>
            <Text>Available for work</Text>
            <Switch
                value={isAvailable}
                onValueChange={toggleAvailability}
            />
            <EarningsSummary earnings={earnings} />
            {jobRequests.map((request, index) => (
                <JobRequestCard key={index} request={request} />
            ))}
        </View>
    );
};

export default HomeScreen;