# Slippy
---
slippy is cloud-based performance testing tools.

## Feature
---
 * Marketplace for testing applications
 * Highly flexible testing script
 
 
## Development
---
### Creating docker networks
For deployment, `dev-net` docker network is needed.

``` shell
docker network create --subnet=172.30.100.0/24 dev-net
```

### Creating VPN docker and connection

  * openvpn setting
  
  ``` shell
  mkdir ~/docker
  cd ~/docker
  mkidr -p vpn/etc
  export OVPN_DATA=$(pwd)/vpn/etc
  docker run -v $OVPN_DATA:/etc/openvpn --log-driver=none --rm kylemanna/openvpn ovpn_genconfig -u udp://localhost
  docker run -v $OVPN_DATA:/etc/openvpn --log-driver=none --rm -it kylemanna/openvpn ovpn_initpki
  docker run -v $OVPN_DATA:/etc/openvpn -d -p 1194:1194/udp --cap-add=NET_ADMIN --network dev-net kylemanna/openvpn
  docker run -v $OVPN_DATA:/etc/openvpn --log-driver=none --rm -it kylemanna/openvpn easyrsa build-client-full CLIENTNAME nopass
  docker run -v $OVPN_DATA:/etc/openvpn --log-driver=none --rm kylemanna/openvpn ovpn_getclient CLIENTNAME > CLIENTNAME.ovpn
  ```
  
  * Adding route in ovpn
    * Open `CLIENTNAME.ovpn` with editor and remove a last line, which redirect gateway.
    * Add below route code
  
  ``` shell
  route 172.30.100.0 255.255.255.0
  ```
  
  * Connecting VPN

### Running slippy
`make run` executes `slippy-service` and `slippy-platform` in background rather than dockers.

And it monitors changing source codes and reflecs it at runtime applications.

In order to connect to CouchDb, three environment variables are needed.

| variables | description |
| --------- | ----------- |
| DB_HOST   | hostname |
| DB_USER | username for CouchDB |
| DB_PASSWORD | password for the user |
| KAFKA_HOST | host or ip for kafka endpoint |

``` shell
make dockers
KAFKA_HOST=172.30.100.108 DB_HOST=http://172.30.100.109 DB_USER=admin DB_PASSWORD=admin make net
KAFKA_HOST=172.30.100.108 DB_HOST=http://172.30.100.109 DB_USER=admin DB_PASSWORD=admin make run ## locally run nodes
```

### Testing Kafka
---
  
  * Consumer
  
  ``` shell
  kafkacat -C -b $KAFKA_HOST:9092 -t t1 -o 0
  ```
  
    * Producer
  
  ``` shell
  kafkacat -P -b $KAFKA_HOST:9092 -t t1
  ```

  
### Stopping slippy

``` shell
make stop
```
