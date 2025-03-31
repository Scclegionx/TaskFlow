import { useEffect } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const username = await AsyncStorage.getItem("username");
      const exp = await AsyncStorage.getItem("exp");
  
      if (!username || !exp) {
        router.replace("/welcome");  // Thay vì "/login"
        return;
      }
  
      if (parseInt(exp) * 1000 < Date.now()) {
        await AsyncStorage.removeItem("username");
        await AsyncStorage.removeItem("exp");
        router.replace("/welcome");  // Thay vì "/login"
        return;
      }
    };
  
    checkAuth();
  }, []);
  

  return null;
}
