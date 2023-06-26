sudo docker stop authserver;
sudo docker rm authserver;
sudo docker stop serverurl;
sudo docker rm serverurl;
sudo docker stop apiserver;
sudo docker rm apiserver;
sudo docker stop appserver;
sudo docker rm appserver;

git pull;

sudo cd auth-server;
sudo docker build -t auth .;
sudo docker run -p 4001:4001 -network Snapynetwork -name authserver -tld auth;

sudo cd ../server;
sudo docker build -t server .;
sudo docker run -network Snapynetwork -name serverurl -tld server;

sudo cd ../api;
sudo docker build -t api .;
sudo docker run -network Snapynetwork -name apiserver -tld api;

sudo cd ../app;
sudo docker build -t app .;
sudo docker run -p 8080:8080 -network Snapynetwork -name appserver -tld app;