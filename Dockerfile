# ============================================
# Stage 1: Build the React frontend
# ============================================
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

# Install dependencies first (cache layer)
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci --silent

# Copy frontend source
COPY frontend/ ./

# Rewrite paths for root-level deployment (no /skull-monitoring/ prefix)
RUN sed -i "s|base: '/skull-monitoring/'|base: '/'|" vite.config.js && \
    sed -i "s|/skull-monitoring/api|/api|g" src/api.js && \
    sed -i "s|/skull-monitoring/login|/login|g" src/api.js && \
    sed -i 's|basename="/skull-monitoring"|basename="/"|' src/main.jsx && \
    sed -i "s|/openschool/uploads/|/uploads/|g" src/pages/StudentDetail.jsx && \
    sed -i "s|/openschool/uploads/|/uploads/|g" src/pages/PublicProfile.jsx && \
    sed -i "s|/openschool/s/|/s/|g" src/pages/StudentDetail.jsx

# Build production assets
RUN npm run build


# ============================================
# Stage 2: PHP + Apache production image
# ============================================
FROM php:8.3-apache

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_mysql

# Enable Apache modules
RUN a2enmod rewrite headers

# Copy Apache virtual host config
COPY docker/apache.conf /etc/apache2/sites-available/000-default.conf

# Set working directory
WORKDIR /var/www/html

# Copy application code
COPY api/ ./api/
COPY database/ ./database/
COPY uploads/ ./uploads/

# Copy root .htaccess (Docker version for root-level serving)
COPY docker/.htaccess ./.htaccess

# Copy security .htaccess for uploads
COPY uploads/.htaccess ./uploads/.htaccess

# Copy built frontend from stage 1
COPY --from=frontend-build /app/public/ ./public/

# Copy entrypoint script
COPY docker/entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Create upload directories and set permissions
RUN mkdir -p uploads/photos uploads/slips && \
    chown -R www-data:www-data uploads/ && \
    chmod -R 775 uploads/

# Remove default database config (entrypoint generates it from env vars)
RUN rm -f api/config/database.php

EXPOSE 80

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["apache2-foreground"]
