#include <ESP8266WiFi.h>
#include <ArduinoMqttClient.h>

#define echoPin D6 // attach pin D1 Arduino to pin Echo of HC-SR04
#define trigPin D5 //attach pin D2 Arduino to pin Trig of HC-SR04

#define raisePin D7
#define lowerPin D8

// defines variables
long duration; // variable for the duration of sound wave travel
int distance; // variable for the distance measurement

//set interval for sending messages (milliseconds)
  const long intervalDistance = 5000;
  const long intervalMotor = 1000;

const char* ssid     = "Sebs phone";// "Telstra8A0916-2";// The SSID (name) of the Wi-Fi network you want to connect to
const char* password = "dragonite";//"zmzueffzyj";//;//     // The password of the Wi-Fi network

WiFiClient wifiClient;
WiFiClient client;
int        port     = 1883;

 unsigned long currentMillisDistance = 0;
 unsigned long previousMillisDistance = 0;

 unsigned long currentMillisMotor = 0;
 unsigned long previousMillisMotor = 0;
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

  pinMode(raisePin, OUTPUT);
  pinMode(lowerPin, OUTPUT);

  digitalWrite(raisePin, HIGH);
  digitalWrite(lowerPin, HIGH);
  
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
  currentMillisDistance = millis();
  currentMillisMotor = millis();
  
  //does nothing if interval time not reached
  if (currentMillisDistance - previousMillisDistance >= intervalDistance) {

       if (!client.connect(host, port)) {
          Serial.println("connection failed");
       }
       else{
          Serial.println("Connection Successful!!! Finding Distance....");
          runLoop(); 
       }
  }

  //does nothing if interval time not reached
  if (currentMillisMotor - previousMillisMotor >= intervalMotor) {
    
     if (!client.connect(host, port)) {
        Serial.println("connection failed");
     }
     else{
        Serial.println("Connection Successful!!! Polling Command....");
        client.print("Motor");
        delay(500);
        checkForCommand();
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


    // save the last time a message was sent
    previousMillisDistance = currentMillisDistance;
    } 
    

void checkForCommand(){

  String msg ="";

  while (client.available()){
     char _byte=char(client.read());
     msg += _byte;
    } 
  if (msg != ""){
   Serial.println("Command Recieved: " + msg);
      if(msg == "Raise"){ 
        digitalWrite(raisePin, LOW);
        delay(1000);
        digitalWrite(raisePin, HIGH);  
      }
      else if (msg == "Lower"){
        
        digitalWrite(lowerPin, LOW);
        delay(1000);
        digitalWrite(lowerPin, HIGH);
        
      }
  } 

  // save the last time a message was sent
    previousMillisMotor = currentMillisMotor;
  
}
