### To start kafka

### Open new terminal
```bash
cd C:\kafka\kafka_2.12-3.9.1
```

### First start the zookeeper
```bash
bin\windows\zookeeper-server-start.bat config\zookeeper.properties

```

### Open new terminal

### Then start kafka

```bash
bin\windows\kafka-server-start.bat config\server.properties
```


jps