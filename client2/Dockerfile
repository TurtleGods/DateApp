# ==============================
# Stage 1: Build Angular app
# ==============================
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the Angular app (you can also specify your environment)
RUN npm run build -- --configuration development

# ==============================
# Stage 2: Serve app with Nginx
# ==============================
FROM nginx:alpine

# Copy built files to Nginx web directory
COPY --from=build /Users/strollist/Documents/WebApp/DatingApp/API/wwwroot /usr/share/nginx/html

# Optional: Replace default Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
