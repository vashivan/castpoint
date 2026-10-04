-- password_reset_tokens now serves artists (profiles) and employers (employers).
-- Existing tokens all belong to artists, hence the default.

ALTER TABLE password_reset_tokens
  ADD COLUMN user_type ENUM('artist', 'employer') NOT NULL DEFAULT 'artist' AFTER user_id,
  ADD INDEX idx_prt_user (user_id, user_type);
