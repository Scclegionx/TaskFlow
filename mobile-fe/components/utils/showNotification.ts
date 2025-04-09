import Toast from "react-native-toast-message";

export const showNotificationOnUI = (notification: any) => {
    Toast.show({
        type: "info",
        text1: notification.title,
        text2: notification.message,
        position: "top",
        visibilityTime: 4000,
    });
};
