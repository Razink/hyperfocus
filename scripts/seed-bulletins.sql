-- Seed des bulletins T1 et T2 (année 2025/2026) pour un utilisateur donné.
-- Prérequis : avoir lancé scripts/seed-bulletin-subjects.sql avant
-- pour que les Subjects FR existent (le lien subject_id est résolu par nom).
--
-- Remplace 'nizarklibi@gmail.com' par l'email du compte concerné.
--
-- ⚠️ Le détail T1 n'est pas encore renseigné — placeholder.
-- Quand l'image T1 sera fournie, je remplirai le bloc T1 sur le même modèle.

DO $$
DECLARE
  target_user_id TEXT;
  t1_id TEXT;
  t2_id TEXT;
BEGIN
  SELECT id INTO target_user_id FROM users WHERE email = 'nizarklibi@gmail.com';
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non trouvé.';
  END IF;

  ----------------------------------------------------------------
  -- BULLETIN T2 — Trimestre 2, 2025/2026
  ----------------------------------------------------------------
  t2_id := gen_random_uuid();
  INSERT INTO bulletins (id, user_id, school_year, trimester, class_name, class_size, rank, general_average, is_projection, created_at, updated_at)
  VALUES (t2_id, target_user_id, '2025/2026', 2, '9ème année enseignement de base 1', 26, 25, 8.48, false, NOW(), NOW())
  ON CONFLICT DO NOTHING;

  INSERT INTO bulletin_subjects (id, bulletin_id, subject_id, name, coefficient, "order", oral, tp, examen_ecrit, dc1, dc2, devoir_synthese, moyenne, rank, total, exempted, teacher_note, created_at, updated_at)
  VALUES
    (gen_random_uuid(), t2_id, (SELECT id FROM subjects WHERE user_id = target_user_id AND name = 'Arabe'),               'Arabe',               4,    0, 16.00, NULL,  NULL,  1.00,  3.00,  2.50,  5.68,  24, 22.75, false, NULL, NOW(), NOW()),
    (gen_random_uuid(), t2_id, (SELECT id FROM subjects WHERE user_id = target_user_id AND name = 'Français'),            'Français',            4,    1, 8.00,  NULL,  5.00,  NULL,  7.50,  NULL,  7.00,  16, 28.00, false, NULL, NOW(), NOW()),
    (gen_random_uuid(), t2_id, (SELECT id FROM subjects WHERE user_id = target_user_id AND name = 'Anglais'),             'Anglais',             1.5,  2, 10.00, NULL,  10.50, NULL,  14.00, NULL,  12.12, 9,  18.18, false, NULL, NOW(), NOW()),
    (gen_random_uuid(), t2_id, (SELECT id FROM subjects WHERE user_id = target_user_id AND name = 'Histoire'),            'Histoire',            1,    3, 12.00, NULL,  16.50, 6.50,  NULL,  NULL,  10.37, 24, 10.37, false, NULL, NOW(), NOW()),
    (gen_random_uuid(), t2_id, (SELECT id FROM subjects WHERE user_id = target_user_id AND name = 'Géographie'),          'Géographie',          1,    4, 10.00, NULL,  6.00,  NULL,  10.00, NULL,  9.00,  20, 9.00,  false, NULL, NOW(), NOW()),
    (gen_random_uuid(), t2_id, (SELECT id FROM subjects WHERE user_id = target_user_id AND name = 'Éducation Islamique'), 'Éducation Islamique', 1,    5, 18.00, NULL,  16.00, NULL,  16.00, NULL,  16.50, 19, 16.50, false, NULL, NOW(), NOW()),
    (gen_random_uuid(), t2_id, (SELECT id FROM subjects WHERE user_id = target_user_id AND name = 'Éducation civique'),   'Éducation civique',   1,    6, 16.00, NULL,  2.00,  NULL,  7.00,  NULL,  8.00,  26, 8.00,  false, NULL, NOW(), NOW()),
    (gen_random_uuid(), t2_id, (SELECT id FROM subjects WHERE user_id = target_user_id AND name = 'Mathématiques'),       'Mathématiques',       3,    7, NULL,  NULL,  6.00,  6.00,  2.00,  NULL,  4.00,  24, 12.00, false, NULL, NOW(), NOW()),
    (gen_random_uuid(), t2_id, (SELECT id FROM subjects WHERE user_id = target_user_id AND name = 'Sciences physiques'),  'Sciences physiques',  1,    8, 16.00, NULL,  8.00,  NULL,  2.00,  NULL,  4.00,  24, 4.00,  false, NULL, NOW(), NOW()),
    (gen_random_uuid(), t2_id, (SELECT id FROM subjects WHERE user_id = target_user_id AND name = 'SVT'),                 'SVT',                 1,    9, NULL,  10.50, 10.00, NULL,  3.00,  NULL,  6.62,  23, 6.62,  false, NULL, NOW(), NOW()),
    (gen_random_uuid(), t2_id, (SELECT id FROM subjects WHERE user_id = target_user_id AND name = 'Technologie'),         'Technologie',         1,   10, 15.00, 6.00,  NULL,  NULL,  2.00,  NULL,  6.25,  26, 6.25,  false, NULL, NOW(), NOW()),
    (gen_random_uuid(), t2_id, (SELECT id FROM subjects WHERE user_id = target_user_id AND name = 'Arts plastiques'),     'Arts plastiques',     1,   11, 13.00, 10.00, NULL,  NULL,  NULL,  NULL,  11.00, 24, 11.00, false, NULL, NOW(), NOW()),
    (gen_random_uuid(), t2_id, (SELECT id FROM subjects WHERE user_id = target_user_id AND name = 'Informatique'),        'Informatique',        1,   12, NULL,  8.25,  NULL,  NULL,  19.00, NULL,  13.62, 17, 13.62, false, NULL, NOW(), NOW()),
    (gen_random_uuid(), t2_id, (SELECT id FROM subjects WHERE user_id = target_user_id AND name = 'EPS'),                 'EPS',                 1,   13, 20.00, NULL,  NULL,  NULL,  NULL,  NULL,  20.00, 1,  20.00, false, NULL, NOW(), NOW()),
    (gen_random_uuid(), t2_id, (SELECT id FROM subjects WHERE user_id = target_user_id AND name = 'Musique'),             'Musique',             1,   14, 13.00, NULL,  NULL,  NULL,  13.00, NULL,  13.00, 20, 13.00, false, NULL, NOW(), NOW()),
    (gen_random_uuid(), t2_id, (SELECT id FROM subjects WHERE user_id = target_user_id AND name = 'Théâtre'),             'Théâtre',             0,   15, NULL,  NULL,  NULL,  NULL,  NULL,  NULL,  NULL,  NULL, NULL, true,  NULL, NOW(), NOW())
  ON CONFLICT DO NOTHING;

  ----------------------------------------------------------------
  -- BULLETIN T1 — Trimestre 1, 2025/2026
  -- Total=222.29 / Σcoef=23.5 → moy=9.46 ✓ — rang 21/26
  ----------------------------------------------------------------
  t1_id := gen_random_uuid();
  INSERT INTO bulletins (id, user_id, school_year, trimester, class_name, class_size, rank, general_average, is_projection, created_at, updated_at)
  VALUES (t1_id, target_user_id, '2025/2026', 1, '9ème année enseignement de base 1', 26, 21, 9.46, false, NOW(), NOW())
  ON CONFLICT DO NOTHING;

  INSERT INTO bulletin_subjects (id, bulletin_id, subject_id, name, coefficient, "order", oral, tp, examen_ecrit, dc1, dc2, devoir_synthese, moyenne, rank, total, exempted, teacher_note, created_at, updated_at)
  VALUES
    -- Arabe : sous-lignes consolidées (oral=شفوي, dc=إنشاء)
    (gen_random_uuid(), t1_id, (SELECT id FROM subjects WHERE user_id = target_user_id AND name = 'Arabe'),               'Arabe',               4,    0, 15.00, NULL, NULL,  6.50,  5.00,  4.50,  7.59,  21, 30.37, false, NULL, NOW(), NOW()),
    (gen_random_uuid(), t1_id, (SELECT id FROM subjects WHERE user_id = target_user_id AND name = 'Français'),            'Français',            4,    1, 10.00, NULL, NULL,  NULL,  1.50,  6.00,  5.87,  18, 23.50, false, NULL, NOW(), NOW()),
    (gen_random_uuid(), t1_id, (SELECT id FROM subjects WHERE user_id = target_user_id AND name = 'Anglais'),             'Anglais',             1.5,  2, 13.00, NULL, NULL,  11.50, NULL,  14.00, 13.12, 7,  19.68, false, NULL, NOW(), NOW()),
    (gen_random_uuid(), t1_id, (SELECT id FROM subjects WHERE user_id = target_user_id AND name = 'Histoire'),            'Histoire',            1,    3, 14.00, NULL, NULL,  12.50, NULL,  NULL,  12.62, 19, 12.62, false, NULL, NOW(), NOW()),
    (gen_random_uuid(), t1_id, (SELECT id FROM subjects WHERE user_id = target_user_id AND name = 'Géographie'),          'Géographie',          1,    4, 15.00, NULL, NULL,  NULL,  NULL,  14.50, 14.50, 21, 14.50, false, NULL, NOW(), NOW()),
    (gen_random_uuid(), t1_id, (SELECT id FROM subjects WHERE user_id = target_user_id AND name = 'Éducation Islamique'), 'Éducation Islamique', 1,    5, 15.00, NULL, NULL,  12.00, NULL,  14.00, 13.75, 12, 13.75, false, NULL, NOW(), NOW()),
    (gen_random_uuid(), t1_id, (SELECT id FROM subjects WHERE user_id = target_user_id AND name = 'Éducation civique'),   'Éducation civique',   1,    6, 14.00, NULL, NULL,  14.00, NULL,  14.00, 14.00, 15, 14.00, false, NULL, NOW(), NOW()),
    (gen_random_uuid(), t1_id, (SELECT id FROM subjects WHERE user_id = target_user_id AND name = 'Mathématiques'),       'Mathématiques',       3,    7, NULL,  NULL, NULL,  3.75,  7.50,  2.00,  3.81,  23, 11.43, false, NULL, NOW(), NOW()),
    (gen_random_uuid(), t1_id, (SELECT id FROM subjects WHERE user_id = target_user_id AND name = 'Sciences physiques'),  'Sciences physiques',  1,    8, NULL,  NULL, 6.00,  NULL,  NULL,  3.00,  4.00,  20, 4.00,  false, NULL, NOW(), NOW()),
    (gen_random_uuid(), t1_id, (SELECT id FROM subjects WHERE user_id = target_user_id AND name = 'SVT'),                 'SVT',                 1,    9, NULL,  14.00,NULL,  11.50, NULL,  2.50,  7.62,  24, 7.62,  false, NULL, NOW(), NOW()),
    (gen_random_uuid(), t1_id, (SELECT id FROM subjects WHERE user_id = target_user_id AND name = 'Technologie'),         'Technologie',         1,   10, 17.00, 10.00,NULL,  15.50, NULL,  NULL,  14.50, 16, 14.50, false, NULL, NOW(), NOW()),
    (gen_random_uuid(), t1_id, (SELECT id FROM subjects WHERE user_id = target_user_id AND name = 'Arts plastiques'),     'Arts plastiques',     1,   11, 15.00, NULL, NULL,  16.00, NULL,  NULL,  15.66, 7,  15.66, false, NULL, NOW(), NOW()),
    (gen_random_uuid(), t1_id, (SELECT id FROM subjects WHERE user_id = target_user_id AND name = 'Informatique'),        'Informatique',        1,   12, NULL,  9.00, NULL,  NULL,  NULL,  19.00, 14.00, 25, 14.00, false, NULL, NOW(), NOW()),
    (gen_random_uuid(), t1_id, (SELECT id FROM subjects WHERE user_id = target_user_id AND name = 'EPS'),                 'EPS',                 1,   13, 14.00, NULL, NULL,  NULL,  NULL,  NULL,  14.00, 22, 14.00, false, NULL, NOW(), NOW()),
    (gen_random_uuid(), t1_id, (SELECT id FROM subjects WHERE user_id = target_user_id AND name = 'Musique'),             'Musique',             1,   14, 15.00, NULL, NULL,  NULL,  8.00,  NULL,  12.66, 18, 12.66, false, NULL, NOW(), NOW()),
    (gen_random_uuid(), t1_id, (SELECT id FROM subjects WHERE user_id = target_user_id AND name = 'Théâtre'),             'Théâtre',             0,   15, NULL,  NULL, NULL,  NULL,  NULL,  NULL,  NULL,  NULL, NULL,  true,  NULL, NOW(), NOW())
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Seed bulletins OK — T1=%, T2=%', t1_id, t2_id;
END $$;
