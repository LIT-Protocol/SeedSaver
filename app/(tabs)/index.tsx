import {
  Image,
  StyleSheet,
  Platform,
  TouchableOpacity,
  View,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Linking,
  SafeAreaView,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useState, useRef } from "react";
import { AES, Word32Array, PBKDF2, Hex, Utf8 } from "jscrypto";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Asset } from "expo-asset";
import { readAsStringAsync } from "expo-file-system";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

// Utility functions for crypto operations
function deriveKey(password: string, salt: Word32Array): Word32Array {
  return PBKDF2.getKey(password, salt, {
    keySize: 256 / 32, // 256 bits
    iterations: 100000,
  });
}

function encryptData(data: string, key: Word32Array): string {
  const encrypted = AES.encrypt(data, key);

  return encrypted.toString();
}

async function readHtmlTemplateFile(): Promise<string> {
  const [{ localUri }] = await Asset.loadAsync(
    require("../../assets/template.html")
  );

  console.log("localUri:", localUri);

  if (localUri) {
    return await readAsStringAsync(localUri);
  }

  throw new Error("Failed to load HTML template file");
}

async function generateHtmlFile(encryptedData: string, salt: Word32Array) {
  try {
    // Read the template file
    const template = await readHtmlTemplateFile();

    // Replace placeholders with actual data
    const html = template
      .replace("ENCRYPTED_DATA_PLACEHOLDER", encryptedData)
      .replace("SALT_PLACEHOLDER", salt.toString(Hex));

    // Save to a temporary file
    const tempFile = `${
      FileSystem.cacheDirectory
    }encrypted-image-${Date.now()}.html`;
    await FileSystem.writeAsStringAsync(tempFile, html);

    return tempFile;
  } catch (error) {
    console.error("Error generating HTML:", error);
    throw error;
  }
}

export default function HomeScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isEncrypting, setIsEncrypting] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const takePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ base64: true });
      setPhoto(photo!.uri);
      setPhotoBase64(photo!.base64 || null);
    }
  };

  const encryptAndSave = async () => {
    if (!photoBase64) {
      Alert.alert("Error", "No photo data available");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords don't match");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setIsEncrypting(true);

    // Add a small delay to allow React to re-render
    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      // Generate salt and derive key
      const salt = Word32Array.random(128 / 8);
      const key = deriveKey(password, salt);

      // Encrypt the image data
      const encrypted = encryptData(photoBase64, key);

      // Generate and share the HTML file
      const htmlFile = await generateHtmlFile(encrypted, salt);

      // Share the file
      await Sharing.shareAsync(htmlFile, {
        mimeType: "text/html",
        UTI: `encrypted-image-${new Date()
          .toISOString()
          .slice(0, 19)
          .replace(/[T:]/g, "-")}.html`,
      });

      // Clean up
      setPhoto(null);
      setPhotoBase64(null);
      setPassword("");
      setConfirmPassword("");
      setIsEncrypting(false);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to encrypt image");
      setIsEncrypting(false);
    }
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>We need your permission to show the camera</ThemedText>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <ThemedText>Grant Permission</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
        <ThemedView style={styles.header}>
          <TouchableOpacity
            onPress={() => Linking.openURL("https://litprotocol.com")}
            style={styles.logoContainer}
          >
            <Image
              source={require("../../assets/images/lit.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL("https://github.com/lit-protocol/seedsaver")
            }
            style={styles.sourceLink}
          >
            <ThemedText>Source Code</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={styles.cameraContainer}>
          {photo ? (
            <View style={styles.preview}>
              <Image source={{ uri: photo }} style={styles.previewImage} />
              <View style={styles.passwordContainer}>
                <ThemedText type="subtitle">Set Encryption Password</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="Enter password"
                  placeholderTextColor="#666"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm password"
                  placeholderTextColor="#666"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.encryptButton}
                  onPress={encryptAndSave}
                  disabled={isEncrypting}
                >
                  {isEncrypting ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator color="white" />
                      <ThemedText style={styles.loadingText}>
                        Please wait, encrypting...
                      </ThemedText>
                    </View>
                  ) : (
                    <ThemedText>Encrypt & Save</ThemedText>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.retakeButton}
                  onPress={() => {
                    setPhoto(null);
                    setPassword("");
                    setConfirmPassword("");
                  }}
                >
                  <ThemedText>Retake</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.cameraWrapper}>
              <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing={"back"}
              />
              <TouchableOpacity
                style={styles.shutterButton}
                onPress={takePhoto}
              >
                <View style={styles.shutterButtonInner} />
              </TouchableOpacity>
            </View>
          )}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraContainer: {
    flex: 1,
    minHeight: 600, // Provide a minimum height to ensure camera isn't too small
    marginVertical: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  cameraWrapper: {
    flex: 1,
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  shutterButton: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  shutterButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#000",
  },
  preview: {
    flex: 1,
    position: "relative",
  },
  previewImage: {
    flex: 1,
  },
  retakeButton: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 12,
    borderRadius: 8,
  },
  button: {
    backgroundColor: "#2196F3",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  passwordContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
    gap: 10,
  },
  input: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    color: "black",
  },
  encryptButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  retakeButton: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  loadingText: {
    color: "white",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  logoContainer: {
    flex: 1,
  },
  logo: {
    width: 80,
    height: 30,
  },
  sourceLink: {
    padding: 8,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#fff", // or whatever your background color should be
  },
});
