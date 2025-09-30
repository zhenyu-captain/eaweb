# ea考试复习
1. 数据来源passkey
2. 自己写的网站，可以直接部署用
3. 增加登录页面，admin/bob...na

## 代码项目
./clean.sh
npm install
npm run build
mkdir -p dist/db
mkdir -p dist/server
cp db/all_questions.json dist/db/
cp server.js dist/server/
cp package.json dist/
rm -rf /var/www/gogoea.com/ #在部署服务器上面删除
scp -r dist/* root@74.48.192.43:/var/www/gogoea.com/ #并输入密码 81NP5fMUZy

## ubuntu 
cd /var/www/gogoea.com
npm install --omit=dev --verbose #安装依赖才能运行
node server/server.js
### 部署运行命令
nohup node server/server.js > /var/log/express.log 2>&1 &
disown #保持静默运行

# 一次性配置
## 服务器配置
sudo apt update
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
sudo systemctl status nginx

## 服务器https配置
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d gogoea.com -d www.gogoea.com
sudo certbot renew --dry-run

## 服务器nginx配置
sudo bash -c 'cat > /etc/nginx/conf.d/gogoea.conf << "EOF"
server {
    listen 80;
    server_name gogoea.com www.gogoea.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name gogoea.com www.gogoea.com;

    root /var/www/gogoea.com;
    index index.html;

    ssl_certificate /etc/letsencrypt/live/gogoea.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gogoea.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location = /index.html { }

    # API代理到Node.js后端
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 直接让 /db 下的请求走 root
    location /db/ {
        root /var/www/gogoea.com;
        default_type application/json;
        try_files $uri =404;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(?:ico|css|js|gif|jpe?g|png|woff2?|eot|ttf|svg)$ {
        expires 6M;
        access_log off;
        add_header Cache-Control "public";
    }
}
EOF'

## 重启nginx
sudo nginx -t
sudo systemctl restart nginx


## 备注
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm -v
nvm install 18.20.7
nvm use 18.20.7
nvm alias default 18.20.7
node -v
npm install -g serve
serve -v
nohup serve -s dist -l tcp://0.0.0.0:80 > serve.log 2>&1 &
disown