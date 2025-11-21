LOG_FILE="/var/log/docker-monitor.log"
API_URL="https://your-app.com/api/site-status"  # Update with your app URL
API_TOKEN="your-api-token"  # Set this in your .env

log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
}

update_site_status() {
    local domain=$1
    local status=$2
    local container_name=$3

    curl -X POST $API_URL \
        -H "Authorization: Bearer $API_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"domain\": \"$domain\",
            \"status\": \"$status\",
            \"container_name\": \"$container_name\"
        }" >> $LOG_FILE 2>&1

    log_message "Updated $domain to status: $status"
}

# Get all WordPress containers
containers=$(docker ps -a --filter "name=wp_" --format "{{.Names}}|{{.Status}}" 2>/dev/null)

if [ -z "$containers" ]; then
    log_message "No WordPress containers found"
    exit 0
fi

echo "$containers" | while IFS= read -r line; do
    container_name=$(echo $line | cut -d'|' -f1)
    status=$(echo $line | cut -d'|' -f2)

    # Extract domain from container name (wp_domain_com)
    domain=$(echo $container_name | sed 's/wp_//' | sed 's/_/./g')

    # Determine status
    if [[ $status == *"Up"* ]]; then
        site_status="running"
    elif [[ $status == *"Exited"* ]]; then
        site_status="stopped"
    else
        site_status="failed"
    fi

    update_site_status "$domain" "$site_status" "$container_name"
done

log_message "Status check completed"
