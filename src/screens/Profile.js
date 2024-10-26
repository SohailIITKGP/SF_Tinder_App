import { StyleSheet, Text, View, Image, ScrollView, KeyboardAvoidingView, Platform, Modal, Button, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import bg from '../../assets/Background1.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Profile = ({ navigation }) => {
    const [user, setUser] = useState({});
    const [errormsg, setErrormsg] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [receiverId, setReceiverId] = useState('');
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
        fetchNotifications(); 
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get('/fetchPromRequests', {
                headers: {
                    'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`
                }
            });
            setNotifications(response.data.requests); 
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const sendPromRequest = async () => {
        try {
            const response = await axios.post('/requestPromNight', { receiverId }, {
                headers: {
                    'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`
                }
            });
            setMessage(response.data.message);
            setModalVisible(false);
            setReceiverId('');
        } catch (error) {
            console.error("Error sending request:", error);
            setMessage(error.response?.data?.message || 'Server error');
        }
    };

    const acceptRequest = async (requestId) => {
        try {
            const response = await axios.post('/acceptPromNight', { requestId }, {
                headers: {
                    'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`
                }
            });
            setMessage(response.data.message);
            fetchNotifications(); 
        } catch (error) {
            console.error("Error accepting request:", error);
            setMessage(error.response?.data?.message || 'Server error');
        }
    };

    const rejectRequest = async (requestId) => {
        try {
            const response = await axios.post('/rejectPromNight', { requestId }, {
                headers: {
                    'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`
                }
            });
            setMessage(response.data.message);
            fetchNotifications(); 
        } catch (error) {
            console.error("Error rejecting request:", error);
            setMessage(error.response?.data?.message || 'Server error');
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ flexGrow: 2 }} keyboardShouldPersistTaps="handled">
                <View style={styles.container}>
                    <Image style={styles.patternbg} source={bg} />
                    
                    <View style={styles.notificationButtonContainer}>
                        <Button title="🔔" onPress={() => setNotificationVisible(true)} />
                    </View>

                    <View style={styles.container1}>
                        <View style={styles.profileCard}>
                            {user.profile_image ? (
                                <Image 
                                    source={{ uri: user.profile_image}} 
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

                    {/* Modal for sending prom request */}
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={() => setModalVisible(false)}
                    >
                        <View style={styles.modalView}>
                            <Text style={styles.modalText}>Send Prom Invitation</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter User ID"
                                value={receiverId}
                                onChangeText={setReceiverId}
                            />
                            <Button title="Send Request" onPress={sendPromRequest} />
                            <Button title="Cancel" onPress={() => setModalVisible(false)} color="red" />
                            {message ? <Text style={styles.message}>{message}</Text> : null}
                        </View>
                    </Modal>

                    {/* Notification Modal */}
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={notificationVisible}
                        onRequestClose={() => setNotificationVisible(false)}
                    >
                        <View style={styles.modalView}>
                            <Text style={styles.modalText}>Prom Requests</Text>
                            {notifications.length > 0 ? (
                                notifications.map((request) => (
                                    <View key={request.id} style={styles.requestItem}>
                                        <Text>{`Request from ${request.senderName}`}</Text>
                                        <Button title="Accept" onPress={() => acceptRequest(request.id)} />
                                        <Button title="Reject" onPress={() => rejectRequest(request.id)} color="red" />
                                    </View>
                                ))
                            ) : (
                                <Text>No new requests</Text>
                            )}
                            <Button title="Close" onPress={() => setNotificationVisible(false)} />
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
    notificationButtonContainer: {
        position: 'absolute',
        top: 40, 
        right: 20,
        zIndex: 10,
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
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 18,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 15,
        width: '80%',
        paddingHorizontal: 10,
    },
    message: {
        marginTop: 10,
        color: 'green',
    },
    requestItem: {
        marginBottom: 10,
        padding: 10,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 5,
        width: '100%',
        alignItems: 'center',
    },
});
