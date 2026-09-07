//To start kafka
cd C:\kafka\kafka_2.12-3.9.1


bin\windows\zookeeper-server-start.bat config\zookeeper.properties

//Open new terminal

bin\windows\kafka-server-start.bat config\server.properties

jps