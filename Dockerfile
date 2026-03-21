# Izmanto Node.js
FROM node:18

# Izveido darba mapi
WORKDIR /app

# Nokopē package.json
COPY package.json ./

# Instalē pakas
RUN npm install

# Nokopē visus pārējos failus
COPY . .

# Atver portu
EXPOSE 3000

# Startē serveri
CMD ["npm", "start"]