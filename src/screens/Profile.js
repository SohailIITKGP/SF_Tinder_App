import { StyleSheet, Text, View, Image, ScrollView, KeyboardAvoidingView, Platform, Modal, Button, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import bg from '../../assets/Background1.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const Profile = ({ navigation }) => {
    const [user, setUser] = useState({});
    const [errormsg, setErrormsg] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [partnerName, setPartnerName] = useState('');
    const [partnerEmail, setPartnerEmail] = useState('');
    const [message, setMessage] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [notificationVisible, setNotificationVisible] = useState(false);

    useEffect(() => {
        async function fetchData() {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                setUser(JSON.parse(userData));
            } else {
                setErrormsg('User not found');
            }
        }
        fetchData();
    }, []);

    const invitePromPartner = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.post(
                'https://lol-2eal.onrender.com/invitePromPartner',
                { partnerName, partnerEmail },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setMessage(response.data.message);
            setModalVisible(false);
            setPartnerName('');
            setPartnerEmail('');
        } catch (error) {
            console.error("Error inviting prom partner:", error);
            setMessage(error.response?.data?.message || 'Server error');
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ flexGrow: 2 }} keyboardShouldPersistTaps="handled">
                <View style={styles.container}>
                    <Image style={styles.patternbg} source={bg} />

                    <View style={styles.container1}>
                        <View style={styles.profileCard}>
                            {user.profile_image ? (
                                <Image
                                    source={{ uri: user.profile_image }}
                                    style={styles.profilePic}
                                    onError={() => setErrormsg('Failed to load profile image')}
                                />
                            ) : (
                                <Text style={styles.errormessage}>Upload a Profile Pic</Text>
                            )}
                            <Text style={styles.name}>{user.name || 'N/A'}</Text>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Email</Text>
                                <Text style={styles.detailValue}>{user.email || 'N/A'}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Gender</Text>
                                <Text style={styles.detailValue}>{user.gender || 'N/A'}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Age</Text>
                                <Text style={styles.detailValue}>{user.age || 'N/A'}</Text>
                            </View>
                        </View>
                        
                        <Button title="Invite to Prom" onPress={() => setModalVisible(true)} />
                    </View>

                    {/* Modal for inviting prom partner */}
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={() => setModalVisible(false)}
                    >
                        <View style={styles.modalView}>
                            <Text style={styles.modalText}>Invite to Prom</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Partner Name"
                                value={partnerName}
                                onChangeText={setPartnerName}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Partner Email"
                                value={partnerEmail}
                                onChangeText={setPartnerEmail}
                            />
                            <Button title="Send Invitation" onPress={invitePromPartner} />
                            <Button title="Cancel" onPress={() => setModalVisible(false)} color="red" />
                            {message ? <Text style={styles.message}>{message}</Text> : null}
                        </View>
                    </Modal>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

export default Profile;

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        display: 'flex',
    },
    patternbg: {
        position: 'absolute',
        top: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
    },
    container1: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
    },
    profileCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        width: '80%',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    profilePic: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 4,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'black',
        marginBottom: 12,
    },
    detailRow: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    detailLabel: {
        fontSize: 16,
        color: '#555',
    },
    detailValue: {
        fontSize: 16,
        color: '#333',
    },
    errormessage: {
        fontSize: 16,
        color: 'red',
        marginBottom: 10,
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 18,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 15,
        paddingLeft: 10,
        width: '80%',
    },
    message: {
        marginTop: 10,
        color: 'green',
    },
});
