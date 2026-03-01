-- Enable pgvector for future semantic search on reflections
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;

-- Enable uuid-ossp for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
