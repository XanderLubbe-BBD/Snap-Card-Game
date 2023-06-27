sudo docker stop authserver;
sudo docker rm authserver;
sudo docker stop serverurl;
sudo docker rm serverurl;
sudo docker stop apiserver;
sudo docker rm apiserver;
sudo docker stop appserver;
sudo docker rm appserver;

git pull;

cd auth-server;

sudo docker build -t auth .;
sudo docker run -d -p 4001:4001 --network Snapynetwork --name authserver --restart unless-stopped -tld auth;

cd ../server;

sudo docker build -t server .;
sudo docker run -d -p 8081:8081 --network Snapynetwork --name serverurl --restart unless-stopped -tld server;

cd ../api;

sudo docker build -t api .;
sudo docker run -d --network Snapynetwork --name apiserver --restart unless-stopped -tld api;

cd ../app;

sudo docker build -t app .;
sudo docker run -d -p 8080:8080 --network Snapynetwork --name appserver --restart unless-stopped -tld app;
