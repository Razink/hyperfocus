--
-- PostgreSQL database dump
--

\restrict Hmt0cSujKLTHWvAE9ilsl5EScLeD6JSf5CFgXHKhQes4TraetvmcKR3if6ldmx8

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.subjects DROP CONSTRAINT IF EXISTS subjects_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.revision_sessions DROP CONSTRAINT IF EXISTS revision_sessions_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.revision_sessions DROP CONSTRAINT IF EXISTS revision_sessions_lesson_id_fkey;
ALTER TABLE IF EXISTS ONLY public.lessons DROP CONSTRAINT IF EXISTS lessons_subject_id_fkey;
DROP INDEX IF EXISTS public.users_username_key;
DROP INDEX IF EXISTS public.users_email_key;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.subjects DROP CONSTRAINT IF EXISTS subjects_pkey;
ALTER TABLE IF EXISTS ONLY public.revision_sessions DROP CONSTRAINT IF EXISTS revision_sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.lessons DROP CONSTRAINT IF EXISTS lessons_pkey;
ALTER TABLE IF EXISTS ONLY public._prisma_migrations DROP CONSTRAINT IF EXISTS _prisma_migrations_pkey;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.subjects;
DROP TABLE IF EXISTS public.revision_sessions;
DROP TABLE IF EXISTS public.lessons;
DROP TABLE IF EXISTS public._prisma_migrations;
DROP TYPE IF EXISTS public."Role";
-- *not* dropping schema, since initdb creates it
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: hyperfocus
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO hyperfocus;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: hyperfocus
--

COMMENT ON SCHEMA public IS '';


--
-- Name: Role; Type: TYPE; Schema: public; Owner: hyperfocus
--

CREATE TYPE public."Role" AS ENUM (
    'ELEVE',
    'PARENT'
);


ALTER TYPE public."Role" OWNER TO hyperfocus;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: hyperfocus
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO hyperfocus;

--
-- Name: lessons; Type: TABLE; Schema: public; Owner: hyperfocus
--

