#!/bin/bash

echo "Creating admin user in Docker container..."

if [ -z "$1" ]; then
    echo "Usage: $0 <email>"
    echo "Example: $0 admin@example.com"
    exit 1
fi

EMAIL=$1

echo "Creating admin user with email: $EMAIL"
docker exec -i supercontext-api bun run admin:create <<< "$EMAIL"

echo "Admin user creation completed!"
echo "Check the output above for the invite token."
echo "Use the token to complete registration at: http://localhost:3000/invite/<TOKEN>" 