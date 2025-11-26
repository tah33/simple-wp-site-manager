#!/bin/bash

# Configuration
LOG_FILE="/var/log/docker-monitor.log"
WINDOWS_HOST="192.168.0.103"
API_URL="http://${WINDOWS_HOST}:8000/api/site-status"
API_TOKEN="tanvir1239" #change according to your laravel e.nv API_TOKEN

log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
}

update_site_status_async() {
    local domain=$1
    local status=$2
    local container_name=$3

    # Run curl in background with timeout
    timeout 10 curl -s -X POST "$API_URL" \
        -H "Authorization: Bearer $API_TOKEN" \
        -H "Content-Type: application/json" \
        -H "Accept: application/json" \
        -d "{
            \"domain\": \"$domain\",
            \"status\": \"$status\",
            \"container_name\": \"$container_name\"
        }" > /dev/null 2>&1 &

    log_message "✓ Sent update for $domain ($status)"
}

log_message "=== Starting Docker container status check ==="

# Get containers
containers=$(docker ps -a --filter "name=wp_" --format "{{.Names}}|{{.Status}}" 2>/dev/null)

if [ -z "$containers" ]; then
    log_message "No WordPress containers found"
    exit 0
fi

container_count=$(echo "$containers" | wc -l)
log_message "Found $container_count containers"

# Update all containers in background
echo "$containers" | while IFS= read -r line; do
    container_name=$(echo $line | cut -d'|' -f1)
    status=$(echo $line | cut -d'|' -f2)

    domain=$(echo $container_name | sed 's/wp_//' | sed 's/_/:/g')

    if [[ $status == *"Up"* ]]; then
        site_status="running"
    elif [[ $status == *"Exited"* ]]; then
        site_status="stopped"
    else
        site_status="failed"
    fi

    update_site_status_async "$domain" "$site_status" "$container_name"
done

# Wait for all background processes to finish
wait
log_message "=== Status check completed ==="
