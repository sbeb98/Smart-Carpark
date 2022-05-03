
#include <ESP8266WiFi.h>

String serialData = "";
bool ledFlag= true;

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
  Serial.println("Ultrasonic Sensor HC-SR04 Transmit via MQTT"); // print some text in Serial Monitor
  Serial.println("with ESP8266");  

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

void loop(void)
{
	while (Serial.available())
	{
		char x = Serial.read();
		if (x == '\r')
			continue;
		serialData += x;
	}

 if(ledFlag){
  Serial.print("[LEDOFF]");
  ledFlag= false;
 }
  
 else{
  Serial.print("[LEDON]");
  ledFlag= true; 
 }
 
    

 

   const uint16_t port = 8888;          // port to use
    const char * host = "192.168.43.48"; // address of server
    String msg ="";

    // Use WiFiClient class to create TCP connections
   WiFiClient client;

    if (!client.connect(host, port)) {
        Serial.println("connection failed");
        Serial.println("wait 5 sec...");
        delay(5000);
        return;
    }

    client.print("Motor");
    Serial.print("Sent : ");
    Serial.println("Motor");

    delay(500);
    
    Serial.println("Response: ");
    while (client.available()){
     char _byte=char(client.read());
     msg += _byte;
    } 

    Serial.println(msg);   
    Serial.println();
}
