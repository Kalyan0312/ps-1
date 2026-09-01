import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import { getWorkerProfile } from '../../services/worker-api';
import SkillsList from './components/skills-list';
import CertificatesList from './components/certificates-list';

const ProfileScreen = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getWorkerProfile();
                setProfile(data);
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) {
        return (
            <View>
                <Text>Loading...</Text>
            </View>
        );
    }

    if (!profile) {
        return (
            <View>
                <Text>No profile data available.</Text>
            </View>
        );
    }

    return (
        <ScrollView>
            <View>
                <Image source={{ uri: profile.photo }} style={{ width: 100, height: 100 }} />
                <Text>{profile.name}</Text>
                <Text>Rating: {profile.rating}</Text>
                <Text>Cooperative Badge: {profile.cooperativeBadge}</Text>
                <SkillsList skills={profile.skills} />
                <CertificatesList certificates={profile.certificates} />
                <Text>Experience: {profile.experience} years</Text>
            </View>
        </ScrollView>
    );
};

export default ProfileScreen;