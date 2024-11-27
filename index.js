import * as Crypto from "expo-crypto";
// @ts-ignore
window.crypto = { getRandomValues: Crypto.getRandomValues };
import "expo-router/entry";
