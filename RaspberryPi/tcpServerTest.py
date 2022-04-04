import socket
import sys
import paho.mqtt.client as mqtt
from random import randint

#function declarations
def fillMessage(i, message):
    if i<10:
        spotName = "Park00" + str(i) + "-"
         
    else:
        spotName = "Park0" + str(i) + "-"
    
    message= message + spotName + str(randint(0,100)) + " "
    
    return message

#initialise mqtt connection

mqttBroker = "test.mosquitto.org"

client = mqtt.Client()
client.connect(mqttBroker)


 
HOST = "" # Symbolic name, meaning all availableinterfaces
PORT = 8888 # Arbitrary non-privileged port
 
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
print ('Socket created')
 
#Bind socket to local host and port
try:
    s.bind((HOST, PORT))
except socket.error as msg:
    print ('Bind failed. Message : ' + str(msg))
    sys.exit()
 
print ('Socket bind complete')
 
#Start listening on socket
s.listen(10)
print ('Socket now listening')
 
#now keep talking with the client
while True:
    #wait to accept a connection - blocking call
    conn, addr = s.accept()
    data = conn.recv(1024)
    print ('Connected with ' + addr[0] + ':' + str(addr[1]) + " " )
    thevalue = int(data.decode("utf-8"))
    print ("Value: ", thevalue)

    #create 20 values to send over mqtt
    message = "Park001-" + str(thevalue) + " "
    i = 2
    while i<= 20:
        message= fillMessage(i, message)
        i+= 1
    #send message to server
    client.publish("starto/attempt", message)
    print( "Just Published " + message + " to server") 
 
s.close()
