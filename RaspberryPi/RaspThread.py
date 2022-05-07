import socket
import os
from thread import *
import paho.mqtt.client as mqtt
from random import randint

#intitalise mqtt flags
motorFlag = False
motorCommand = ""

#function declarations
def fillMessage(i, message):
    if i<10:
        spotName = "Park00" + str(i) + "-"
         
    else:
        spotName = "Park0" + str(i) + "-"
    
    message= message + spotName + str(randint(0,100)) + " "
    
    return message

def multi_threaded_client(connection):
        data = connection.recv(1024)
        data = str(data.decode('ASCII'))

        if data == 'Motor':
            global motorFlag
            if motorFlag :
                connection.sendall(motorCommand.encode('ASCII'))
                print('Sent ' + motorCommand + ' to motor Arduino')
                motorFlag =False

        else :
            message = "Park001-" + str(data) + " "
            i = 2
            while i<= 20:
                message= fillMessage(i, message)
                i+= 1
            #send message to server
            client.publish("SACapstone/ParkData", message)
            #connection.sendall(data.encode('ASCII'))
            print( "Just Published " + message + " to server")

        connection.close()

def on_message(client, userdata, message):

    #print data recieved
    data = str(message.payload.decode("ASCII"));    
    print("Message Recieved, Topic: " + message.topic)
    print("Message Recieved, Message: " + data)

    #re-send ack message back to server
    print("Sending Acknowledgement");
    client.publish("SACapstone/Booking/Ack", data + ' Ack')


    #set flag dependant on message
    global motorFlag, motorCommand
    motorFlag = True
    motorCommand = data; 


#initialise mqtt connection

mqttBroker = "test.mosquitto.org"

client = mqtt.Client()
client.on_message = on_message
client.connect(mqttBroker)
client.loop_start()
client.subscribe("SACapstone/Booking")

#initialise tcp server

ServerSideSocket = socket.socket()
host = ''
port = 8888
ThreadCount = 0

try:
    ServerSideSocket.bind((host, port))
except socket.error as e:
    print(str(e))

print('Socket is listening..')
ServerSideSocket.listen(10)



try:
    while True:
        Client, address = ServerSideSocket.accept()
        print('Connected to: ' + address[0] + ':' + str(address[1]))
        start_new_thread(multi_threaded_client, (Client, ))
        ThreadCount += 1
        print('Thread Number: ' + str(ThreadCount))
except KeyboardInterrupt:
    print("Caught keyboard interrupt, exiting")
finally:
    ServerSideSocket.close()
client.loop_stop