CREATE TABLE public.lessons (
    id text NOT NULL,
    subject_id text NOT NULL,
    title text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    content_percent integer DEFAULT 0 NOT NULL,
    screenshot_url text,
    is_revised boolean DEFAULT false NOT NULL,
    revised_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.lessons OWNER TO hyperfocus;

--
-- Name: revision_sessions; Type: TABLE; Schema: public; Owner: hyperfocus
--

CREATE TABLE public.revision_sessions (
    id text NOT NULL,
    user_id text NOT NULL,
    date text NOT NULL,
    start_time text,
    duration integer DEFAULT 60 NOT NULL,
    subject text NOT NULL,
    lesson_id text,
    notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.revision_sessions OWNER TO hyperfocus;

--
-- Name: subjects; Type: TABLE; Schema: public; Owner: hyperfocus
--

CREATE TABLE public.subjects (
    id text NOT NULL,
    user_id text NOT NULL,
    name text NOT NULL,
    color text DEFAULT '#6366f1'::text NOT NULL,
    icon text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.subjects OWNER TO hyperfocus;

--
-- Name: users; Type: TABLE; Schema: public; Owner: hyperfocus
--

CREATE TABLE public.users (
    id text NOT NULL,
    username text,
    name text NOT NULL,
    email text,
    password_hash text NOT NULL,
    avatar_url text,
    role public."Role" DEFAULT 'ELEVE'::public."Role" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO hyperfocus;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: hyperfocus
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
25856c29-9016-4127-98bf-1f400b8602a8	282b5cb1e32eceb4c6ac714f778c86f96eebbbf854b165d807170d4af90b29c6	2026-04-15 14:02:55.701721+00	20260415140255_init_with_revisions	\N	\N	2026-04-15 14:02:55.631421+00	1
\.


--
-- Data for Name: lessons; Type: TABLE DATA; Schema: public; Owner: hyperfocus
--

COPY public.lessons (id, subject_id, title, "order", content_percent, screenshot_url, is_revised, revised_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: revision_sessions; Type: TABLE DATA; Schema: public; Owner: hyperfocus
--

COPY public.revision_sessions (id, user_id, date, start_time, duration, subject, lesson_id, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: subjects; Type: TABLE DATA; Schema: public; Owner: hyperfocus
--

COPY public.subjects (id, user_id, name, color, icon, created_at, updated_at) FROM stdin;
5f87bd51-5b98-4af2-a1f6-ebfd19d21fae	79ec9657-b137-4f93-9884-bf0e3b1987fa	Histoire-Géo	#c2410c	🌍	2026-04-15 15:04:25.606	2026-04-15 15:04:25.606
2817b5c6-91a6-430b-a139-3c2eab935575	79ec9657-b137-4f93-9884-bf0e3b1987fa	Éducation civique	#0e7490	⚖️	2026-04-15 15:04:25.654	2026-04-15 15:04:25.654
633fd7ed-0c0a-4ebf-bcbc-6a5e3a8e96dc	79ec9657-b137-4f93-9884-bf0e3b1987fa	Physique	#15803d	⚗️	2026-04-15 15:04:25.66	2026-04-15 15:04:25.66
51df8e0a-cfa5-4d03-bb8a-4aa06b7ca940	79ec9657-b137-4f93-9884-bf0e3b1987fa	SVT	#065f46	🌿	2026-04-15 15:04:25.667	2026-04-15 15:04:25.667
eeaf3753-722e-409f-b41e-d846787b3fe7	79ec9657-b137-4f93-9884-bf0e3b1987fa	Éducation Islamique	#7e22ce	☪️	2026-04-15 15:04:25.672	2026-04-15 15:04:25.672
25a3e7b5-4bf2-4be9-9fe3-c3981b5ac215	79ec9657-b137-4f93-9884-bf0e3b1987fa	Arabe	#9a3412	🔤	2026-04-15 15:04:25.68	2026-04-15 15:04:25.68
ae5d47de-5035-4b0b-88dc-edbbb0f92498	79ec9657-b137-4f93-9884-bf0e3b1987fa	Anglais	#be185d	🇬🇧	2026-04-15 15:04:25.684	2026-04-15 15:04:25.684
21e8b72e-f5fa-4d4b-98a9-cfa9b3817973	79ec9657-b137-4f93-9884-bf0e3b1987fa	Français	#6d28d9	📖	2026-04-15 15:04:25.689	2026-04-15 15:04:25.689
1d936064-f257-4e89-9dbe-29fb664003b1	79ec9657-b137-4f93-9884-bf0e3b1987fa	Mathématiques	#1d4ed8	📐	2026-04-15 15:04:25.696	2026-04-15 15:04:25.696
31f39c76-5c67-4a41-ac8e-f338fe92cd79	79ec9657-b137-4f93-9884-bf0e3b1987fa	Info / Techno	#0369a1	💻	2026-04-15 15:04:25.701	2026-04-15 15:04:25.701
328de90f-f739-42e1-8dd8-40c4d55a521f	79ec9657-b137-4f93-9884-bf0e3b1987fa	Éducation Artistique	#b45309	🎨	2026-04-15 15:04:25.706	2026-04-15 15:04:25.706
442cef83-2c67-4896-809c-6b2f99d0eb12	79ec9657-b137-4f93-9884-bf0e3b1987fa	Musique	#9d174d	🎵	2026-04-15 15:04:25.713	2026-04-15 15:04:25.713
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: hyperfocus
--

COPY public.users (id, username, name, email, password_hash, avatar_url, role, created_at, updated_at) FROM stdin;
79ec9657-b137-4f93-9884-bf0e3b1987fa	nizar	Nizar	nizarklibi@gmail.com	$2b$10$U7hL3qXbAx42Lk.vd5MSxukAzGNFW4C5h1jVdFa8sscfN.uEUqgK2	\N	ELEVE	2026-04-15 14:03:06.786	2026-04-15 14:03:06.786
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: hyperfocus
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: lessons lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: hyperfocus
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_pkey PRIMARY KEY (id);


--
-- Name: revision_sessions revision_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: hyperfocus
--

ALTER TABLE ONLY public.revision_sessions
    ADD CONSTRAINT revision_sessions_pkey PRIMARY KEY (id);


--
-- Name: subjects subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: hyperfocus
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: hyperfocus
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: hyperfocus
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_username_key; Type: INDEX; Schema: public; Owner: hyperfocus
--

CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);


--
-- Name: lessons lessons_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hyperfocus
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: revision_sessions revision_sessions_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hyperfocus
--

ALTER TABLE ONLY public.revision_sessions
    ADD CONSTRAINT revision_sessions_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: revision_sessions revision_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hyperfocus
--

ALTER TABLE ONLY public.revision_sessions
    ADD CONSTRAINT revision_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: subjects subjects_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hyperfocus
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: hyperfocus
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict Hmt0cSujKLTHWvAE9ilsl5EScLeD6JSf5CFgXHKhQes4TraetvmcKR3if6ldmx8

