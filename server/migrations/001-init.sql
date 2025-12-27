CREATE TABLE users (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL,
  email TEXT UNIQUE,
  password TEXT,
  created_at DATE DEFAULT CURRENT_TIMESTAMP,
  last_logout_at DATE
);

CREATE TABLE deleted_users (
  id TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT,
  password TEXT,
  created_at DATE
  last_logout_at DATE,
  deleted_at DATE DEFAULT CURRENT_TIMESTAMP
);
