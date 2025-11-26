#!/bin/bash

# WordPress Site Deployer - Server Setup Script
# This script prepares a fresh Ubuntu server for WordPress deployments

echo "🚀 Starting server setup for WordPress Site Deployer..."

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Add user to docker group
echo "👤 Adding current user to docker group..."
usermod -aG docker $USER

# Configure firewall
echo "🔥 Configuring firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Create deployment directory
echo "📁 Creating deployment directory..."
mkdir -p /opt/wordpress
mkdir -p /opt/docker-monitor
chmod 755 /opt/wordpress
chmod 755 /opt/docker-monitor

echo "📊 Creating Docker monitor script..."
cat > /opt/docker-monitor/monitor.sh << 'EOF'

echo "✅ Server setup completed!"
echo "⚠️  Please log out and log back in for group changes to take effect."
echo "📋 Next steps:"
echo "   1. Log out and log back in"
echo "   2. Verify installation: docker --version"
echo "   3. Add this server to your WordPress Site Deployer dashboard"
