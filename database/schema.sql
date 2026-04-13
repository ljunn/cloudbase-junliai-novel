CREATE TABLE IF NOT EXISTS junli_novel_profiles (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  _openid VARCHAR(64) DEFAULT '' NOT NULL,
  auth_uid VARCHAR(96) NOT NULL,
  display_name VARCHAR(120) NOT NULL,
  email VARCHAR(190) DEFAULT '' NOT NULL,
  phone VARCHAR(40) DEFAULT '' NOT NULL,
  avatar_url VARCHAR(255) DEFAULT '' NOT NULL,
  plan_name VARCHAR(40) DEFAULT '创作体验版' NOT NULL,
  coin_balance INT DEFAULT 1200 NOT NULL,
  preferred_model VARCHAR(80) DEFAULT 'hunyuan-2.0-instruct-20251111' NOT NULL,
  default_voice VARCHAR(160) DEFAULT '' NOT NULL,
  preferences_json LONGTEXT NOT NULL,
  usage_summary VARCHAR(255) DEFAULT '' NOT NULL,
  is_admin TINYINT(1) DEFAULT 0 NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  UNIQUE KEY uniq_novel_profile_auth_uid (auth_uid)
);

CREATE TABLE IF NOT EXISTS junli_novel_projects (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  _openid VARCHAR(64) DEFAULT '' NOT NULL,
  auth_uid VARCHAR(96) NOT NULL,
  external_id VARCHAR(120) DEFAULT '' NOT NULL,
  title VARCHAR(160) NOT NULL,
  premise TEXT NOT NULL,
  genre VARCHAR(80) DEFAULT '' NOT NULL,
  tags_json LONGTEXT NOT NULL,
  style VARCHAR(80) DEFAULT '' NOT NULL,
  target_words INT DEFAULT 0 NOT NULL,
  narrative_perspective VARCHAR(80) DEFAULT '' NOT NULL,
  status VARCHAR(32) DEFAULT 'draft' NOT NULL,
  total_words INT DEFAULT 0 NOT NULL,
  chapter_count INT DEFAULT 0 NOT NULL,
  volume_count INT DEFAULT 0 NOT NULL,
  last_edited_chapter_title VARCHAR(160) DEFAULT '' NOT NULL,
  next_action_label VARCHAR(120) DEFAULT '' NOT NULL,
  progress_label VARCHAR(120) DEFAULT '' NOT NULL,
  consistency_warnings INT DEFAULT 0 NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  archived_at DATETIME NULL,
  deleted_at DATETIME NULL,
  KEY idx_novel_projects_auth_uid (auth_uid),
  KEY idx_novel_projects_status (status)
);

CREATE TABLE IF NOT EXISTS junli_novel_documents (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  _openid VARCHAR(64) DEFAULT '' NOT NULL,
  auth_uid VARCHAR(96) NOT NULL,
  project_id BIGINT NULL,
  document_type VARCHAR(40) NOT NULL,
  title VARCHAR(160) DEFAULT '' NOT NULL,
  category VARCHAR(80) DEFAULT '' NOT NULL,
  status_label VARCHAR(80) DEFAULT '' NOT NULL,
  tone_label VARCHAR(80) DEFAULT '' NOT NULL,
  is_system TINYINT(1) DEFAULT 0 NOT NULL,
  auto_reference TINYINT(1) DEFAULT 1 NOT NULL,
  sort_index INT DEFAULT 0 NOT NULL,
  payload_json LONGTEXT NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,
  KEY idx_novel_documents_auth_uid (auth_uid),
  KEY idx_novel_documents_project_id (project_id),
  KEY idx_novel_documents_type (document_type)
);

CREATE TABLE IF NOT EXISTS junli_novel_volumes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  _openid VARCHAR(64) DEFAULT '' NOT NULL,
  auth_uid VARCHAR(96) NOT NULL,
  project_id BIGINT NOT NULL,
  title VARCHAR(160) NOT NULL,
  summary TEXT NOT NULL,
  target_words INT DEFAULT 0 NOT NULL,
  chapter_range VARCHAR(120) DEFAULT '' NOT NULL,
  main_objective TEXT NOT NULL,
  sort_index INT DEFAULT 0 NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,
  KEY idx_novel_volumes_auth_uid (auth_uid),
  KEY idx_novel_volumes_project_id (project_id)
);

CREATE TABLE IF NOT EXISTS junli_novel_chapters (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  _openid VARCHAR(64) DEFAULT '' NOT NULL,
  auth_uid VARCHAR(96) NOT NULL,
  project_id BIGINT NOT NULL,
  volume_id BIGINT NULL,
  outline_node_id BIGINT NULL,
  title VARCHAR(160) NOT NULL,
  summary TEXT NOT NULL,
  content LONGTEXT NOT NULL,
  status VARCHAR(32) DEFAULT 'draft' NOT NULL,
  sort_index INT DEFAULT 0 NOT NULL,
  word_count INT DEFAULT 0 NOT NULL,
  ai_generated TINYINT(1) DEFAULT 0 NOT NULL,
  consistency_warning TINYINT(1) DEFAULT 0 NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,
  KEY idx_novel_chapters_auth_uid (auth_uid),
  KEY idx_novel_chapters_project_id (project_id)
);

CREATE TABLE IF NOT EXISTS junli_novel_chapter_versions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  _openid VARCHAR(64) DEFAULT '' NOT NULL,
  auth_uid VARCHAR(96) NOT NULL,
  project_id BIGINT NOT NULL,
  chapter_id BIGINT NOT NULL,
  title VARCHAR(160) NOT NULL,
  summary TEXT NOT NULL,
  content LONGTEXT NOT NULL,
  word_count INT DEFAULT 0 NOT NULL,
  source_label VARCHAR(80) DEFAULT '自动保存' NOT NULL,
  created_at DATETIME NOT NULL,
  KEY idx_novel_chapter_versions_auth_uid (auth_uid),
  KEY idx_novel_chapter_versions_chapter_id (chapter_id)
);

CREATE TABLE IF NOT EXISTS junli_novel_ai_generations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  _openid VARCHAR(64) DEFAULT '' NOT NULL,
  auth_uid VARCHAR(96) NOT NULL,
  project_id BIGINT NOT NULL,
  chapter_id BIGINT NULL,
  action_type VARCHAR(40) NOT NULL,
  instruction_text TEXT NOT NULL,
  model_name VARCHAR(80) NOT NULL,
  prompt_template_id BIGINT NULL,
  context_scope VARCHAR(40) NOT NULL,
  context_labels_json LONGTEXT NOT NULL,
  output_text LONGTEXT NOT NULL,
  created_at DATETIME NOT NULL,
  KEY idx_novel_generations_auth_uid (auth_uid),
  KEY idx_novel_generations_project_id (project_id)
);

CREATE TABLE IF NOT EXISTS junli_novel_exports (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  _openid VARCHAR(64) DEFAULT '' NOT NULL,
  auth_uid VARCHAR(96) NOT NULL,
  project_id BIGINT NOT NULL,
  format VARCHAR(20) NOT NULL,
  scope_label VARCHAR(80) NOT NULL,
  chapter_ids_json LONGTEXT NOT NULL,
  download_name VARCHAR(190) NOT NULL,
  created_at DATETIME NOT NULL,
  KEY idx_novel_exports_auth_uid (auth_uid),
  KEY idx_novel_exports_project_id (project_id)
);
