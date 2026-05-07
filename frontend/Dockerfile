FROM node:20-slim

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# In a monorepo, the lockfile is at the root. 
# For the dev container, we'll install based on package.json only
# to keep the context localized to the frontend folder.
COPY package.json ./
RUN pnpm install

# Copy application code
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start Vite dev server
CMD ["pnpm", "dev"]
