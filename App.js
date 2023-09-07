import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Button, View, Alert, Platform } from "react-native";
import * as Notification from "expo-notifications";

Notification.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowAlert: true,
    };
  },
});

//Para probar envío de push notifications... https://expo.dev/notifications


export default function App() {

  const [token, setToken] = useState();

  //push notification
  useEffect(() => {

    async function configurePushNotifications() {
      const { status } = await Notification.getPermissionsAsync();
      let finalStatus = status;
      if (finalStatus !== "granted") {
        const { status } = await Notification.requestPermissionsAsync();
        let finalStatus = status;
      }
      if (finalStatus !== "granted") {
        Alert.alert(
          "Permision requiered",
          "Push notifications need the appropiate permissions!"
        );
        return;
      }
      const pushtokenData = await Notification.getExpoPushTokenAsync();
      
      console.log(pushtokenData);
      setToken(pushtokenData);
      //Este pushTokenData es lo q tengo q guardar en mi database, y relacionarlo con el us...
      //así c/vez q quiero enviarle un push notification sé el id al cual enviarlo.


      if(Platform.OS === 'android'){
        Notification.setNotificationChannelAsync('default', {
          name: 'defualt',
          importance: Notification.AndroidImportance.DEFAULT,
        });
      }
    }
    configurePushNotifications();

  }, []);

  //local notification
  useEffect(() => {
    //m paermite notificar un listener para ejecutar cuando llegue la notificacion
    const subcription1 = Notification.addNotificationReceivedListener(
      (notification) => {
        console.log("notification:");
        console.log(notification);
        const userName = notification.request.content.data.userName;
        console.log("userName");
        console.log(userName);
      }
    );

    const subcription2 = Notification.addNotificationResponseReceivedListener(
      (response) => {
        console.log("response");
        console.log(response);
        const userName = response.notification.request.content.data.userName;
        console.log("userName");
        console.log(userName);
      }
    );

    return () => {
      subcription1.remove();
      subcription2.remove();
    };
  }, []);

  function scheduleNotificationHandler() {
    Notification.scheduleNotificationAsync({
      //https://docs.expo.dev/versions/latest/sdk/notifications/#notificationcontentinput
      content: {
        title: "The notification",
        body: "This is the body of this notification",
        data: { userName: "Tin" },
      },
      trigger: {
        //https://docs.expo.dev/versions/latest/sdk/notifications/#notificationtriggerinput
        seconds: 5,
      },
    });
  }


  
  function sendPushNotificationHandler(){
    //utilizo esta función para simluar el envio de push notification, 
    //algo q tranquilamente debería hace desde un backend
    //https://docs.expo.dev/push-notifications/sending-notifications/
    fetch('https://exp.host/--/api/v2/push/send',{
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        to: token,
        title: 'Test - send from a device!',
        body: 'This is a test!'
      })
    });

  }

  return (
    <View style={styles.container}>
      <Button
        title="Schedul notification"
        onPress={scheduleNotificationHandler}
      />
      <Button title='Send Push Notification' onPress={sendPushNotificationHandler}/>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

/*
When using Expo Go, you shouldn't need to ask for any permissions to send or show local notifications
 (or notifications in general).

This will change as you build your app for production though. Even when using Expo's managed workflow,
 you will then leave the Expo Go app (as a standalone app will be built by EAS - see section 14).

To ensure that notifications work correctly, you should therefore ask for permission. For Android,
no changes are required. For iOS, you can use the getPermissionsAsync() method (documentation)
provided by expo-notifications to get the current permission status.
You can use requestPermissionsAsync() (documentation link) to request permissions.

A full code example can be found here but I will also walk you through the entire permission setup
later in this section as well.
*/
