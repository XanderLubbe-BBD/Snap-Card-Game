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
npm install;
sudo docker build -t auth .;
sudo docker run -d -p 4001:4001 --network Snapynetwork --name authserver -tld auth;

cd ../server;
npm install;
sudo docker build -t server .;
sudo docker run -d -p 8081:8081 --network Snapynetwork --name serverurl -tld server;

cd ../api;
npm install;
sudo docker build -t api .;
sudo docker run -d --network Snapynetwork --name apiserver -tld api;

cd ../app;
npm install;
sudo docker build -t app .;
sudo docker run -d -p 8080:8080 --network Snapynetwork --name appserver -tld app;
