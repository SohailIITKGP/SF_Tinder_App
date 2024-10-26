import { StyleSheet, Text, View, Image, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import bg from '../../assets/Background1.png'
// import logo from '../../assets/mainlogo.png'
import { button1 } from '../common/button'
import { errormessage, formgroup, head1, head2, input, label, link, link2 } from '../common/formcss'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'

const Login = ({ navigation }) => {
    const [fdata, setFdata] = useState({
        email: '',
        password: ''
    })

    const [errormsg, setErrormsg] = useState(null);

    useEffect(() => {
        async function fetchData() {
            const token = await AsyncStorage.getItem('token');
            console.log("token is ", token);
        }
        fetchData();
    }, [])

    const Sendtobackend = async () => {
        const token = await AsyncStorage.getItem('user');
        console.log("token is ", token);
        if (fdata.email == '' || fdata.password == '') {
            setErrormsg('All fields are required');
            return;
        }
        else {
            fetch('http://10.105.51.160:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(fdata)
            })
                .then(res => res.json())
                .then(async data => {
                    console.log("it is in login In second case",data.token);

                    if (data.error) {
                        setErrormsg(data.error);
                    } else {
                        console.log("entering local storage")
                        await AsyncStorage.setItem('token', JSON.stringify(data.token));
                        console.log("exiting local storage")
                        const user = await AsyncStorage.getItem('user');
                        console.log("data token is ", JSON.stringify(data.token));
                        const token = JSON.stringify(data.token);
                        const formattedToken = token.replace(/^"|"$/g, '');
                        console.log("formated token from login is ", formattedToken);


                        alert('Logged in successfully');
                        console.log("user is ", user);

                        if (!user) {
                            try {
                                console.log("the authorization is ", `Bearer ${formattedToken}`);
                                const response = await axios.get('http://10.105.51.160:3000/user', {
                                    headers: {
                                        Authorization: `Bearer ${formattedToken}`
                                    }
                                });
                                console.log("response  from login is", response.data.data);
                                const data = response.data.data;
                                console.log("data is ", data);
                                const dataParesed=JSON.parse(data);
                                setUserResponse(dataParesed)
                                

                                await AsyncStorage.setItem("user", JSON.stringify(dataParesed))
                                console.log("done");

                            } catch (error) {
                                console.error("Error getting User");
                            }

                        }
                        else {
                            const response = await axios.get('http://10.105.51.160:3000/user', {
                                headers: {
                                    Authorization: `Bearer ${formattedToken}`
                                }
                            });
                            console.log("response  from login is", response.data.data);
                            const data = response.data.data;
                            console.log("data is ", data);
                            const userr = await AsyncStorage.getItem("user");
                            console.log("user from the local storage is", JSON.parse(userr).email)

                            console.log("userrr from login is", JSON.parse(userr).email);
                            const email = JSON.parse(userr).email;
                            console.log("user from api", data.email);
                            if (email !== data.email) {
                                console.log("yes we are fixing you ass");
                                console.log("userResponse");
                                await AsyncStorage.setItem("user", JSON.stringify(data));
                            }

                        }
                        if (user)
                            console.log("navigating to home")
                            navigation.navigate('Home');
                    }
                })
                .catch(error => {
                    console.error('Error during fetch:', error);
                    setErrormsg('Failed to login. Please try again later.');
                });
        }
    }
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 2 }} keyboardShouldPersistTaps="handled">
                <View style={styles.container}>
                    <Image style={styles.patternbg} source={bg} />

                    <View style={styles.container1} >

                        <View style={styles.s2}>
                            <View>

                            <Text style={head1}>Login</Text>
                            <Text style={head2}>Sign in to continue</Text>
                            {
                                errormsg ? <Text style={errormessage}>{errormsg}</Text> : null
                            }
                            <View style={formgroup}>
                                <Text style={label}>Email</Text>
                                <TextInput style={input}
                                    placeholder="Enter your email"

                                    onPressIn={() => setErrormsg(null)}
                                    onChangeText={(text) => setFdata({ ...fdata, email: text })}
                                />
                            </View>
                            <View style={formgroup}>
                                <Text style={label}>Password</Text>
                                <TextInput style={input}
                                    placeholder="Enter your password"

                                    secureTextEntry={true}

                                    onChangeText={(text) => setFdata({ ...fdata, password: text })}
                                    onPressIn={() => setErrormsg(null)}

                                />
                            </View>
                            <View style={styles.fp}>
                                <Text style={link}>Forgot Password?</Text>
                            </View>
                            <Text style={button1}
                                onPress={() => Sendtobackend()}
                            >Login</Text>
                            <Text style={link2}>Don't have an account?&nbsp;
                                <Text style={link}
                                    onPress={() => navigation.navigate('Signup')}
                                >
                                    Create a new account
                                </Text>
                            </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

export default Login

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
        // backgroundColor:"grey"
    },
    s1: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '20%',
    },
    small1: {
        color: 'black',
        fontSize: 17,
    }
    ,
    h1: {
        fontSize: 30,
        color: 'black',
    },
    s2: {
        display: 'flex',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        width: '80%',
        height: '65%',
        borderRadius: 30,
        padding: 20,
        marginBottom: 20,
        shadowColor: "black", 
        shadowOffset: {
            width: 10,
            height: 12,
          },
          shadowOpacity: 1,
          shadowRadius: 7,
          elevation: 8, 
    },
    formgroup: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        marginVertical: 10,
    },
    label: {
        fontSize: 17,
        color: '#000',
        marginLeft: 10,
        marginBottom: 5,
    },
    input: {
        backgroundColor: "#FFB0CC",
        borderRadius: 20,
        padding: 10,
    },
    fp: {
        display: 'flex',
        alignItems: 'flex-end',
        marginHorizontal: 10,
        marginVertical: 5,
    },
    logo: {
        height: 80,
        resizeMode: 'contain',
    }
})