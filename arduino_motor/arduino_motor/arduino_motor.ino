#include <ESP8266WiFi.h>


const char* ssid     = "Sebs phone";//"Telstra8A0916-2"; // The SSID (name) of the Wi-Fi network you want to connect to
const char* password = "dragonite";//"zmzueffzyj";//     // The password of the Wi-Fi network

WiFiClient wifiClient;



void setup()
{
  Serial.begin(115200);         // Start the Serial communication to send messages to the computer
  delay(10);
  Serial.println('\n');
  while(!Serial){};     //wait until serial connection
  
  
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

  pinMode(LED_BUILTIN, OUTPUT);

}

void loop() {
    const uint16_t port = 8888;          // port to use
    const char * host = "192.168.43.86"; // address of server
    String msg;

    // Use WiFiClient class to create TCP connections
    WiFiClient client;

    if (!client.connect(host, port)) {
        Serial.println("connection failed");
        Serial.println("wait 5 sec...");
        delay(5000);
        return;
    }

    char command = client.read();

    if (command){
      Serial.println("Command: " + command)
      digitalWrite(LED_BUILTIN, HIGH);   // turn the LED on (HIGH is the voltage level)
    }
    
  

  delay(1000)
  digitalWrite(LED_BUILTIN, LOW);    // turn the LED off by making the voltage LOW
}
