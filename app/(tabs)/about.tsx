import { StyleSheet, TouchableOpacity, Linking } from "react-native";

import { Collapsible } from "@/components/Collapsible";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";

export default function AboutScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="lock.shield"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">About SeedSaver</ThemedText>
      </ThemedView>

      <ThemedText>
        SeedSaver helps you securely store photos of your cryptocurrency seed
        phrases.
      </ThemedText>

      <Collapsible title="How it works">
        <ThemedText>
          1. Take a photo of your seed phrase using the camera{"\n\n"}
          2. Enter a strong password when prompted{"\n\n"}
          3. SeedSaver encrypts your photo using that password{"\n\n"}
          4. Save the generated HTML file anywhere you like{"\n\n"}
          To view your seed phrase later, just open the HTML file in any browser
          and enter your password.
        </ThemedText>
      </Collapsible>

      <Collapsible title="Security">
        <ThemedText>
          • Your photo is encrypted locally on your device{"\n\n"}• The password
          never leaves your device{"\n\n"}• The HTML file contains only
          encrypted data{"\n\n"}• Decryption happens in your browser when you
          enter the password{"\n\n"}• No data is ever sent to any servers
        </ThemedText>
      </Collapsible>

      <Collapsible title="Best Practices">
        <ThemedText>
          • Use a strong, unique password{"\n\n"}• Store the HTML file in
          multiple secure locations{"\n\n"}• Keep your password safe but
          separate from the HTML file{"\n\n"}• Do not forget or lose the
          password! You will be unable to recover your seed phrase.{"\n\n"}•
          Test decryption after saving to ensure everything works
        </ThemedText>
      </Collapsible>

      <ThemedView style={styles.linksContainer}>
        <TouchableOpacity
          onPress={() => Linking.openURL("https://litprotocol.com")}
        >
          <ThemedText style={styles.link}>Lit Protocol →</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            Linking.openURL("https://github.com/lit-protocol/seedsaver")
          }
        >
          <ThemedText style={styles.link}>Source Code →</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
  linksContainer: {
    marginTop: 32,
    gap: 16,
    paddingBottom: 32,
  },
  link: {
    color: "#2196F3",
    fontSize: 16,
  },
});
