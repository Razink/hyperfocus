-- Script de migration des examens hardcodés vers la base de données
-- Remplace 'ton@email.com' par l'email du compte concerné

DO $$
DECLARE
  target_user_id TEXT;
BEGIN
  SELECT id INTO target_user_id FROM users WHERE email = 'ton@email.com';

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non trouvé. Vérifie l''email.';
  END IF;

  INSERT INTO exams (id, user_id, subject, date, detail, created_at, updated_at)
  VALUES
    (gen_random_uuid(), target_user_id, 'Histoire-Géo',        '2026-04-15', 'Géographie',        NOW(), NOW()),
    (gen_random_uuid(), target_user_id, 'Éducation civique',   '2026-04-20', NULL,                NOW(), NOW()),
    (gen_random_uuid(), target_user_id, 'Arabe',               '2026-04-21', 'Expression écrite', NOW(), NOW()),
    (gen_random_uuid(), target_user_id, 'Mathématiques',       '2026-04-22', NULL,                NOW(), NOW()),
    (gen_random_uuid(), target_user_id, 'Arabe',               '2026-04-24', 'Étude de texte',    NOW(), NOW()),
    (gen_random_uuid(), target_user_id, 'Éducation Islamique', '2026-04-28', NULL,                NOW(), NOW()),
    (gen_random_uuid(), target_user_id, 'SVT',                 '2026-04-28', NULL,                NOW(), NOW()),
    (gen_random_uuid(), target_user_id, 'Français',            '2026-04-29', NULL,                NOW(), NOW()),
    (gen_random_uuid(), target_user_id, 'Anglais',             '2026-04-30', NULL,                NOW(), NOW()),
    (gen_random_uuid(), target_user_id, 'Physique',            '2026-05-05', NULL,                NOW(), NOW()),
    (gen_random_uuid(), target_user_id, 'Technique',           '2026-05-07', NULL,                NOW(), NOW())
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'OK — 11 examens insérés pour %', target_user_id;
END $$;
