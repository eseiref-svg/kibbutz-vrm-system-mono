-- Migration: Add branch_id to client table to track the creating branch
-- This allows knowing which branch "owns" or "brought" the client.

ALTER TABLE client
ADD COLUMN IF NOT EXISTS branch_id INTEGER REFERENCES branch(branch_id);

COMMENT ON COLUMN client.branch_id IS 'The ID of the branch that originally created/requested this client';
