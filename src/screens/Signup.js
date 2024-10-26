import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import bg from "../../assets/Background1.png";
// import logo from '../../assets/mainlogo.png'
import { button1 } from "../common/button";
import {
  errormessage,
  formgroup,
  head1,
  head2,
  input,
  input1,
  label,
  link,
  link2,
} from "../common/formcss";
import AgePicker from "./AgePicker";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Signup = ({ navigation }) => {
  const [selectGender, setSelectGender] = useState();
  const [file, setFile] = useState(null);
  const [error, setError] = useState();
  const [uploadedHash, setUploadedHash] = useState([""]);
  const [isUploading, setIsUploading] = useState({
    cover: false,
    profile: false,
  });
  const [isUploaded, setIsUploaded] = useState({
    cover: false,
    profile: false,
  });

  const [fdata, setFdata] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    gender: "",
    bio: "",
    profileImage1: "",
    profileImage2: "",
  });

  useEffect(() => {
    if (uploadedHash.length === 2) {
      console.log("uploaded hasshes array are");
      setFdata((prevData) => ({
        ...prevData,
        profileImage1: `https://aquamarine-immense-unicorn-398.mypinata.cloud/ipfs/${uploadedHash[0]}`,
        profileImage2: `https://aquamarine-immense-unicorn-398.mypinata.cloud/ipfs/${uploadedHash[1]}`,
      }));
    }
  }, [uploadedHash]);
  const [errormsg, setErrormsg] = useState(null);

  // const pickImage = async (imageType) => {

  // const { status } = await ImagePicker.
  // requestMediaLibraryPermissionsAsync();

  // if (status !== "granted") {
  // Alert.alert(
  // "Permission Denied",
  // `Sorry, we need camera
  // roll permission to upload images.`
  // );
  // } else {
  // const result =
  // await ImagePicker.launchImageLibraryAsync();
  // console.log("hello");

  // if (!result.canceled) {
  // console.log("result ", result.assets[0].uri)
  // console.log("result.assets[0]", result.assets[0])
  // const fileUri = result.assets[0];
  // try {
  // const uploadedHashes = await uploadToPinata(fileUri);
  // console.log('Uploaded IPFS Hashes:', uploadedHashes);
  // if (imageType === 'cover') {
  // setFdata(prevData => ({
  // ...prevData,
  // profileImage1: `https://aquamarine-immense-unicorn-398.mypinata.cloud/ipfs/${uploadedHashes}`
  // }));
  // } else if (imageType === 'profile') {
  // setFdata(prevData => ({
  // ...prevData,
  // profileImage2: `https://aquamarine-immense-unicorn-398.mypinata.cloud/ipfs/${uploadedHashes}`
  // }));
  // }
  // } catch (error) {
  // alert('Error uploading images. Please try again.');
  // console.log(error);
  // }

  // setError(null);
  // }
  // }
  // };
  const pickImage = async (imageType) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Sorry, we need camera roll permission to upload images."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync();

    if (!result.canceled) {
      const fileUri = result.assets[0];
      setIsUploading((prevState) => ({ ...prevState, [imageType]: true }));

      try {
        const uploadedHash = await uploadToPinata(fileUri);
        if (imageType === "cover") {
          setFdata((prevData) => ({
            ...prevData,
            profileImage1: `https://aquamarine-immense-unicorn-398.mypinata.cloud/ipfs/${uploadedHash}`,
          }));
        } else if (imageType === "profile") {
          setFdata((prevData) => ({
            ...prevData,
            profileImage2: `https://aquamarine-immense-unicorn-398.mypinata.cloud/ipfs/${uploadedHash}`,
          }));
        }
        setIsUploaded((prevState) => ({ ...prevState, [imageType]: true }));
      } catch (error) {
        alert("Error uploading images. Please try again.");
        console.log(error);
      } finally {
        setIsUploading((prevState) => ({ ...prevState, [imageType]: false }));
      }
    }
  };
  const uploadToPinata = async (fileUri) => {
    const pinataApiKey = "f6331fbb7aa149475ff3";
    const pinataSecretKey =
      "ad957485ff439f7eafea6678595944edd323548b45e9b3b76bf7dbf2ac5bc0b7";

    const response = await fetch(fileUri.uri);
    const blob = await response.blob();

    const formData = new FormData();
    formData.append("file", {
      uri: fileUri.uri,
      name: fileUri.fileName || `image_${Date.now()}.jpg`,
      type: fileUri.mimeType || "image/jpeg",
    });
    console.log("formdata in up is ", formData);

    try {
      console.log("FormData is", formData);
      const pinataResponse = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          maxBodyLength: Infinity,
          headers: {
            "Content-Type": "multipart/form-data",
            pinata_api_key: pinataApiKey,
            pinata_secret_api_key: pinataSecretKey,
          },
        }
      );

      const ipfsHash = pinataResponse.data.IpfsHash;
      console.log("IPFS hash is", ipfsHash);
      return ipfsHash;
    } catch (error) {
      console.error("Error uploading to Pinata:", error);
      throw error;
    }
  };

  const Sendtobackend = async () => {
    try {
      const response = await fetch("https://lol-2eal.onrender.com/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fdata),
      });

      const data = await response.json();

      console.log(data);

      if (data.error === "Invalid Credentials") {
        setErrormsg("Invalid Credentials");
      } else if (data.message === "Email Already Exists") {
        alert(data.message);
        navigation.navigate("Login", { userdata: data.user });
      } else if (data.message === "User Registered Succesfully") {
        await AsyncStorage.setItem("user", JSON.stringify(data.user));

        alert(data.message);
        navigation.navigate("Login", { userdata: data.user });
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setErrormsg("Failed to register. Please try again later.");
    }
  };

  const handleAgeChange = (selectedAge) => {
    console.log("selected age is ", selectedAge);
    setFdata({ ...fdata, age: selectedAge }); 
  };

  return (
    <View style={styles.container}>
      <Image style={styles.patternbg} source={bg} />

      <View style={styles.container1}>
        <View style={styles.s1}></View>
        <ScrollView style={styles.s2}>
          <Text style={head1}>Create a New Account</Text>
          <Text style={link2}>
            Already Registered?&nbsp;
            <Text style={link} onPress={() => navigation.navigate("Login")}>
              Login here
            </Text>
          </Text>
          {errormsg ? <Text style={errormessage}>{errormsg}</Text> : null}
          <View style={styles.form}>
            <View style={formgroup}>
              <Text style={label}>Name</Text>
              <TextInput
                style={input}
                placeholder="Enter your Name"
                onPressIn={() => setErrormsg(null)}
                onChangeText={(text) => setFdata({ ...fdata, name: text })}
              />
            </View>
            <View style={formgroup}>
              <Text style={label}>Email</Text>
              <TextInput
                style={input}
                placeholder="Enter your Email"
                onPressIn={() => setErrormsg(null)}
                onChangeText={(email) => setFdata({ ...fdata, email: email })}
              />
            </View>
            <View style={formgroup}>
              <Text style={label}>Password</Text>
              <TextInput
                style={input}
                placeholder="Enter your Password"
                onPressIn={() => setErrormsg(null)}
                secureTextEntry={true}
                onChangeText={(text) => setFdata({ ...fdata, password: text })}
              />
            </View>

            <View style={formgroup}>
              <Text style={label}>Confirm Password</Text>
              <TextInput
                style={input}
                placeholder="Confirm your Password"
                onPressIn={() => setErrormsg(null)}
                secureTextEntry={true}
                onChangeText={(text) =>
                  setFdata({ ...fdata, confirmPassword: text })
                }
              />
            </View>
            <View style={formgroup}>
              <Text style={label}>Age</Text>

              <AgePicker onAgeChange={handleAgeChange} />
            </View>

            <View style={formgroup}>
              <Text style={label}>Gender</Text>
              <View style={styles.input}>
                <Picker
                  selectedValue={selectGender}
                  style={styles.input}
                  onValueChange={(itemValue, itemIndex) =>
                    setFdata((prevData) => ({
                      ...prevData,
                      gender: itemValue,
                    }))
                  }
                >
                  <Picker.Item label="Male" value="Male" />
                  <Picker.Item label="Female" value="Female" />
                </Picker>
              </View>
            </View>

            <View style={formgroup}>
              <Text style={label}>Bio</Text>
              <TextInput
                style={input1}
                placeholder="Enter your Address"
                onPressIn={() => setErrormsg(null)}
                onChangeText={(text) => setFdata({ ...fdata, bio: text })}
              />
            </View>
            <View style={formgroup}>
              <Text style={label}>Cover Image</Text>
              <TouchableOpacity
                style={{ ...styles.button, ...styles.input }}
                onPress={() => pickImage("cover")}
                disabled={isUploaded.cover}
              >
                <Text style={styles.buttonText}>
                  {isUploading.cover
                    ? "Uploading..."
                    : isUploaded.cover
                    ? "Uploaded"
                    : "Choose Image"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={formgroup}>
              <Text style={label}>Profile Image</Text>
              <TouchableOpacity
                style={{ ...styles.button, ...styles.input }}
                onPress={() => pickImage("profile")}
                disabled={isUploaded.profile}
              >
                <Text style={styles.buttonText}>
                  {isUploading.profile
                    ? "Uploading..."
                    : isUploaded.profile
                    ? "Uploaded"
                    : "Choose Image"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => {
              Sendtobackend();
            }}
          >
            <Text style={button1}>Signup</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
};

export default Signup;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    display: "flex",
  },
  patternbg: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  container1: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "90%",
    width: "100%",
  },
  s1: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "10%",
  },
  small1: {
    color: "#fff",
    fontSize: 17,
  },
  h1: {
    fontSize: 30,
    color: "#fff",
  },
  s2: {
    display: "flex",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    width: "80%",
    height: "65%",
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
    display: "flex",
    flexDirection: "column",
    width: "100%",
    marginVertical: 10,
  },
  label: {
    fontSize: 17,
    color: "#000",
    marginLeft: 10,
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#734A31",
    borderRadius: 30,
    padding: 10,
  },
  fp: {
    display: "flex",
    alignItems: "flex-end",
    marginHorizontal: 10,
    marginVertical: 5,
  },
});
