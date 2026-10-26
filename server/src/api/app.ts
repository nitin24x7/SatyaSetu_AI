import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import swaggerUi from 'swagger-ui-express';
import { createHandler } from 'graphql-http/lib/use/express';
import { fileURLToPath } from 'url';

import { applicationsRouter } from './routes/applications.router';
import { documentsRouter } from './routes/documents.router';
import { institutionsRouter } from './routes/institutions.router';
import { auditRouter } from './routes/audit.router';
import { reportsRouter } from './routes/reports.router';
import { healthRouter } from './routes/health.router';
import { idpRouter } from './routes/idp.router';
import { complianceRouter } from './routes/compliance.router';
import { graphqlSchema } from '../graphql/schema';
import { graphqlResolvers } from '../graphql/resolvers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

// Security & Parsing Middleware
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] }));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Request Tracing Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const reqId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  res.setHeader('X-Request-Id', reqId);
  res.setHeader('X-Platform', 'SatyaSetu-AI-Core-v1.0');
  next();
});

// Swagger UI - Interactive OpenAPI 3.1 Explorer at /api-docs
try {
  const openapiPath = path.resolve(__dirname, '../../docs/openapi.yaml');
  if (fs.existsSync(openapiPath)) {
    const file = fs.readFileSync(openapiPath, 'utf8');
    const swaggerDoc = YAML.parse(file);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
    app.get('/api-docs.json', (_req, res) => res.json(swaggerDoc));
  }
} catch (err) {
  console.warn('[Swagger UI Setup Warning]', err);
}

// GraphQL Gateway Endpoint at /graphql
app.all(
  '/graphql',
  createHandler({
    schema: graphqlSchema,
    rootValue: graphqlResolvers,
  })
);

// REST API Gateway Routes
app.use('/health', healthRouter);
app.use('/api/v1/applications', applicationsRouter);
app.use('/api/v1/documents', documentsRouter);
app.use('/api/v1/institutions', institutionsRouter);
app.use('/api/v1/audit-logs', auditRouter);
app.use('/api/v1/reports', reportsRouter);
app.use('/api/v1/idp', idpRouter);
app.use('/api/v1/compliance', complianceRouter);

// Root Gateway Info
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'SatyaSetu AI Core Microservices Gateway',
    version: '1.0.0-phase5',
    status: 'ACTIVE',
    endpoints: {
      health: '/health',
      swaggerUi: '/api-docs',
      graphql: '/graphql',
      applications: '/api/v1/applications',
      documents: '/api/v1/documents',
      institutions: '/api/v1/institutions',
      idp: '/api/v1/idp',
      compliance: '/api/v1/compliance',
      audit: '/api/v1/audit-logs',
      reports: '/api/v1/reports/analytics',
    },
    documentation: 'Refer to /api-docs for complete interactive OpenAPI 3.1 specification.',
  });
});

// RFC 7807 Global Error Handling Middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[API Gateway Error]', err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    type: 'https://satyasetu.gov.in/errors/' + (err.code || 'INTERNAL_ERROR'),
    title: err.name || 'Internal Error',
    status,
    detail: err.message || 'An unexpected error occurred during request execution.',
    timestamp: new Date().toISOString(),
  });
});

