import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SkillsList = ({ skills }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Skills</Text>
            {skills.map((skill, index) => (
                <Text key={index} style={styles.skill}>
                    {skill}
                </Text>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    skill: {
        fontSize: 16,
        marginVertical: 4,
    },
});

export default SkillsList;