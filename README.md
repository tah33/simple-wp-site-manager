# WordPress Site Deployer

A Laravel application to deploy WordPress sites on remote servers using Docker.
****
**N.B** In this project we're using laragon for local desktop and WSL for VPS/remote server

## Pre-requisites
- PHP 8.2 or higher
- MySQL 5.7 or higher (preferable)
- Composer 2.4 or higher
- Node (latest version preferable)
- AS we're using Laravel 12 - Follow this doc to ensure proper installation https://laravel.com/docs/12.x/installation
- WAMP stack (Laragon is highly preferable as we're using this in our system)
- Docker and WSL - Follow the official Docker installation guide (Desktop App Preferable) https://docs.docker.com/desktop/setup/install/windows-install/

## Verify Installation
- verify installation of laravel with 
```bash
  laravel -v
```
or if you don't have laravel installer, you can check with by runnign this command in your project
```bash
  cat composer.json | grep laravel/framework
```
- verify installation of docker
```bash
    docker --version
    docker-compose --version
```
- installation of WSL 
```bash
    wsl --status
```
**N.B:** After installation of WSL make sure you've enable virtualization on Boot Mode according ot your BIOS Setting and also teh corresponding setting according to docker tutorial


## Installation

### Step 1: Clone and Setup
```bash
  git clone https://github.com/tah33/simple-wp-site-manager.git
```
```bash
    cd simple-wp-site-manager
    composer install
    npm install
    cp .env.example .env
    php artisan key:generate
```

### Step 2: Configure the environment
make the below changes in .env file

- `APP_URL=http://192.168.0.103:8000` (we'll describe below how/why we use this ip address)
- `API_TOKEN="tanvir1239"` (it can be anything you want but need to same as our script that we'll add later in this doc)
- `DB_HOST=127.0.0.1`
- `DB_PORT=3306`
- `DB_DATABASE=wp_site_manager`
- `DB_USERNAME=root`
- `DB_PASSWORD=`

Modify according to your credentials.

### Step 3: Configure Remote Server (WSL in our case)
We provide an automated setup script for remote servers. Please use this one to execute on your server. File : `scripts/setup-server.sh`

### Step 4: Run the application  
After configuring the environment, run the below commands
```bash
  php artisan migrate
```
```bash
  npm run dev
```
```bash
  php artisan serve --host=192.168.0.103 --port=8000
```
the hosted IP is your computer IPv4. You can get this by 
```bash
  ipconfig
```
after run this command, you'll find a IPv4 address. You need to use this one to start the laravel app and also set the APP_URL in `.env` file.
We need this one because we need to an url that can be accessible from WSL. Because if we run our laravel project on localhost then WSL can not reach because that ime 
localhost will be referred to the WSL localhost.

### Step 5: Access and Configure 
- Open your browser and go to http://192.168.0.103:8000

- Complete the initial setup:

   1. Add your first server with SSH credentials

   2. Configure deployment settings

- Start deploying WordPress sites
- For creating sites you'll be asked for IP.
- Run this command to get your ip
```bash
  ip addr show eth0
```
after running this command you'll find the `inet something` that will be your IP for WSL. Which you need to put during creation of sites.


### Step 6: Monitor the status of docker container
1. We provide an automated script file called `scripts/docker-monitor.sh`, please copy this file content to `/opt/docker-monitor/monitor.sh` 
2. Now we'll add a crontab so that it'll update our status every 5minutes
3. run this command in WSL 
```bash
  crontab -e
```
4. Now add this command in the bottom of teh file
```bash
  */5 * * * * /opt/docker-monitor/monitor.sh
```
5. After that run this command to make sure that your command is been register in crontab
```bash
  crontab -l
```
6. Now first add a site in the application and make sure in the docker creates the container or not. You'll get the full log with the details in our application.
7. Now run this command to check weather our api and bash for updating the status is working or not
```bash
   /opt/docker-monitor/monitor.sh
```
8. Now you can see the log in `/var/log/docker-monitor.log`, for checking either our bash is working or not.
9. We can also check our `laravel.log` file if our api is accepting the request or not

### Step 7: Video Guide (Optional)
For a visual walkthrough, please watch the below tutorial
https://www.awesomescreenshot.com/video/46839160?key=b549c7db69876a26699b9722b80ea023
