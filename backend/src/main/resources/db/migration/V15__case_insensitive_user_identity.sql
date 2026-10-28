CREATE UNIQUE INDEX uk_users_username_lower ON users (LOWER(username));
CREATE UNIQUE INDEX uk_users_email_lower ON users (LOWER(email));
