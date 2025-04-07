import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { WebView } from "react-native-webview";
import {Video} from "expo-av";

const Attachment = ({ attachmentUrl, attachmentType, style}) => {
  // Trích xuất tên file từ URL
  const fileName = attachmentUrl.split("/").pop(); // Lấy phần cuối cùng của URL
  const fileExtension = fileName.split(".").pop(); // Lấy đuôi mở rộng

  // Rút gọn tên file nếu quá dài (giữ lại phần đuôi)
  const shortenFileName = (name, maxLength = 20) => {
    if (name.length <= maxLength) return name;
    const splitName = name.split(".");
    const extension = splitName.pop(); // Lấy phần mở rộng
    const baseName = splitName.join("."); // Phần tên file trước đuôi mở rộng
    return `${baseName.substring(0, 10)}...${baseName.slice(-5)}.${extension}`;
  };

  const displayedFileName = shortenFileName(fileName);

  const renderAttachment = () => {
    switch (attachmentType) {
      case "image":
        return <Image source={{ uri: attachmentUrl }} style={styles.attachmentImage} />;
      case "video":
        return (
          <Video
          source={{ uri: attachmentUrl }}
          style={styles.attachmentVideo}
          useNativeControls
          resizeMode="contain"
          isLooping
        />
        );
      case "pdf":
        return (
          <TouchableOpacity onPress={() => openPdf()}>
            <Text style={styles.pdfLink}>📄 {displayedFileName}</Text>
          </TouchableOpacity>
        );
      case "raw":
        return (
          <TouchableOpacity onPress={() => handleDownload()}>
            <Text style={styles.rawFileLink}>📂 {displayedFileName}</Text>
          </TouchableOpacity>
        );
      default:
        return <Text>❌ File không hợp lệ</Text>;
    }
  };

  // Mở PDF trong WebView
  const openPdf = () => {
    console.log(`Mở PDF: ${attachmentUrl}`);
    // Điều hướng tới màn hình hiển thị PDF nếu có
  };

  // Tải file raw
  const handleDownload = () => {
    console.log(`Tải xuống: ${attachmentUrl}`);
    // Ở React Native, cần sử dụng `expo-file-system` để tải file
  };

  return (
    <View style={styles.attachmentContainer,style}>
      <Text style={styles.fileName}>📎 {displayedFileName}</Text>
      {renderAttachment()}
    </View>
  );
};

const styles = StyleSheet.create({
  attachmentContainer: {
    marginVertical: 10,
    
  },
  fileName: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  attachmentImage: {
    width: 300, // Chiều rộng cố định
    height: 200, // Chiều cao cố định
    borderRadius: 10,
    backgroundColor: "lightgray", // Màu nền để tránh khoảng trống
    resizeMode: "contain", // Đảm bảo ảnh hiển thị đầy đủ trong khung
  },
  attachmentVideo: {
    width: 300, // Chiều rộng cố định
    height: 200, // Chiều cao cố định
    borderRadius: 10,
    backgroundColor: "black", // Màu nền để tránh khoảng trống
  },
  pdfLink: {
    color: "blue",
    textDecorationLine: "underline",
  },
  rawFileLink: {
    color: "green",
    textDecorationLine: "underline",
  },
});

export default Attachment;
