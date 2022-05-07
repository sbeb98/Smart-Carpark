#include <ESP8266WiFi.h>
#include <ArduinoMqttClient.h>

#define echoPin D6 // attach pin D1 Arduino to pin Echo of HC-SR04
#define trigPin D5 //attach pin D2 Arduino to pin Trig of HC-SR04

// defines variables
long duration; // variable for the duration of sound wave travel
int distance; // variable for the distance measurement

//set interval for sending messages (milliseconds)
  const long interval = 5000;

const char* ssid     = "Sebs phone";// "Telstra8A0916-2";// The SSID (name) of the Wi-Fi network you want to connect to
const char* password = "dragonite";//"zmzueffzyj";//;//     // The password of the Wi-Fi network

WiFiClient wifiClient;
WiFiClient client;
int        port     = 1883;

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

}
void loop() {

   // Use WiFiClient class to create TCP connections
    const uint16_t port = 8888;          // port to use
    const char * host = "192.168.43.86"; // address of server
  
  //set interval for sending messages (milliseconds)
  const long interval = 30000;
  currentMillis = millis();
  
  //does nothing if interval time not reached
  if (currentMillis - previousMillis >= interval) {

       if (!client.connect(host, port)) {
          Serial.println("connection failed");
          Serial.println("wait 5 sec...");
          delay(5000);
       }
       else{
          Serial.println("Connection Successful!!! Finding Distance....");
          runLoop(); 
       }
  }
  
}

void runLoop(){

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
