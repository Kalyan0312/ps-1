import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CertificatesList = ({ certificates }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Certificates</Text>
            {certificates.length > 0 ? (
                certificates.map((certificate, index) => (
                    <View key={index} style={styles.certificateItem}>
                        <Text style={styles.certificateText}>{certificate.name}</Text>
                    </View>
                ))
            ) : (
                <Text style={styles.noCertificatesText}>No certificates available</Text>
            )}
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
    certificateItem: {
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    certificateText: {
        fontSize: 16,
    },
    noCertificatesText: {
        fontSize: 16,
        color: '#888',
    },
});

export default CertificatesList;