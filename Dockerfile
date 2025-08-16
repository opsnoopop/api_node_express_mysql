# ใช้ Node.js base image
FROM node:24.3-alpine

# ตั้ง working directory
WORKDIR /app

# คัดลอก package.json และติดตั้ง dependencies
COPY package*.json ./
RUN npm install

# คัดลอกไฟล์โปรเจกต์
COPY . .

# เปิดพอร์ต 3000
EXPOSE 3000

# คำสั่งรันแอป
# npm start
CMD ["npm", "start"]
