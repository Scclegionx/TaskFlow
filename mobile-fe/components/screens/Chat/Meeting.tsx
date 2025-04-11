// import React, { useEffect, useState } from "react";
// import { StyleSheet, View, Alert } from "react-native";
// import { WebView } from "react-native-webview";
// import { Camera } from "expo-camera";
// import { Audio } from "expo-av";

// const MeetingScreen = () => {
//   const [permissionsGranted, setPermissionsGranted] = useState(false);
//   const meetingUrl = `https://meet.google.com/puh-fwvf-rbw`;

//   const requestPermissions = async () => {
//     const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
//     const { status: micStatus } = await Audio.requestPermissionsAsync();

//     if (cameraStatus === "granted" && micStatus === "granted") {
//       setPermissionsGranted(true);
//       Alert.alert("Quyền truy cập camera và micro đã được cấp.");
//     } else {
//       Alert.alert("Quyền bị từ chối", "Ứng dụng cần quyền camera và micro để hoạt động.");
//     }
//   };

//   useEffect(() => {
//     requestPermissions();
//   }, []);

//   if (!permissionsGranted) {Alert.alert("Đang yêu cầu quyền truy cập camera và micro...")
//     return (
//       <View style={styles.container}>
        
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <WebView
//         source={{ uri: meetingUrl }}
//         style={styles.webview}
//         startInLoadingState={true}
//         javaScriptEnabled={true}
//         domStorageEnabled={true}
//         mediaPlaybackRequiresUserAction={false}
//         allowsInlineMediaPlayback={true}
//         onError={(e) => console.error("WebView error: ", e.nativeEvent)}
//         onHttpError={(e) => console.error("HTTP error: ", e.nativeEvent)}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//   },
//   webview: {
//     flex: 1,
//   },
// });

// export default MeetingScreen;
import React from 'react';
import { View, Button, StyleSheet, Linking, Alert } from 'react-native';

const MeetingScreen = () => {
  const meetingUrl = 'https://meet.jit.si/room-7f34aef9-3eec-4b24-9aee-65fddb49adf6';

  const openMeeting = async () => {
    const supported = await Linking.canOpenURL(meetingUrl);
    if (supported) {
      await Linking.openURL(meetingUrl);
    } else {
      Alert.alert("Không thể mở cuộc họp", "Thiết bị không hỗ trợ mở URL này.");
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Tham gia cuộc họp Jitsi" onPress={openMeeting} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default MeetingScreen;
