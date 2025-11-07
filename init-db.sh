#!/bin/bash

# Initialize the AgroXP database
echo "Initializing AgroXP database..."

# Create the database and user
sudo -u postgres psql << EOF
CREATE USER postgres WITH PASSWORD '123456';
CREATE DATABASE agroxp OWNER postgres;
EOF

echo "Database initialized successfully!"