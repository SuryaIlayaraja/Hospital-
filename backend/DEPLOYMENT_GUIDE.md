# Local MongoDB Deployment Guide

This guide will help you set up MongoDB locally on your server for production deployment.

## Prerequisites

- Server with Linux/Windows/macOS operating system
- Root/sudo access to the server
- Node.js installed on the server

## Step 1: Install MongoDB

### For Ubuntu/Debian Linux:

```bash
# Import MongoDB GPG key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update package list
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod

# Enable MongoDB to start on boot
sudo systemctl enable mongod

# Verify MongoDB is running
sudo systemctl status mongod
```

### For CentOS/RHEL Linux:

```bash
# Create MongoDB repository file
sudo vi /etc/yum.repos.d/mongodb-org-7.0.repo

# Add the following content:
[mongodb-org-7.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/$releasever/mongodb-org/7.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-7.0.asc

# Install MongoDB
sudo yum install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify MongoDB is running
sudo systemctl status mongod
```

### For Windows Server:

1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Run the installer
3. Choose "Complete" installation
4. Install as a Windows Service (recommended)
5. Install MongoDB Compass (optional GUI tool)

### For macOS:

```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community@7.0

# Start MongoDB service
brew services start mongodb-community@7.0
```

## Step 2: Configure MongoDB for Production

### Secure MongoDB (Important!)

1. **Enable Authentication**:

Edit MongoDB configuration file:
- Linux: `/etc/mongod.conf`
- Windows: `C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg`

```yaml
security:
  authorization: enabled
```

2. **Create Admin User**:

```bash
# Connect to MongoDB
mongosh

# Switch to admin database
use admin

# Create admin user
db.createUser({
  user: "admin",
  pwd: "YOUR_STRONG_PASSWORD_HERE",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" }, "readWriteAnyDatabase" ]
})

# Create database user for hospital-feedback
use hospital-feedback

db.createUser({
  user: "hospital-admin",
  pwd: "YOUR_DATABASE_PASSWORD_HERE",
  roles: [ { role: "readWrite", db: "hospital-feedback" } ]
})
```

3. **Update Connection String**:

Update your `.env` file:
```env
MONGODB_URI=mongodb://hospital-admin:YOUR_DATABASE_PASSWORD_HERE@localhost:27017/hospital-feedback?authSource=hospital-feedback
```

## Step 3: Configure Firewall

Only allow MongoDB access from your application server:

```bash
# For Ubuntu/Debian (UFW)
sudo ufw allow from YOUR_SERVER_IP to any port 27017

# For CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-rich-rule="rule family='ipv4' source address='YOUR_SERVER_IP' port port='27017' protocol='tcp' accept"
sudo firewall-cmd --reload
```

**Important**: If MongoDB and your Node.js app are on the same server, you don't need to open port 27017 to external traffic. Only localhost access is needed.

## Step 4: Set Up Automatic Backups

### Create Backup Script (Linux):

```bash
# Create backup directory
sudo mkdir -p /var/backups/mongodb
sudo chown mongodb:mongodb /var/backups/mongodb

# Create backup script
sudo nano /usr/local/bin/mongodb-backup.sh
```

Add this content:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="hospital-feedback"
DB_USER="hospital-admin"
DB_PASS="YOUR_DATABASE_PASSWORD_HERE"

# Create backup
mongodump --uri="mongodb://${DB_USER}:${DB_PASS}@localhost:27017/${DB_NAME}?authSource=${DB_NAME}" --out="${BACKUP_DIR}/${DATE}"

# Compress backup
tar -czf "${BACKUP_DIR}/${DATE}.tar.gz" -C "${BACKUP_DIR}" "${DATE}"
rm -rf "${BACKUP_DIR}/${DATE}"

# Delete backups older than 30 days
find ${BACKUP_DIR} -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: ${BACKUP_DIR}/${DATE}.tar.gz"
```

Make it executable:
```bash
sudo chmod +x /usr/local/bin/mongodb-backup.sh
```

### Schedule Daily Backups (cron):

```bash
# Edit crontab
sudo crontab -e

