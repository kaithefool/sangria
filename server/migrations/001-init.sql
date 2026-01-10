CREATE TABLE users (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  active BOOLEAN DEFAULT TRUE,
  last_logout_at DATETIME,
  created_at DATETIME DEFAULT current_timestamp,
  updated_at DATETIME
);

CREATE TABLE deleted_users (
  id TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT,
  password TEXT,
  active BOOLEAN,
  last_logout_at DATETIME,
  created_at DATETIME
  updated_at DATETIME,
  deleted_at DATETIME DEFAULT current_timestamp
);
