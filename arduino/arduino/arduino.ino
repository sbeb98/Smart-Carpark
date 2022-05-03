#include <ESP8266WiFi.h>
#include <ArduinoMqttClient.h>

#define echoPin D6 // attach pin D1 Arduino to pin Echo of HC-SR04
#define trigPin D5 //attach pin D2 Arduino to pin Trig of HC-SR04

// defines variables
long duration; // variable for the duration of sound wave travel
int distance; // variable for the distance measurement

const char* ssid     = "Sebs phone";// "Telstra8A0916-2";// The SSID (name) of the Wi-Fi network you want to connect to
const char* password = "dragonite";//"zmzueffzyj";//;//     // The password of the Wi-Fi network

WiFiClient wifiClient;
WiFiClient client;
MqttClient mqttClient(wifiClient);

const char broker[] = "test.mosquitto.org";
int        port     = 1883;
const char topic[]  = "SACapstone/Booking";

 unsigned long currentMillis = 0;
 unsigned long previousMillis = 0;
/*
const char topic2[]  = "real_unique_topic_2";
const char topic3[]  = "real_unique_topic_3";
*/

void setup()
{
  Serial.begin(115200);         // Start the Serial communication to send messages to the computer
  delay(10);
  Serial.println('\n');
  while(!Serial){};     //wait until serial connection
  
  pinMode(trigPin, OUTPUT); // Sets the trigPin as an OUTPUT
  pinMode(echoPin, INPUT); // Sets the echoPin as an INPUT
  Serial.begin(115200); // // Serial Communication is starting with 9600 of baudrate speed
  //Serial.println("Ultrasonic Sensor HC-SR04 Transmit via MQTT"); // print some text in Serial Monitor
  //Serial.println("with ESP8266");  

  WiFi.begin(ssid, password);             // Connect to the network
  Serial.print("Connecting to ");
  Serial.print(ssid); Serial.println(" ...");

  int i = 0;
  while (WiFi.status() != WL_CONNECTED) { // Wait for the Wi-Fi to connect
    delay(1000);
    Serial.print(++i); Serial.print(' ');
  }
  
  Serial.println('\n');
  Serial.println("Connection established!");  
  Serial.print("IP address:\t");
  Serial.println(WiFi.localIP());         // Send the IP address of the ESP8266 to the computer

   Serial.print("Attempting to connect to the MQTT broker: ");
   Serial.println(broker);

  if (!mqttClient.connect(broker, port)) {
    Serial.print("MQTT connection failed! Error code = ");
    Serial.println(mqttClient.connectError());

    while (1);
  }  

  Serial.println("You're connected to the MQTT broker!");
  Serial.println();
}
void loop() {

   // Use WiFiClient class to create TCP connections
    const uint16_t port = 8888;          // port to use
    const char * host = "192.168.43.86"; // address of server

 
  // call poll() regularly to allow the library to send MQTT keep alive which
  // avoids being disconnected by the broker
  mqttClient.poll();
  
  //set interval for sending messages (milliseconds)
  const long interval = 5000;
  currentMillis = millis();
  
  //does nothing if interval time not reached
  if (currentMillis - previousMillis >= interval) {

       if (!client.connect(host, port)) {
        Serial.println("connection failed");
        Serial.println("wait 5 sec...");
        delay(5000);
    } 

    //Sends and Recieves Distance Data from sensor
    // Clears the trigPin condition
    digitalWrite(trigPin, LOW);
    delayMicroseconds(2);
    // Sets the trigPin HIGH (ACTIVE) for 10 microseconds
    digitalWrite(trigPin, HIGH);
    delayMicroseconds(10);
    digitalWrite(trigPin, LOW);
    // Reads the echoPin, returns the sound wave travel time in microseconds
    duration = pulseIn(echoPin, HIGH);
    // Calculating the distance
    distance = duration * 0.034 / 2; // Speed of sound wave divided by 2 (go and back)

  
    Serial.print("Sending message to topic: ");
    Serial.println(topic);
    Serial.print("Raise");
    Serial.println( " cm");


/*
    Serial.print("Sending message to topic: ");
    Serial.println(topic2);
    Serial.println(Rvalue2);

    Serial.print("Sending message to topic: ");
    Serial.println(topic2);
    Serial.println(Rvalue3);

    */

    // send message, the Print interface can be used to set the message contents
    mqttClient.beginMessage(topic);
    mqttClient.print("Raise");
    mqttClient.endMessage();

    /*

    mqttClient.beginMessage(topic2);
    mqttClient.print(Rvalue2);
    mqttClient.endMessage();

    mqttClient.beginMessage(topic3);
    mqttClient.print(Rvalue3);
    mqttClient.endMessage();

    */

    client.print(distance);
    Serial.print("Sent : ");
    Serial.println(distance);

    delay(500);
    Serial.println("Response: ");
    while (client.available()){
      Serial.print(char(client.read()));
      
    } 

    //client.print("");
    //client.stop();
     
      
    Serial.println();
    // save the last time a message was sent
    previousMillis = currentMillis;
  }
  
}
