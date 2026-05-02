#!/usr/bin/env bash
set -euo pipefail

SDK_ROOT="${ANDROID_HOME:-/opt/android-sdk}"
BUILD_TOOLS="$SDK_ROOT/build-tools/35.0.1"
ANDROID_JAR="$SDK_ROOT/platforms/android-35/android.jar"
APP_DIR="$(cd "$(dirname "$0")" && pwd)"
BUILD_DIR="$APP_DIR/build/manual"
OUT_DIR="$APP_DIR/app/build/outputs/apk/debug"

rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/compiled" "$BUILD_DIR/generated" "$BUILD_DIR/classes" "$BUILD_DIR/dex" "$OUT_DIR"

"$BUILD_TOOLS/aapt2" compile --dir "$APP_DIR/app/src/main/res" -o "$BUILD_DIR/compiled/res.zip"

"$BUILD_TOOLS/aapt2" link \
  -o "$BUILD_DIR/hyperfocus-unsigned.apk" \
  -I "$ANDROID_JAR" \
  --manifest "$APP_DIR/app/src/main/AndroidManifest.xml" \
  --java "$BUILD_DIR/generated" \
  --min-sdk-version 23 \
  --target-sdk-version 35 \
  --version-code 1 \
  --version-name 1.0 \
  "$BUILD_DIR/compiled/res.zip"

javac \
  -source 8 \
  -target 8 \
  -classpath "$ANDROID_JAR" \
  -d "$BUILD_DIR/classes" \
  $(find "$APP_DIR/app/src/main/java" "$BUILD_DIR/generated" -name '*.java')

"$BUILD_TOOLS/d8" \
  --min-api 23 \
  --output "$BUILD_DIR/dex" \
  $(find "$BUILD_DIR/classes" -name '*.class')

(cd "$BUILD_DIR/dex" && zip -q -u "$BUILD_DIR/hyperfocus-unsigned.apk" classes.dex)

"$BUILD_TOOLS/zipalign" -p -f 4 "$BUILD_DIR/hyperfocus-unsigned.apk" "$BUILD_DIR/hyperfocus-aligned.apk"

keytool \
  -genkeypair \
  -keystore "$BUILD_DIR/debug.keystore" \
  -storepass android \
  -keypass android \
  -alias androiddebugkey \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -dname "CN=Android Debug,O=Android,C=US" \
  >/dev/null

"$BUILD_TOOLS/apksigner" sign \
  --ks "$BUILD_DIR/debug.keystore" \
  --ks-pass pass:android \
  --key-pass pass:android \
  --out "$OUT_DIR/hyperfocus-webview-debug.apk" \
  "$BUILD_DIR/hyperfocus-aligned.apk"

"$BUILD_TOOLS/apksigner" verify --verbose "$OUT_DIR/hyperfocus-webview-debug.apk"
