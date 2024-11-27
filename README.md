# Lit SeedSaver

SeedSaver by [Lit](https://litprotocol.com) helps you securely store photos of your cryptocurrency seed phrases.

## Installation

1. Install Expo Go from the app store on your device: https://expo.dev/go
2. Go to this link and scan this QR code: https://expo.dev/preview/update?message=cleanup%20of%20layout&updateRuntimeVersion=1.0.0&createdAt=2024-11-27T04%3A52%3A52.481Z&slug=exp&projectId=f9849ac7-b8a8-4c28-bec9-e40e18a13e31&group=52fb4f86-d9f9-4af3-b6e9-011349bf0139

## Why

Hardware wallets are the most secure way to store crypto, but you have this weird 24 word seed phrase that's hard to store and hard to backup. You shouldn't ever put your seed phrase into a computer, but also, keeping it safe in your house is hard and dangerous. SeedSaver is a way to securely store your an encrypted photo of your seed phrase in a photo that you can put anywhere. The output is a simple HTML file that you can open in any browser which works entirely offline.

One neat trick for opening it securely is to boot your Mac into Recovery Mode and use the built in Safari browser to open the HTML file. This environment should be free of any malware.

Note: If you forget the password you set, your data is lost forever. There is no recovery mechanism.

## How it Works

1. Take a photo of your seed phrase using the camera
2. Enter a strong password when prompted
3. SeedSaver encrypts your photo using that password
4. Save the generated HTML file anywhere you like

To view your seed phrase later, just open the HTML file in any browser and enter your password.

## Security

- Your photo is encrypted locally on your device
- The password never leaves your device
- The HTML file contains only encrypted data
- Decryption happens in your browser when you enter the password
- No data is ever sent to any servers
- Fully open source, tiny source code, easy to build and publish on your own using Expo Go
- Uses https://github.com/Hinaser/jscrypto/tree/master fully inlined and bundled, so no dependencies on browser APIs that could change

## Best Practices

- Use a strong, unique password
- Store the HTML file in multiple secure locations
- Keep your password safe but separate from the HTML file
- Do not forget or lose the password! You will be unable to recover your seed phrase.
- Test decryption after saving to ensure everything works

## Publishing

To publish an update, run `eas update` and go to the expo url printed in the terminal. Click on "preview" and put the preview URL at the top of this README.

To publish your own version of SeedSaver, clone this repo and follow the instructions on the Expo website: https://docs.expo.dev/
