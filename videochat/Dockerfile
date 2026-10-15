# La Ruleta Caliente: imagen de la web
FROM node:22-bookworm-slim

ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY . .
# Carpeta de datos (base de datos y copias), propiedad del usuario sin privilegios
RUN mkdir -p /app/data && chown -R node:node /app/data
USER node

ENV PORT=3000
EXPOSE 3000
VOLUME ["/app/data"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD node -e "fetch('http://localhost:3000/api/config').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "--disable-warning=ExperimentalWarning", "server.js"]
