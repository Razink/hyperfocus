-- Crée les matières (Subjects) nécessaires pour le bulletin officiel,
-- avec les noms FR canoniques et les couleurs alignées sur SUBJECT_COLORS.
-- Idempotent : ne crée que les matières absentes pour l'utilisateur.
-- Crée aussi les slots d'évaluations (DC1/DC2/DS1 × 3 trimestres) pour chaque nouvelle matière.
--
-- Remplace 'nizarklibi@gmail.com' par l'email du compte concerné.

DO $$
DECLARE
  target_user_id TEXT;
  new_subject_id TEXT;
  subj RECORD;
BEGIN
  SELECT id INTO target_user_id FROM users WHERE email = 'nizarklibi@gmail.com';

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non trouvé. Vérifie l''email.';
  END IF;

  FOR subj IN
    SELECT * FROM (VALUES
      ('Arabe',               '#fff7ed'),
      ('Français',            '#ede9fe'),
      ('Anglais',             '#fce7f3'),
      ('Histoire',            '#ffedd5'),
      ('Géographie',          '#fef3c7'),
      ('Éducation Islamique', '#f5f3ff'),
      ('Éducation civique',   '#cffafe'),
      ('Mathématiques',       '#dbeafe'),
      ('Sciences physiques',  '#dcfce7'),
      ('SVT',                 '#d1fae5'),
      ('Technologie',         '#f1f5f9'),
      ('Arts plastiques',     '#fef9c3'),
      ('Informatique',        '#e0f2fe'),
      ('EPS',                 '#fee2e2'),
      ('Musique',             '#fdf2f8'),
      ('Théâtre',             '#faf5ff')
    ) AS t(name, color)
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM subjects WHERE user_id = target_user_id AND name = subj.name
    ) THEN
      new_subject_id := gen_random_uuid();

      INSERT INTO subjects (id, user_id, name, color, created_at, updated_at)
      VALUES (new_subject_id, target_user_id, subj.name, subj.color, NOW(), NOW());

      -- Slots d'évaluations (parité avec SubjectService.create)
      INSERT INTO assessments (id, subject_id, trimester, kind, is_past, created_at, updated_at)
      VALUES
        (gen_random_uuid(), new_subject_id, 1, 'DC1', false, NOW(), NOW()),
        (gen_random_uuid(), new_subject_id, 1, 'DC2', false, NOW(), NOW()),
        (gen_random_uuid(), new_subject_id, 1, 'DS1', false, NOW(), NOW()),
        (gen_random_uuid(), new_subject_id, 2, 'DC1', false, NOW(), NOW()),
        (gen_random_uuid(), new_subject_id, 2, 'DC2', false, NOW(), NOW()),
        (gen_random_uuid(), new_subject_id, 2, 'DS1', false, NOW(), NOW()),
        (gen_random_uuid(), new_subject_id, 3, 'DC1', false, NOW(), NOW()),
        (gen_random_uuid(), new_subject_id, 3, 'DC2', false, NOW(), NOW()),
        (gen_random_uuid(), new_subject_id, 3, 'DS1', false, NOW(), NOW())
      ON CONFLICT DO NOTHING;

      RAISE NOTICE 'Créé : %', subj.name;
    ELSE
      RAISE NOTICE 'Existe déjà : %', subj.name;
    END IF;
  END LOOP;
END $$;
