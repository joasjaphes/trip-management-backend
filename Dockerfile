# Step 1: Use a lightweight Node.js image
FROM node:22.17.0 AS builder

# Step 2: Set working directory inside the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install -f

# Step 5: Copy the application code
COPY . .

# Step 6: Build the application
RUN npm run build

# Step 7: Use a smaller image for the final build
FROM node:22.17.0

# Step 8: Set working directory for the runtime container
WORKDIR /app

# Step 9: Copy only necessary files from the builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
# COPY --from=builder /app/browser ./browser

RUN npm install --production -f
RUN npm install typeorm --save-dev -f
RUN apt-get update
RUN apt-get install -y chromium fonts-freefont-ttf
RUN rm -rf /var/lib/apt/lists/*

# Step 10: Expose the app's port
EXPOSE 3000

# Step 11: Define the default command to run the app
# CMD ["sh", "-c", "npm run migration:run-prod && node dist/src/main"]
CMD ["node", "dist/main"]

