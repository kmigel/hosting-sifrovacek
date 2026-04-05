-- Basic settings
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Tables

CREATE TABLE public.cipher_hints (
    id integer NOT NULL,
    cipher_id integer NOT NULL,
    content text CONSTRAINT cipher_hints_text_not_null NOT NULL,
    cost integer DEFAULT 0 NOT NULL,
    "position" integer NOT NULL
);
ALTER TABLE public.cipher_hints OWNER TO sifrovacky_user;

CREATE TABLE public.ciphers (
    id integer NOT NULL,
    game_id integer NOT NULL,
    name text NOT NULL,
    solution text NOT NULL,
    path text NOT NULL,
    "position" integer NOT NULL,
    points integer DEFAULT 1 NOT NULL
);
ALTER TABLE public.ciphers OWNER TO sifrovacky_user;

CREATE TABLE public.game_teams (
    game_id integer NOT NULL,
    team_id integer NOT NULL,
    current integer DEFAULT 0,
    score integer DEFAULT 0 NOT NULL,
    last_update timestamp without time zone
);
ALTER TABLE public.game_teams OWNER TO sifrovacky_user;

CREATE TABLE public.games (
    id integer NOT NULL,
    title text NOT NULL,
    state character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    ordered_hints boolean DEFAULT true,
    show_leaderboard boolean DEFAULT true,
    time_order boolean DEFAULT true,
    CONSTRAINT game_state_check CHECK (((state)::text = ANY ((ARRAY['pending'::character varying, 'active'::character varying, 'finished'::character varying])::text[])))
);
ALTER TABLE public.games OWNER TO sifrovacky_user;

CREATE TABLE public.team_hint_usage (
    team_id integer NOT NULL,
    hint_id integer NOT NULL
);
ALTER TABLE public.team_hint_usage OWNER TO sifrovacky_user;

CREATE TABLE public.users (
    id integer NOT NULL,
    login text NOT NULL,
    password_hash text NOT NULL,
    name text NOT NULL,
    role text NOT NULL,
    members text[] DEFAULT '{}'::text[],
    CONSTRAINT users_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'team'::text])))
);
ALTER TABLE public.users OWNER TO sifrovacky_user;

-- Sequences

CREATE SEQUENCE public.cipher_hints_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.cipher_hints_id_seq OWNER TO sifrovacky_user;
ALTER SEQUENCE public.cipher_hints_id_seq OWNED BY public.cipher_hints.id;

CREATE SEQUENCE public.ciphers_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.ciphers_id_seq OWNER TO sifrovacky_user;
ALTER SEQUENCE public.ciphers_id_seq OWNED BY public.ciphers.id;

CREATE SEQUENCE public.games_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.games_id_seq OWNER TO sifrovacky_user;
ALTER SEQUENCE public.games_id_seq OWNED BY public.games.id;

CREATE SEQUENCE public.users_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.users_id_seq OWNER TO sifrovacky_user;
ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;

-- Set default values for id columns
ALTER TABLE ONLY public.cipher_hints ALTER COLUMN id SET DEFAULT nextval('public.cipher_hints_id_seq'::regclass);
ALTER TABLE ONLY public.ciphers ALTER COLUMN id SET DEFAULT nextval('public.ciphers_id_seq'::regclass);
ALTER TABLE ONLY public.games ALTER COLUMN id SET DEFAULT nextval('public.games_id_seq'::regclass);
ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);

-- Primary keys and constraints
ALTER TABLE ONLY public.cipher_hints ADD CONSTRAINT cipher_hints_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.ciphers ADD CONSTRAINT ciphers_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.game_teams ADD CONSTRAINT game_teams_pkey PRIMARY KEY (game_id, team_id);
ALTER TABLE ONLY public.games ADD CONSTRAINT games_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.games ADD CONSTRAINT games_title_key UNIQUE (title);
ALTER TABLE ONLY public.team_hint_usage ADD CONSTRAINT team_hint_usage_pkey PRIMARY KEY (team_id, hint_id);
ALTER TABLE ONLY public.users ADD CONSTRAINT users_login_key UNIQUE (login);
ALTER TABLE ONLY public.users ADD CONSTRAINT users_pkey PRIMARY KEY (id);

-- Foreign keys
ALTER TABLE ONLY public.cipher_hints ADD CONSTRAINT cipher_hints_cipher_id_fkey FOREIGN KEY (cipher_id) REFERENCES public.ciphers(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.ciphers ADD CONSTRAINT ciphers_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.game_teams ADD CONSTRAINT game_teams_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.game_teams ADD CONSTRAINT game_teams_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.team_hint_usage ADD CONSTRAINT team_hint_usage_hint_id_fkey FOREIGN KEY (hint_id) REFERENCES public.cipher_hints(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.team_hint_usage ADD CONSTRAINT team_hint_usage_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Insert default admin user
INSERT INTO users (login, password_hash, name, role)
VALUES ('admin', '$2b$10$lyUlUgpox5aL9Y.3EsK2O.LBCjHmNXoL7urQJZfbqqXTERpJBvYTq', 'admin', 'admin');