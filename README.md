# Installation

### 1. Clone this repository

    git clone git@github.com:kmigel/hosting-sifrovacek.git
    cd hosting-sifrovacek

### 2. Configure environment variable
Create a .env file inside backend/ directory:
```touch backend/.env```
 Create a secret passphrase for JWT_SECRET that will be used to hash passwords within the app. Past this into the file:
```
PORT=3001  
DB_HOST=db  
DB_PORT=5432  
DB_USER=sifrovacky_user  
DB_PASSWORD=admin  
DB_NAME=hosting_sifrovacek
JWT_SECRET=YOUR_SECRET_PASSPHRASE
```

### 3. Install Docker
Install Docker from https://docs.docker.com/engine/install/.
If you get permission error, run:
```sudo usermod -aG docker $USER```
Then log out and log back in.

### 4. Build and start the app
```sudo docker-compose up --build```

### 5. Open the app

 - Frontend: http://localhost:5173/
 - Backend: http://localhost:3001/

### 6. Initial login
 - Login: `admin`
 - Password: `admin`

### 7. Deleting all data (database reset)
```
sudo docker-compose down  
sudo docker volume rm hosting-sifrovacek_db_data
```