# Add this line for daily backup at 2 AM
0 2 * * * /usr/local/bin/mongodb-backup.sh >> /var/log/mongodb-backup.log 2>&1
```

## Step 5: Configure Your Application

### Update .env file for production:

```env
# MongoDB Configuration (Local)
MONGODB_URI=mongodb://hospital-admin:YOUR_DATABASE_PASSWORD_HERE@localhost:27017/hospital-feedback?authSource=hospital-feedback

# Server Configuration
PORT=5000
NODE_ENV=production

# CORS Configuration (Update with your frontend domain)
FRONTEND_URL=https://yourdomain.com
```

### Update backend/server.js if needed:

The server.js already handles MongoDB connection correctly. Make sure your `.env` file has the correct `MONGODB_URI`.

## Step 6: Set Up Process Manager (PM2)

Install PM2 to keep your Node.js application running:

```bash
# Install PM2 globally
sudo npm install -g pm2

# Navigate to backend directory
cd backend

# Start application with PM2
pm2 start server.js --name "hospital-feedback-api"

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup
# Follow the instructions shown by the command above
```

## Step 7: Verify Everything Works

1. **Check MongoDB is running**:
```bash
sudo systemctl status mongod
```

2. **Check if database was created**:
```bash
mongosh -u hospital-admin -p YOUR_DATABASE_PASSWORD_HERE --authenticationDatabase hospital-feedback

use hospital-feedback
show collections
```

3. **Test your API**:
```bash
curl http://localhost:5000/api/health
```

4. **Check PM2 status**:
```bash
pm2 status
pm2 logs hospital-feedback-api
```

## Step 8: Security Checklist

- [ ] MongoDB authentication is enabled
- [ ] Strong passwords are set for all users
- [ ] MongoDB port (27017) is not exposed to the internet (if app is on same server)
- [ ] Firewall rules are configured
- [ ] Regular backups are scheduled
- [ ] MongoDB is updated to the latest stable version
- [ ] Application runs as a non-root user (if possible)
- [ ] SSL/TLS is configured for frontend
- [ ] Environment variables are secured (not committed to git)

## Step 9: Monitoring

### Monitor MongoDB:

```bash
# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Check disk space (MongoDB needs space for data)
df -h

# Check MongoDB status
mongosh --eval "db.serverStatus()"
```

### Monitor Application:

```bash
# PM2 monitoring
pm2 monit

# Check logs
pm2 logs hospital-feedback-api
```

## Troubleshooting

### MongoDB won't start:

```bash
# Check logs
sudo tail -n 50 /var/log/mongodb/mongod.log

# Check if port is already in use
sudo netstat -tulpn | grep 27017

# Check MongoDB config
sudo mongod --config /etc/mongod.conf --fork
```

### Connection refused:

1. Ensure MongoDB service is running: `sudo systemctl status mongod`
2. Check if MongoDB is listening: `sudo netstat -tulpn | grep 27017`
3. Verify connection string in `.env` file
4. Check authentication credentials

### Permission denied:

```bash
# Fix MongoDB data directory permissions (Linux)
sudo chown -R mongodb:mongodb /var/lib/mongodb
sudo chmod -R 755 /var/lib/mongodb
```

## Data Persistence

Once MongoDB is set up and running:
- ✅ All feedback data will be stored permanently
- ✅ All ticket data will be stored permanently
- ✅ Data persists across server restarts
- ✅ Data is shared across all users
- ✅ Data remains until manually deleted or database is cleared

## Next Steps

1. Deploy your frontend application
2. Update `FRONTEND_URL` in `.env` with your frontend domain
3. Test the complete flow: submit feedback → check admin panel
4. Set up monitoring alerts
5. Schedule regular database maintenance

## Support

For MongoDB-specific issues:
- MongoDB Documentation: https://docs.mongodb.com/
- MongoDB Community: https://community.mongodb.com/





