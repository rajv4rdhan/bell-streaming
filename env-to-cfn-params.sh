#!/bin/bash
# filepath: ./env-to-cfn-params.sh

# Remove old params.txt if exists
rm -f params.txt

while IFS='=' read -r key value
do
  # Skip empty lines and comments
  [[ -z "$key" || "$key" =~ ^# ]] && continue
  # Trim whitespace
  key=$(echo "$key" | xargs)
  value=$(echo "$value" | xargs)
  # Output in CloudFormation parameter format, always wrap value in double quotes
  echo "ParameterKey=$key,ParameterValue=\"$value\"" >> params.txt
done < .env

echo "params.txt generated."
