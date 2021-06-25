#!/bin/bash
set -e

echo "Temperature Seed Input"
echo "======================"

read -p "Enter the desired temperature: " desiredTemp
read -p "Enter the allowed error margin: " allowedTempError
read -p "Enter the allowed difference in temperature that triggers an alarm: " anomalousTempDelta

tempPayload=$(echo "{\"desiredTemperature\": $desiredTemp, \"allowedError\": $allowedTempError, \"anomalousDelta\": $anomalousTempDelta }" | base64)

aws iotevents-data batch-put-message --messages messageId=00001,inputName=temp_seed_input,payload="$tempPayload" >> /dev/null

echo "Temperature seed input set! Detector model is set up."
echo

echo "Humidity Seed Input"
echo "======================"

read -p "Enter the desired humidity: " desiredHumid
read -p "Enter the allowed error margin: " allowedHumidError
read -p "Enter the allowed difference in humidity that triggers an alarm: " anomalousHumidDelta

humidPayload=$(echo "{\"desiredHumidity\": $desiredHumid, \"allowedError\": $allowedHumidError, \"anomalousDelta\": $anomalousHumidDelta }" | base64)

aws iotevents-data batch-put-message --messages messageId=00001,inputName=humidity_seed_input,payload="$humidPayload" >> /dev/null

echo "Humidity seed input set! Detector model is set up."
