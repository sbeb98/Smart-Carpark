import socket
import sys
import paho.mqtt.client as mqtt
from random import randint
import selectors
import types


#function declarations
def fillMessage(i, message):
    if i<10:
        spotName = "Park00" + str(i) + "-"
         
    else:
        spotName = "Park0" + str(i) + "-"
    
    message= message + spotName + str(randint(0,100)) + " "
    
    return message

def on_message(client, userdata, message):

    #print data recieved
    data = str(message.payload.decode("utf-8"));    
    print("Message Recieved, Topic: " + message.topic)
    print("Message Recieved, Message: " + data)

    #send command to motor-arduino
    for key, mask in events:
        sock = key.fileobj
        sock.send(True)

def accept_wrapper(sock):
    conn, addr = sock.accept()  # Should be ready to read
    print(f"Accepted connection from {addr}")
    conn.setblocking(False)
    data = types.SimpleNamespace(addr=addr, message_tcp="")
    events = selectors.EVENT_READ | selectors.EVENT_WRITE
    sel.register(conn, events, data=data)


def service_connection(key, mask):
    sock = key.fileobj
    data = key.data
    if mask & selectors.EVENT_READ:
        recv_data = sock.recv(1024)  # Should be ready to read
        if recv_data:
            data.message_tcp += recv_data
        else:
            print(f"Closing connection to {data.addr}")
            sel.unregister(sock)
            sock.close()
    if mask & selectors.EVENT_WRITE:
        if : data.message_tcp
            #create 20 values to send over mqtt
            message = "Park001-" + str(data.message_tcp) + " "
            i = 2
            while i<= 20:
                message= fillMessage(i, message)
                i+= 1
            #send message to server
            client.publish("starto/attempt", message)
            print( "Just Published " + message + " to server") 
            

#initialise mqtt connection

mqttBroker = "test.mosquitto.org"

client = mqtt.Client()
client.on_message = on_message
client.connect(mqttBroker)
client.loop_start()


 
HOST = "" # Symbolic name, meaning all availableinterfaces
PORT = 8888 # Arbitrary non-privileged port

sel= selectors.DefaultSelector()
 
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
s.listen()
print ('Socket now listening')
s.setblocking(False)
sel.register(lsock, selectors.EVENT_READ, data=None)




try:
    while True:
        events = sel.select(timeout=None)
        for key, mask in events:
            if key.data is None:
                accept_wrapper(key.fileobj)
            else:
                service_connection(key, mask)
except KeyboardInterrupt:
    print("Caught keyboard interrupt, exiting")
finally:
    s.close()
client.loop_stop()
 

