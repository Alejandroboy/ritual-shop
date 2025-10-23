--
-- PostgreSQL database dump
--

\restrict ePWcAAWTULIN9po8UbWgyvrfy2mGGsLgyGtOqWT0zf0lfXWcwsHDMhenDJaZIuB

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

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

--
-- Name: AssetKind; Type: TYPE; Schema: public; Owner: ritual
--

CREATE TYPE public."AssetKind" AS ENUM (
    'PHOTO',
    'REFERENCE',
    'DOCUMENT'
);


ALTER TYPE public."AssetKind" OWNER TO ritual;

--
-- Name: ColorMode; Type: TYPE; Schema: public; Owner: ritual
--

CREATE TYPE public."ColorMode" AS ENUM (
    'BW',
    'COLOR'
);


ALTER TYPE public."ColorMode" OWNER TO ritual;

--
-- Name: Coverage; Type: TYPE; Schema: public; Owner: ritual
--

CREATE TYPE public."Coverage" AS ENUM (
    'NORMAL',
    'FULL_WRAP'
);


ALTER TYPE public."Coverage" OWNER TO ritual;

--
-- Name: Currency; Type: TYPE; Schema: public; Owner: ritual
--

CREATE TYPE public."Currency" AS ENUM (
    'KZT',
    'RUB'
);


ALTER TYPE public."Currency" OWNER TO ritual;

--
-- Name: Finish; Type: TYPE; Schema: public; Owner: ritual
--

CREATE TYPE public."Finish" AS ENUM (
    'MATTE',
    'GLOSS'
);


ALTER TYPE public."Finish" OWNER TO ritual;

--
-- Name: HolePattern; Type: TYPE; Schema: public; Owner: ritual
--

CREATE TYPE public."HolePattern" AS ENUM (
    'NONE',
    'TWO_HORIZONTAL',
    'TWO_VERTICAL',
    'FOUR_CORNERS'
);


ALTER TYPE public."HolePattern" OWNER TO ritual;

--
-- Name: Material; Type: TYPE; Schema: public; Owner: ritual
--

CREATE TYPE public."Material" AS ENUM (
    'CERMET',
    'WHITE_CERAMIC_GRANITE',
    'BLACK_CERAMIC_GRANITE',
    'GLASS',
    'GROWTH_PHOTOCERAMICS',
    'ENGRAVING'
);


ALTER TYPE public."Material" OWNER TO ritual;

--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: ritual
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'DRAFT',
    'ACCEPTED',
    'IN_PROGRESS',
    'APPROVAL',
    'SENT',
    'READY'
);


ALTER TYPE public."OrderStatus" OWNER TO ritual;

--
-- Name: Orientation; Type: TYPE; Schema: public; Owner: ritual
--

CREATE TYPE public."Orientation" AS ENUM (
    'VERTICAL',
    'HORIZONTAL'
);


ALTER TYPE public."Orientation" OWNER TO ritual;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: ritual
--

CREATE TYPE public."Role" AS ENUM (
    'ADMIN_GOD',
    'ADMIN',
    'MANAGER',
    'CUSTOMER'
);


ALTER TYPE public."Role" OWNER TO ritual;

--
-- Name: Shape; Type: TYPE; Schema: public; Owner: ritual
--

CREATE TYPE public."Shape" AS ENUM (
    'RECTANGLE',
    'OVAL',
    'ARCH',
    'STAR',
    'HEART'
);


ALTER TYPE public."Shape" OWNER TO ritual;

--
-- Name: StorageType; Type: TYPE; Schema: public; Owner: ritual
--

CREATE TYPE public."StorageType" AS ENUM (
    'local',
    's3'
);


ALTER TYPE public."StorageType" OWNER TO ritual;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Background; Type: TABLE; Schema: public; Owner: ritual
--

CREATE TABLE public."Background" (
    id integer NOT NULL,
    code integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE public."Background" OWNER TO ritual;

--
-- Name: Background_id_seq; Type: SEQUENCE; Schema: public; Owner: ritual
--

CREATE SEQUENCE public."Background_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Background_id_seq" OWNER TO ritual;

--
-- Name: Background_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ritual
--

ALTER SEQUENCE public."Background_id_seq" OWNED BY public."Background".id;


--
-- Name: FinishVariant; Type: TABLE; Schema: public; Owner: ritual
--

CREATE TABLE public."FinishVariant" (
    id integer NOT NULL,
    code text NOT NULL,
    label text NOT NULL
);


ALTER TABLE public."FinishVariant" OWNER TO ritual;

--
-- Name: FinishVariant_id_seq; Type: SEQUENCE; Schema: public; Owner: ritual
--

CREATE SEQUENCE public."FinishVariant_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."FinishVariant_id_seq" OWNER TO ritual;

--
-- Name: FinishVariant_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ritual
--

ALTER SEQUENCE public."FinishVariant_id_seq" OWNED BY public."FinishVariant".id;


--
-- Name: Frame; Type: TABLE; Schema: public; Owner: ritual
--

CREATE TABLE public."Frame" (
    id integer NOT NULL,
    code integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE public."Frame" OWNER TO ritual;

--
-- Name: Frame_id_seq; Type: SEQUENCE; Schema: public; Owner: ritual
--

CREATE SEQUENCE public."Frame_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Frame_id_seq" OWNER TO ritual;

--
-- Name: Frame_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ritual
--

ALTER SEQUENCE public."Frame_id_seq" OWNED BY public."Frame".id;


--
-- Name: Order; Type: TABLE; Schema: public; Owner: ritual
--

CREATE TABLE public."Order" (
    id text NOT NULL,
    number text NOT NULL,
    "customerName" text,
    "customerPhone" text,
    "intakePoint" text,
    delivery text,
    "intakeDate" timestamp(3) without time zone,
    "approveNeeded" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "orderStatus" public."OrderStatus" DEFAULT 'DRAFT'::public."OrderStatus" NOT NULL,
    "orderNumber" text,
    "customerEmail" text,
    currency public."Currency" DEFAULT 'RUB'::public."Currency" NOT NULL,
    "totalMinor" integer DEFAULT 0 NOT NULL,
    "customerId" text,
    "managerId" text
);


ALTER TABLE public."Order" OWNER TO ritual;

--
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: ritual
--

CREATE TABLE public."OrderItem" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "templateId" text NOT NULL,
    "sizeId" integer,
    "holePattern" public."HolePattern",
    "frameId" integer,
    "backgroundId" integer,
    finish public."Finish",
    comment text,
    "templateCode" text NOT NULL,
    "templateLabel" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "unitPriceMinor" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."OrderItem" OWNER TO ritual;

--
-- Name: OrderItemAsset; Type: TABLE; Schema: public; Owner: ritual
--

CREATE TABLE public."OrderItemAsset" (
    id text NOT NULL,
    "orderItemId" text NOT NULL,
    storage public."StorageType" DEFAULT 's3'::public."StorageType" NOT NULL,
    path text,
    bucket text,
    key text,
    "contentType" text,
    size integer,
    etag text,
    "originalName" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    kind public."AssetKind" DEFAULT 'PHOTO'::public."AssetKind" NOT NULL,
    "primary" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."OrderItemAsset" OWNER TO ritual;

--
-- Name: OrderItemPerson; Type: TABLE; Schema: public; Owner: ritual
--

CREATE TABLE public."OrderItemPerson" (
    id text NOT NULL,
    "itemId" text NOT NULL,
    "lastName" text,
    "firstName" text,
    "middleName" text,
    "birthDate" timestamp(3) without time zone,
    "deathDate" timestamp(3) without time zone
);


ALTER TABLE public."OrderItemPerson" OWNER TO ritual;

--
-- Name: RefreshSession; Type: TABLE; Schema: public; Owner: ritual
--

CREATE TABLE public."RefreshSession" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "tokenHash" text NOT NULL,
    "userAgent" text,
    ip text,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."RefreshSession" OWNER TO ritual;

--
-- Name: Size; Type: TABLE; Schema: public; Owner: ritual
--

CREATE TABLE public."Size" (
    id integer NOT NULL,
    "widthCm" integer NOT NULL,
    "heightCm" integer NOT NULL,
    label text NOT NULL
);


ALTER TABLE public."Size" OWNER TO ritual;

--
-- Name: Size_id_seq; Type: SEQUENCE; Schema: public; Owner: ritual
--

CREATE SEQUENCE public."Size_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Size_id_seq" OWNER TO ritual;

--
-- Name: Size_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ritual
--

ALTER SEQUENCE public."Size_id_seq" OWNED BY public."Size".id;


--
-- Name: Template; Type: TABLE; Schema: public; Owner: ritual
--

CREATE TABLE public."Template" (
    id text NOT NULL,
    code text NOT NULL,
    label text NOT NULL,
    shape public."Shape" NOT NULL,
    orientation public."Orientation",
    "colorMode" public."ColorMode" NOT NULL,
    coverage public."Coverage" DEFAULT 'NORMAL'::public."Coverage" NOT NULL,
    "supportsFrame" boolean DEFAULT false NOT NULL,
    "requiresBackground" boolean DEFAULT false NOT NULL,
    "requiresFinish" boolean DEFAULT false NOT NULL,
    "supportsHoles" boolean DEFAULT true NOT NULL,
    "personsMin" integer DEFAULT 1 NOT NULL,
    "personsMax" integer DEFAULT 1 NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    material public."Material" NOT NULL,
    "basePriceMinor" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."Template" OWNER TO ritual;

--
-- Name: TemplateBackground; Type: TABLE; Schema: public; Owner: ritual
--

CREATE TABLE public."TemplateBackground" (
    "templateId" text NOT NULL,
    "backgroundId" integer NOT NULL,
    "extraPriceMinor" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."TemplateBackground" OWNER TO ritual;

--
-- Name: TemplateFinish; Type: TABLE; Schema: public; Owner: ritual
--

CREATE TABLE public."TemplateFinish" (
    "templateId" text NOT NULL,
    finish public."Finish" NOT NULL,
    "extraPriceMinor" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."TemplateFinish" OWNER TO ritual;

--
-- Name: TemplateFrame; Type: TABLE; Schema: public; Owner: ritual
--

CREATE TABLE public."TemplateFrame" (
    "templateId" text NOT NULL,
    "frameId" integer NOT NULL,
    "extraPriceMinor" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."TemplateFrame" OWNER TO ritual;

--
-- Name: TemplateHole; Type: TABLE; Schema: public; Owner: ritual
--

CREATE TABLE public."TemplateHole" (
    "templateId" text NOT NULL,
    pattern public."HolePattern" NOT NULL,
    "extraPriceMinor" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."TemplateHole" OWNER TO ritual;

--
-- Name: TemplateSize; Type: TABLE; Schema: public; Owner: ritual
--

CREATE TABLE public."TemplateSize" (
    "templateId" text NOT NULL,
    "sizeId" integer NOT NULL,
    "extraPriceMinor" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."TemplateSize" OWNER TO ritual;

--
-- Name: TemplateVariant; Type: TABLE; Schema: public; Owner: ritual
--

CREATE TABLE public."TemplateVariant" (
    "templateId" text NOT NULL,
    "holePattern" public."HolePattern" NOT NULL,
    "finishRequired" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."TemplateVariant" OWNER TO ritual;

--
-- Name: TemplateVariantFinish; Type: TABLE; Schema: public; Owner: ritual
--

CREATE TABLE public."TemplateVariantFinish" (
    "templateId" text NOT NULL,
    "holePattern" public."HolePattern" NOT NULL,
    "finishId" integer NOT NULL
);


ALTER TABLE public."TemplateVariantFinish" OWNER TO ritual;

--
-- Name: User; Type: TABLE; Schema: public; Owner: ritual
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    name text,
    phone text,
    role public."Role" DEFAULT 'CUSTOMER'::public."Role" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO ritual;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: ritual
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


ALTER TABLE public._prisma_migrations OWNER TO ritual;

--
-- Name: Background id; Type: DEFAULT; Schema: public; Owner: ritual
--

ALTER TABLE ONLY public."Background" ALTER COLUMN id SET DEFAULT nextval('public."Background_id_seq"'::regclass);


--
-- Name: FinishVariant id; Type: DEFAULT; Schema: public; Owner: ritual
--

ALTER TABLE ONLY public."FinishVariant" ALTER COLUMN id SET DEFAULT nextval('public."FinishVariant_id_seq"'::regclass);


--
-- Name: Frame id; Type: DEFAULT; Schema: public; Owner: ritual
--

ALTER TABLE ONLY public."Frame" ALTER COLUMN id SET DEFAULT nextval('public."Frame_id_seq"'::regclass);


--
-- Name: Size id; Type: DEFAULT; Schema: public; Owner: ritual
--

ALTER TABLE ONLY public."Size" ALTER COLUMN id SET DEFAULT nextval('public."Size_id_seq"'::regclass);


--
-- Data for Name: Background; Type: TABLE DATA; Schema: public; Owner: ritual
--

COPY public."Background" (id, code, name) FROM stdin;
1	1	Фон 1
2	2	Фон 2
3	3	Фон 3
4	4	Фон 4
5	5	Фон 5
6	6	Фон 6
7	7	Фон 7
8	8	Фон 8
9	9	Фон 9
10	10	Фон 10
11	11	Фон 11
12	12	Фон 12
13	13	Фон 13
14	14	Фон 14
15	15	Фон 15
16	16	Фон 16
17	17	Фон 17
18	18	Фон 18
19	19	Фон 19
20	20	Фон 20
21	21	Фон 21
22	22	Фон 22
23	23	Фон 23
24	24	Фон 24
25	25	Фон 25
26	26	Фон 26
27	27	Фон 27
28	28	Фон 28
29	29	Фон 29
30	30	Фон 30
31	31	Фон 31
32	32	Фон 32
33	33	Фон 33
34	34	Фон 34
35	35	Фон 35
36	36	Фон 36
37	100	Фон 100
38	200	Фон 200
\.


--
-- Data for Name: FinishVariant; Type: TABLE DATA; Schema: public; Owner: ritual
--

COPY public."FinishVariant" (id, code, label) FROM stdin;
1	MATTE	Матовый
2	GLOSS	Глянец
\.


--
-- Data for Name: Frame; Type: TABLE DATA; Schema: public; Owner: ritual
--

COPY public."Frame" (id, code, name) FROM stdin;
1	1	Рамка 1
2	2	Рамка 2
3	3	Рамка 3
4	4	Рамка 4
5	5	Рамка 5
6	6	Рамка 6
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: ritual
--

COPY public."Order" (id, number, "customerName", "customerPhone", "intakePoint", delivery, "intakeDate", "approveNeeded", "createdAt", "updatedAt", "orderStatus", "orderNumber", "customerEmail", currency, "totalMinor", "customerId", "managerId") FROM stdin;
cmfyytrs90000oh2vqeoj7p1n	20250925-4952	aaa	sssss			2025-09-25 05:21:31.101	f	2025-09-25 05:21:31.104	2025-09-25 05:26:18.518	IN_PROGRESS	RS-20250925-0002	ddsdsd	RUB	0	\N	\N
cmfyz2kpi0000p42w8zxgpkd1	20250925-7322					2025-09-25 05:28:21.844	f	2025-09-25 05:28:21.845	2025-09-25 05:28:21.845	DRAFT	\N	\N	RUB	0	\N	\N
cmg6c7bev0000sa2wmz6a5jt4	20250930-6712	qq	ww			2025-09-30 09:10:21.318	f	2025-09-30 09:10:21.318	2025-09-30 12:24:49.78	ACCEPTED	RS-20250930-0002	ee	RUB	0	\N	\N
cmg6j757h0009sa2ww1pcyeoh	20250930-5930	today	today			2025-09-30 12:26:10.585	f	2025-09-30 12:26:10.587	2025-09-30 12:53:00.562	ACCEPTED	RS-20250930-0003	today	RUB	0	\N	\N
cmg6k6kra0002sa61s9jnsnj7	20250930-6247	abnort	abnort			2025-09-30 12:53:43.701	f	2025-09-30 12:53:43.702	2025-09-30 12:56:07.76	ACCEPTED	RS-20250930-0004	abnort	RUB	0	\N	\N
cmg6kh9b10005sa618uhgbhf3	20250930-4816	we	we			2025-09-30 13:02:02.031	f	2025-09-30 13:02:02.044	2025-09-30 13:24:08.418	ACCEPTED	RS-20250930-0005	er	RUB	0	\N	\N
cmg6le40y000csa7oytigf9aj	20250930-1027	112	23			2025-09-30 13:27:34.878	f	2025-09-30 13:27:34.881	2025-09-30 14:00:17.643	ACCEPTED	RS-20250930-0006	23	RUB	0	\N	\N
cmg6mlz7l000msa98rsbhgbqh	20250930-2878	123	123			2025-09-30 14:01:41.494	f	2025-09-30 14:01:41.5	2025-09-30 14:16:05.481	ACCEPTED	RS-20250930-0007	123	RUB	0	\N	\N
cmg6nacn0000wsa98a13xikfo	20250930-1881	eee	dsfdf			2025-09-30 14:20:38.632	f	2025-09-30 14:20:38.636	2025-09-30 14:24:22.565	ACCEPTED	RS-20250930-0008	dfdg	RUB	0	\N	\N
cmg6nffqn001asa98t11o1bu7	20250930-3524	qq2	qq2			2025-09-30 14:24:35.948	f	2025-09-30 14:24:35.951	2025-09-30 14:25:49.036	ACCEPTED	RS-20250930-0009	qq2	RUB	0	\N	\N
cmg6nj148001gsa98ql6itqkd	20250930-2174					2025-09-30 14:27:23.614	f	2025-09-30 14:27:23.621	2025-09-30 14:27:23.621	DRAFT	\N	\N	RUB	0	\N	\N
cmg6nshk5001jsa985m66c253	20250930-9661	22	33			2025-09-30 14:34:44.82	f	2025-09-30 14:34:44.823	2025-09-30 14:36:52.703	ACCEPTED	RS-20250930-0011	444	RUB	0	\N	\N
cmg6nvin6001osa98pdkrbk16	20250930-7549	123435435345345	12334343er			2025-09-30 14:37:06.202	f	2025-09-30 14:37:06.207	2025-09-30 14:38:31.956	ACCEPTED	RS-20250930-0012	34535	RUB	0	\N	\N
cmgqjqoot00043leeqba9x6d1	20250930-1062	Александр Пример 1	+7 999 999 9999			2025-09-30 14:38:58.896	f	2025-09-30 14:38:58.904	2025-10-14 14:04:57.076	ACCEPTED	RS-20251014-0001	example@alejandro.dre	RUB	0	\N	\N
cmgrgo1qj00023ll2m2yjdsjs	20251015-3760	Александр Пример 1	+7 999 999 9999			2025-10-15 03:58:30.086	f	2025-10-15 03:58:30.088	2025-10-15 03:58:45.182	ACCEPTED	RS-20251015-0002	example@alejandro.dre	RUB	0	cmgqjqoot00043leeqba9x6d1	\N
cmgrjch0700023lczo50h7hj1	20251015-5893	Александр Пример 1	+7 999 999 9999			2025-10-15 05:13:28.828	f	2025-10-15 05:13:28.831	2025-10-15 05:14:31.583	ACCEPTED	RS-20251015-0003	example@alejandro.dre	RUB	0	cmgqjqoot00043leeqba9x6d1	\N
cmgszo4vh00043li0q6nje9gy	20251016-2413	Александр Пример 1	+7 999 999 9999			2025-10-16 05:38:13.029	f	2025-10-16 05:38:13.03	2025-10-16 05:38:33.562	ACCEPTED	RS-20251016-0002	example@alejandro.dre	RUB	0	cmgqjqoot00043leeqba9x6d1	\N
cmgt0c41s000b3li0ho56dytz	20251016-4618	Александр Пример 1	+7 999 999 9999			2025-10-16 05:56:51.697	f	2025-10-16 05:56:51.698	2025-10-16 06:17:22.138	ACCEPTED	RS-20251016-0003	example@alejandro.dre	RUB	0	cmgqjqoot00043leeqba9x6d1	\N
cmguerqgr00003l6n0tjkno2n	20251017-7595					2025-10-17 05:28:41.374	f	2025-10-17 05:28:41.376	2025-10-17 05:28:41.376	DRAFT	\N	\N	RUB	0	\N	\N
cmguiup88000d3l6nmgp7j2ui	20251017-6082					2025-10-17 07:22:58.21	f	2025-10-17 07:22:58.212	2025-10-17 07:22:58.212	DRAFT	\N	\N	RUB	0	\N	\N
cmguvued8000k3l6n8aqhordk	20251017-9911	Александр Пример 1	+7 999 999 9999			2025-10-17 13:26:39.13	f	2025-10-17 13:26:39.132	2025-10-17 13:28:23.021	ACCEPTED	RS-20251017-0004	example@alejandro.dre	RUB	0	cmgqjqoot00043leeqba9x6d1	\N
cmguvx5vw000r3l6nae9f3z8t	20251017-4164	Александр Пример 1	+7 999 999 9999			2025-10-17 13:28:48.138	f	2025-10-17 13:28:48.139	2025-10-17 13:30:53.595	ACCEPTED	RS-20251017-0005	example@alejandro.dre	RUB	0	cmgqjqoot00043leeqba9x6d1	\N
cmguwy9tw00103l6njzagoqgq	20251017-8582					2025-10-17 13:57:39.499	f	2025-10-17 13:57:39.5	2025-10-17 13:57:39.5	DRAFT	\N	\N	RUB	0	\N	\N
cmgxaugqq00023lwvqgmby9te	20251019-4005					2025-10-19 06:02:08.833	f	2025-10-19 06:02:08.834	2025-10-19 06:02:08.834	DRAFT	\N	\N	RUB	0	\N	\N
cmgxd6nbz00043lpjijltve66	20251019-3912					2025-10-19 07:07:36.474	f	2025-10-19 07:07:36.475	2025-10-19 07:07:36.475	DRAFT	\N	\N	RUB	0	\N	\N
cmgxdjt7800093lpjjs5kq6b2	20251019-3895					2025-10-19 07:17:50.582	f	2025-10-19 07:17:50.586	2025-10-19 07:17:50.586	DRAFT	\N	\N	RUB	0	\N	\N
cmgxdsylw000e3lpj95f9ldfa	20251019-5572	vasya pupkin	+7 988 888 88 88			2025-10-19 07:24:57.497	f	2025-10-19 07:24:57.499	2025-10-19 07:29:27.499	ACCEPTED	RS-20251019-0005	vasya@pupkin.doma	RUB	0	cmgx8kfj600003lbydkxlhqui	\N
cmgxe0nqm000h3lpjdaoleiem	20251019-8008					2025-10-19 07:30:56.666	f	2025-10-19 07:30:56.668	2025-10-19 07:30:56.668	DRAFT	\N	\N	RUB	0	\N	\N
cmgxe3mp5000m3lpjm7mx546n	20251019-9022	vasya pupkin	+7 988 888 88 88			2025-10-19 07:33:15.3	f	2025-10-19 07:33:15.302	2025-10-19 07:40:35.822	ACCEPTED	RS-20251019-0007	vasya@pupkin.doma	RUB	0	cmgx8kfj600003lbydkxlhqui	\N
cmgxtzydo00023l79tcj4knr1	20251019-6196	Евгений Тук	+7 989 888 88 88			2025-10-19 14:58:17.552	f	2025-10-19 14:58:17.56	2025-10-20 08:30:24.3	ACCEPTED	RS-20251020-0001	asd@fgh.yt	RUB	0	cmgyvi2zs00053l796nmye9jz	\N
cmgyx4c61000e3l79g2c4d92h	20251020-9277	Евгений Тук	+7 989 888 88 88			2025-10-20 09:13:27.149	f	2025-10-20 09:13:27.152	2025-10-20 09:13:49.182	ACCEPTED	RS-20251020-0002	asd@fgh.yt	RUB	0	cmgyvi2zs00053l796nmye9jz	\N
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: ritual
--

COPY public."OrderItem" (id, "orderId", "templateId", "sizeId", "holePattern", "frameId", "backgroundId", finish, comment, "templateCode", "templateLabel", "createdAt", "updatedAt", "unitPriceMinor") FROM stdin;
cmg6c7bfs0002sa2wlo3mxcyw	cmg6c7bev0000sa2wmz6a5jt4	cmfxj063i0000qyf4ptstwhkl	5	NONE	1	1	\N	\N	CERM-T-R-V-BW	Табличка Т верт. ч/б	2025-09-30 09:10:21.352	2025-09-30 09:10:21.352	0
cmg6ipysz0004sa2wces67o4x	cmg6c7bev0000sa2wmz6a5jt4	cmfxj063i0000qyf4ptstwhkl	5	NONE	1	1	\N	\N	CERM-T-R-V-BW	Табличка Т верт. ч/б	2025-09-30 12:12:49.139	2025-09-30 12:12:49.139	0
cmg6j2yxs0006sa2wilqtiovg	cmg6c7bev0000sa2wmz6a5jt4	cmfxj06440001qyf4tdpmqc9c	5	NONE	1	1	\N	\N	CERM-T-R-V-C	Табличка Т верт. цвет	2025-09-30 12:22:55.84	2025-09-30 12:22:55.84	0
cmg6j3zo30008sa2wlquwhksq	cmg6c7bev0000sa2wmz6a5jt4	cmfxj06440001qyf4tdpmqc9c	5	NONE	1	1	\N	\N	CERM-T-R-V-C	Табличка Т верт. цвет	2025-09-30 12:23:43.443	2025-09-30 12:23:43.443	0
cmg6j7cy4000bsa2wtoxsjbsw	cmg6j757h0009sa2ww1pcyeoh	cmfxj065a0005qyf4x5jq9u9z	8	NONE	1	1	\N	\N	CERM-O-OV-V-C	Овал верт. цвет	2025-09-30 12:26:20.62	2025-09-30 12:26:20.62	0
cmg6j9ur60001sa4lc1asuig2	cmg6j757h0009sa2ww1pcyeoh	cmfxj065a0005qyf4x5jq9u9z	8	NONE	1	1	\N	\N	CERM-O-OV-V-C	Овал верт. цвет	2025-09-30 12:28:17.009	2025-09-30 12:28:17.009	0
cmg6jdfxl0001sa61vqqke799	cmg6j757h0009sa2ww1pcyeoh	cmfxj065a0005qyf4x5jq9u9z	8	NONE	1	1	\N	\N	CERM-O-OV-V-C	Овал верт. цвет	2025-09-30 12:31:04.426	2025-09-30 12:31:04.426	0
cmg6k93uf0004sa61i4g9059l	cmg6k6kra0002sa61s9jnsnj7	cmfxj069c000gqyf4sx8m1y3o	8	NONE	\N	1	MATTE	\N	WCG-O-OV-V-BW	Керамогранит бел. овал верт. ч/б	2025-09-30 12:55:41.751	2025-09-30 12:55:41.751	0
cmg6kh9dq0007sa61e9epkxua	cmg6kh9b10005sa618uhgbhf3	cmfxj063i0000qyf4ptstwhkl	5	NONE	1	1	\N	\N	CERM-T-R-V-BW	Табличка Т верт. ч/б	2025-09-30 13:02:02.175	2025-09-30 13:02:02.175	0
cmg6kjn0d0009sa6115ri6agu	cmg6kh9b10005sa618uhgbhf3	cmfxj063i0000qyf4ptstwhkl	5	FOUR_CORNERS	3	1	\N	\N	CERM-T-R-V-BW	Табличка Т верт. ч/б	2025-09-30 13:03:53.149	2025-09-30 13:03:53.149	0
cmg6kpxlm0001sa7ok16f2ino	cmg6kh9b10005sa618uhgbhf3	cmfxj063i0000qyf4ptstwhkl	5	NONE	1	1	\N	\N	CERM-T-R-V-BW	Табличка Т верт. ч/б	2025-09-30 13:08:46.809	2025-09-30 13:08:46.809	0
cmg6l2v2t0003sa7o57su8bhb	cmg6kh9b10005sa618uhgbhf3	cmfxj063i0000qyf4ptstwhkl	5	NONE	1	1	\N	\N	CERM-T-R-V-BW	Табличка Т верт. ч/б	2025-09-30 13:18:50.069	2025-09-30 13:18:50.069	0
cmg6l3epq0005sa7ok4ngbu60	cmg6kh9b10005sa618uhgbhf3	cmfxj063i0000qyf4ptstwhkl	5	NONE	1	1	\N	\N	CERM-T-R-V-BW	Табличка Т верт. ч/б	2025-09-30 13:19:15.519	2025-09-30 13:19:15.519	0
cmg6l49hu0007sa7ocskv32e3	cmg6kh9b10005sa618uhgbhf3	cmfxj063i0000qyf4ptstwhkl	5	NONE	1	1	\N	\N	CERM-T-R-V-BW	Табличка Т верт. ч/б	2025-09-30 13:19:55.41	2025-09-30 13:19:55.41	0
cmg6l5uqj0009sa7ov2hvphgs	cmg6kh9b10005sa618uhgbhf3	cmfxj063i0000qyf4ptstwhkl	5	NONE	1	1	\N	\N	CERM-T-R-V-BW	Табличка Т верт. ч/б	2025-09-30 13:21:09.595	2025-09-30 13:21:09.595	0
cmg6l8uk1000bsa7otxk0ht7x	cmg6kh9b10005sa618uhgbhf3	cmfxj063i0000qyf4ptstwhkl	5	NONE	1	1	\N	\N	CERM-T-R-V-BW	Табличка Т верт. ч/б	2025-09-30 13:23:29.329	2025-09-30 13:23:29.329	0
cmg6le42r000esa7oaeuduh46	cmg6le40y000csa7oytigf9aj	cmfxj06bd000mqyf4clxt8rld	1	NONE	\N	1	\N	\N	GLS-T-R-V-BW	Стекло табличка верт. ч/б	2025-09-30 13:27:34.947	2025-09-30 13:27:34.947	0
cmg6lfh070001sa98nk0fgepx	cmg6le40y000csa7oytigf9aj	cmfxj06bd000mqyf4clxt8rld	1	NONE	\N	1	\N	\N	GLS-T-R-V-BW	Стекло табличка верт. ч/б	2025-09-30 13:28:38.359	2025-09-30 13:28:38.359	0
cmg6lh1cn0003sa988v0jqbu7	cmg6le40y000csa7oytigf9aj	cmfxj06bd000mqyf4clxt8rld	1	NONE	\N	1	\N	\N	GLS-T-R-V-BW	Стекло табличка верт. ч/б	2025-09-30 13:29:51.383	2025-09-30 13:29:51.383	0
cmg6li25d0005sa986yg8durg	cmg6le40y000csa7oytigf9aj	cmfxj06bd000mqyf4clxt8rld	1	NONE	\N	1	\N	\N	GLS-T-R-V-BW	Стекло табличка верт. ч/б	2025-09-30 13:30:39.073	2025-09-30 13:30:39.073	0
cmg6lq0z30007sa981bcovzr8	cmg6le40y000csa7oytigf9aj	cmfxj06bd000mqyf4clxt8rld	1	NONE	\N	1	\N	\N	GLS-T-R-V-BW	Стекло табличка верт. ч/б	2025-09-30 13:36:50.799	2025-09-30 13:36:50.799	0
cmg6lsh6h0009sa982v426oqu	cmg6le40y000csa7oytigf9aj	cmfxj06bd000mqyf4clxt8rld	1	NONE	\N	1	\N	\N	GLS-T-R-V-BW	Стекло табличка верт. ч/б	2025-09-30 13:38:45.114	2025-09-30 13:38:45.114	0
cmg6lth5i000bsa98pqltjeop	cmg6le40y000csa7oytigf9aj	cmfxj06bd000mqyf4clxt8rld	1	NONE	\N	1	\N	\N	GLS-T-R-V-BW	Стекло табличка верт. ч/б	2025-09-30 13:39:31.734	2025-09-30 13:39:31.734	0
cmg6lu5m7000dsa982zqeav59	cmg6le40y000csa7oytigf9aj	cmfxj06bd000mqyf4clxt8rld	1	NONE	\N	1	\N	\N	GLS-T-R-V-BW	Стекло табличка верт. ч/б	2025-09-30 13:40:03.439	2025-09-30 13:40:03.439	0
cmg6lxdik000fsa98hkbb6gjt	cmg6le40y000csa7oytigf9aj	cmfxj06bd000mqyf4clxt8rld	1	NONE	\N	1	\N	\N	GLS-T-R-V-BW	Стекло табличка верт. ч/б	2025-09-30 13:42:33.644	2025-09-30 13:42:33.644	0
cmg6mbqpg000hsa980c7jv4xh	cmg6le40y000csa7oytigf9aj	cmfxj06bd000mqyf4clxt8rld	1	NONE	\N	1	\N	\N	GLS-T-R-V-BW	Стекло табличка верт. ч/б	2025-09-30 13:53:43.925	2025-09-30 13:53:43.925	0
cmg6md7i0000jsa98qmdm3e9h	cmg6le40y000csa7oytigf9aj	cmfxj06bd000mqyf4clxt8rld	1	NONE	\N	1	\N	\N	GLS-T-R-V-BW	Стекло табличка верт. ч/б	2025-09-30 13:54:52.344	2025-09-30 13:54:52.344	0
cmg6mjml0000lsa98mu9l67z2	cmg6le40y000csa7oytigf9aj	cmfxj06bd000mqyf4clxt8rld	1	NONE	\N	1	\N	\N	GLS-T-R-V-BW	Стекло табличка верт. ч/б	2025-09-30 13:59:51.828	2025-09-30 13:59:51.828	0
cmg6mlz9m000osa98afz44egp	cmg6mlz7l000msa98rsbhgbqh	cmfxj063i0000qyf4ptstwhkl	5	NONE	1	1	\N	\N	CERM-T-R-V-BW	Табличка Т верт. ч/б	2025-09-30 14:01:41.578	2025-09-30 14:01:41.578	0
cmg6moaal000qsa98ab7kdbif	cmg6mlz7l000msa98rsbhgbqh	cmfxj064q0003qyf4jp5of5ag	\N	NONE	1	1	\N	\N	CERM-T-R-H-C	Табличка Т гор. цвет	2025-09-30 14:03:29.181	2025-09-30 14:03:29.181	0
cmg6n0c2d000ssa98uyw6qzp9	cmg6mlz7l000msa98rsbhgbqh	cmfxj063i0000qyf4ptstwhkl	5	NONE	1	1	\N	\N	CERM-T-R-V-BW	Табличка Т верт. ч/б	2025-09-30 14:12:51.35	2025-09-30 14:12:51.35	0
cmg6n3gx4000usa98bajtjtj1	cmg6mlz7l000msa98rsbhgbqh	cmfxj063i0000qyf4ptstwhkl	5	NONE	1	1	\N	\N	CERM-T-R-V-BW	Табличка Т верт. ч/б	2025-09-30 14:15:17.608	2025-09-30 14:15:17.608	0
cmg6nacox000ysa98us93sewn	cmg6nacn0000wsa98a13xikfo	cmfxj064y0004qyf473wtlu0v	8	NONE	1	1	\N	\N	CERM-O-OV-V-BW	Овал верт. ч/б	2025-09-30 14:20:38.721	2025-09-30 14:20:38.721	0
cmg6naycn0010sa982xvppb4r	cmg6nacn0000wsa98a13xikfo	cmfxj064y0004qyf473wtlu0v	8	NONE	1	1	\N	\N	CERM-O-OV-V-BW	Овал верт. ч/б	2025-09-30 14:21:06.791	2025-09-30 14:21:06.791	0
cmg6nbw7s0012sa98nb7zri53	cmg6nacn0000wsa98a13xikfo	cmfxj064y0004qyf473wtlu0v	8	NONE	1	1	\N	\N	CERM-O-OV-V-BW	Овал верт. ч/б	2025-09-30 14:21:50.68	2025-09-30 14:21:50.68	0
cmg6ncu690014sa98rts9xhr8	cmg6nacn0000wsa98a13xikfo	cmfxj064y0004qyf473wtlu0v	8	NONE	1	1	\N	\N	CERM-O-OV-V-BW	Овал верт. ч/б	2025-09-30 14:22:34.689	2025-09-30 14:22:34.689	0
cmg6nd7dk0016sa98z1zlxx9e	cmg6nacn0000wsa98a13xikfo	cmfxj064y0004qyf473wtlu0v	8	NONE	1	1	\N	\N	CERM-O-OV-V-BW	Овал верт. ч/б	2025-09-30 14:22:51.801	2025-09-30 14:22:51.801	0
cmg6nepo40018sa98u3nv50w5	cmg6nacn0000wsa98a13xikfo	cmfxj064y0004qyf473wtlu0v	8	NONE	1	1	\N	\N	CERM-O-OV-V-BW	Овал верт. ч/б	2025-09-30 14:24:02.165	2025-09-30 14:24:02.165	0
cmg6nffs2001csa98imzsvo6j	cmg6nffqn001asa98t11o1bu7	cmfxj063i0000qyf4ptstwhkl	5	NONE	1	1	\N	\N	CERM-T-R-V-BW	Табличка Т верт. ч/б	2025-09-30 14:24:36.003	2025-09-30 14:24:36.003	0
cmg6ngi2s001esa98ho7ivecn	cmg6nffqn001asa98t11o1bu7	cmfxj06440001qyf4tdpmqc9c	5	NONE	1	1	\N	\N	CERM-T-R-V-C	Табличка Т верт. цвет	2025-09-30 14:25:25.636	2025-09-30 14:25:25.636	0
cmg6nj16d001isa98kifwm101	cmg6nj148001gsa98ql6itqkd	cmfxj063i0000qyf4ptstwhkl	5	NONE	1	1	\N	d	CERM-T-R-V-BW	Табличка Т верт. ч/б	2025-09-30 14:27:23.701	2025-09-30 14:27:23.701	0
cmg6nshlg001lsa98fr8whx4h	cmg6nshk5001jsa985m66c253	cmfxj063i0000qyf4ptstwhkl	5	NONE	1	1	\N	\N	CERM-T-R-V-BW	Табличка Т верт. ч/б	2025-09-30 14:34:44.884	2025-09-30 14:34:44.884	0
cmg6nuf5d001nsa98mmfpnrrb	cmg6nshk5001jsa985m66c253	cmfxj063i0000qyf4ptstwhkl	5	NONE	1	1	\N	\N	CERM-T-R-V-BW	Табличка Т верт. ч/б	2025-09-30 14:36:15.025	2025-09-30 14:36:15.025	0
cmg6nwjb0001qsa98cu34uygc	cmg6nvin6001osa98pdkrbk16	cmfxj06440001qyf4tdpmqc9c	5	NONE	1	1	\N	\N	CERM-T-R-V-C	Табличка Т верт. цвет	2025-09-30 14:37:53.724	2025-09-30 14:37:53.724	0
cmg6nwtga001ssa98oi2py2s3	cmg6nvin6001osa98pdkrbk16	cmfxj06440001qyf4tdpmqc9c	5	NONE	1	1	\N	\N	CERM-T-R-V-C	Табличка Т верт. цвет	2025-09-30 14:38:06.873	2025-09-30 14:38:06.873	0
cmg6nxxoq001wsa981z7scvft	cmgqjqoot00043leeqba9x6d1	cmfxj064y0004qyf473wtlu0v	8	NONE	1	1	\N	\N	CERM-O-OV-V-BW	Овал верт. ч/б	2025-09-30 14:38:59.019	2025-09-30 14:38:59.019	0
cmgqjsgdp00083leew1eezzvn	cmgqjqoot00043leeqba9x6d1	cmfxj065j0006qyf4l0x3wtma	4	NONE	1	1	\N	\N	CERM-O-OV-H-BW	Овал гор. ч/б	2025-10-14 12:38:08.365	2025-10-14 12:38:08.365	0
cmgqjsy0t000a3leeq0hyyevb	cmgqjqoot00043leeqba9x6d1	cmfxj06440001qyf4tdpmqc9c	5	FOUR_CORNERS	1	1	\N	\N	CERM-T-R-V-C	Табличка Т верт. цвет	2025-10-14 12:38:31.229	2025-10-14 12:38:31.229	0
cmgrgo1s700043ll2nuksruho	cmgrgo1qj00023ll2m2yjdsjs	cmfxj06bm000nqyf4506fh414	1	NONE	\N	1	\N	\N	GLS-T-R-V-C	Стекло табличка верт. цвет	2025-10-15 03:58:30.151	2025-10-15 03:58:30.151	0
cmgrjch1e00043lczfx8kgtdc	cmgrjch0700023lczo50h7hj1	cmfxj06d3000tqyf4e7ko0xld	4	TWO_HORIZONTAL	\N	6	\N	new comment	GLS-O-OV-H-C	Стекло овал гор. цвет	2025-10-15 05:13:28.898	2025-10-15 05:13:28.898	0
cmgszo4xa00063li07zbi4o4t	cmgszo4vh00043li0q6nje9gy	cmfxj06440001qyf4tdpmqc9c	5	NONE	1	1	\N	ddddd	CERM-T-R-V-C	Табличка Т верт. цвет	2025-10-16 05:38:13.102	2025-10-16 05:38:13.102	0
cmgt0c431000d3li0tatl1ehd	cmgt0c41s000b3li0ho56dytz	cmfxj06e6000xqyf4hmhzd05x	4	FOUR_CORNERS	\N	\N	MATTE	hfhfhfh	BCG-T-R-H-BW	Керамогранит чёрный гор. ч/б	2025-10-16 05:56:51.757	2025-10-16 05:56:51.757	0
cmgt0s8y700013l3o7dklwab5	cmgt0c41s000b3li0ho56dytz	cmfxj06e6000xqyf4hmhzd05x	4	NONE	\N	\N	MATTE	kjkkkk	BCG-T-R-H-BW	Керамогранит чёрный гор. ч/б	2025-10-16 06:09:24.559	2025-10-16 06:09:24.559	0
cmgt11t4300033l3oqhhgeg7a	cmgt0c41s000b3li0ho56dytz	cmfxj06e6000xqyf4hmhzd05x	4	NONE	\N	\N	GLOSS	eee	BCG-T-R-H-BW	Керамогранит чёрный гор. ч/б	2025-10-16 06:16:50.595	2025-10-16 06:16:50.595	0
cmgt127rn00073l3oaswdmef1	cmgt0c41s000b3li0ho56dytz	cmfxj06e6000xqyf4hmhzd05x	4	NONE	\N	\N	GLOSS	eee	BCG-T-R-H-BW	Керамогранит чёрный гор. ч/б	2025-10-16 06:17:09.587	2025-10-16 06:17:09.587	0
cmguerxza00023l6n86w9f1fo	cmguerqgr00003l6n0tjkno2n	cmfxj065j0006qyf4l0x3wtma	4	TWO_HORIZONTAL	3	1	\N	\N	CERM-O-OV-H-BW	Овал гор. ч/б	2025-10-17 05:28:51.142	2025-10-17 05:28:51.142	0
cmguiv1gh000f3l6nq81b213h	cmguiup88000d3l6nmgp7j2ui	cmfxj065u0007qyf4qx03pn4o	6	TWO_HORIZONTAL	5	1	\N	112wwww	CERM-O-OV-H-C	Овал гор. цвет	2025-10-17 07:23:14.081	2025-10-17 07:23:14.081	0
cmguvvgph000o3l6n38dfpahx	cmguvued8000k3l6n8aqhordk	cmfxj065j0006qyf4l0x3wtma	4	NONE	1	1	\N	\N	CERM-O-OV-H-BW	Овал гор. ч/б	2025-10-17 13:27:28.853	2025-10-17 13:27:28.853	0
cmguvz8k9000v3l6nw4tr987h	cmguvx5vw000r3l6nae9f3z8t	cmfxj06dw000wqyf4992rrgnl	1	FOUR_CORNERS	\N	\N	GLOSS	\N	BCG-T-R-V-BW	Керамогранит чёрный верт. ч/б	2025-10-17 13:30:24.921	2025-10-17 13:30:24.921	0
cmgxatrn400013lwv1wwcj2ry	cmguwy9tw00103l6njzagoqgq	cmfxj064y0004qyf473wtlu0v	30	TWO_VERTICAL	5	1	\N	Чуть более осмысленный момментарий	CERM-O-OV-V-BW	Овал верт. ч/б	2025-10-19 06:01:36.304	2025-10-19 06:01:36.304	0
cmgxc65xv00013l7xnt139thv	cmgxaugqq00023lwvqgmby9te	cmfxj065j0006qyf4l0x3wtma	4	NONE	1	1	\N	\N	CERM-O-OV-H-BW	Овал гор. ч/б	2025-10-19 06:39:14.323	2025-10-19 06:39:14.323	0
cmgxd1glw00013loi68ishn2x	cmgxaugqq00023lwvqgmby9te	cmfxj065j0006qyf4l0x3wtma	4	NONE	1	1	\N	\N	CERM-O-OV-H-BW	Овал гор. ч/б	2025-10-19 07:03:34.485	2025-10-19 07:03:34.485	0
cmgxd4zqu00013lpjj1qewwey	cmgxaugqq00023lwvqgmby9te	cmfxj065j0006qyf4l0x3wtma	4	NONE	1	1	\N	\N	CERM-O-OV-H-BW	Овал гор. ч/б	2025-10-19 07:06:19.254	2025-10-19 07:06:19.254	0
cmgxd7t0x00063lpjo03u9khr	cmgxd6nbz00043lpjijltve66	cmfxj064y0004qyf473wtlu0v	8	NONE	1	1	\N	\N	CERM-O-OV-V-BW	Овал верт. ч/б	2025-10-19 07:08:30.513	2025-10-19 07:08:30.513	0
cmgxdksvp000b3lpj2ywaogj1	cmgxdjt7800093lpjjs5kq6b2	cmfxj06cu000sqyf4hfkxu3cp	4	NONE	\N	1	\N	\N	GLS-O-OV-H-BW	Стекло овал гор. ч/б	2025-10-19 07:18:36.853	2025-10-19 07:18:36.853	0
cmgxdu3m6000g3lpjo1lc5o2r	cmgxdsylw000e3lpj95f9ldfa	cmfxj06e6000xqyf4hmhzd05x	4	NONE	\N	\N	GLOSS	\N	BCG-T-R-H-BW	Керамогранит чёрный гор. ч/б	2025-10-19 07:25:50.67	2025-10-19 07:25:50.67	0
cmgxe0rln000j3lpjcu6sgvi8	cmgxe0nqm000h3lpjdaoleiem	cmfxj065j0006qyf4l0x3wtma	4	NONE	1	1	\N	dfhudshudfshu	CERM-O-OV-H-BW	Овал гор. ч/б	2025-10-19 07:31:01.687	2025-10-19 07:31:01.687	0
cmgxe3qmu000o3lpjqq1cq2hi	cmgxe3mp5000m3lpjm7mx546n	cmfxj065u0007qyf4qx03pn4o	4	NONE	1	1	\N	\N	CERM-O-OV-H-C	Овал гор. цвет	2025-10-19 07:33:20.406	2025-10-19 07:33:20.406	0
cmgyvk1lp00093l79u9nlherz	cmgxtzydo00023l79tcj4knr1	cmfxj064y0004qyf473wtlu0v	25	TWO_VERTICAL	2	1	\N	gggg	CERM-O-OV-V-BW	Овал верт. ч/б	2025-10-20 08:29:40.765	2025-10-20 08:29:40.765	0
cmgyx4hkg000g3l797it0nu6l	cmgyx4c61000e3l79g2c4d92h	cmfxj065j0006qyf4l0x3wtma	15	TWO_HORIZONTAL	4	1	\N	rfrfrrr	CERM-O-OV-H-BW	Овал гор. ч/б	2025-10-20 09:13:34.192	2025-10-20 09:13:34.192	0
\.


--
-- Data for Name: OrderItemAsset; Type: TABLE DATA; Schema: public; Owner: ritual
--

COPY public."OrderItemAsset" (id, "orderItemId", storage, path, bucket, key, "contentType", size, etag, "originalName", "createdAt", kind, "primary") FROM stdin;
cmgt11zrq00053l3of1zoownp	cmgt11t4300033l3oqhhgeg7a	s3	\N	e0386c70-7da9cc8c-d477-4f4a-9c7e-635c2de66367	dev/orders/cmgt0c41s000b3li0ho56dytz/cmgt11t4300033l3oqhhgeg7a/1760595418785-Screenshot_2025-10-16_at_11.12.03_AM.png	image/png	371323	6c638ade9f055a6f5eb9e57a1691cd68	Screenshot 2025-10-16 at 11.12.03 AM.png	2025-10-16 06:16:59.223	PHOTO	f
cmguvz8ne000x3l6nyel8auqc	cmguvz8k9000v3l6nw4tr987h	s3	\N	e0386c70-7da9cc8c-d477-4f4a-9c7e-635c2de66367	orders/cmguvx5vw000r3l6nae9f3z8t/staged/7fd2a4c8-0201-491f-91fa-729a5be0c933-Screenshot_2025-10-17_at_10.57.09_AM.png	image/png	41776	9614a6fdc7830974b1ca96a3c6bfef73	Screenshot 2025-10-17 at 10.57.09 AM.png	2025-10-17 13:30:25.034	PHOTO	f
cmgxccwd000033l7xmk6i4mbz	cmgxc65xv00013l7xnt139thv	s3	\N	\N	\N	\N	\N	\N	Screenshot 2025-10-14 at 9.30.14 AM.png	2025-10-19 06:44:28.5	PHOTO	f
cmgxd1gop00033loi1kgymayp	cmgxd1glw00013loi68ishn2x	s3	\N	e0386c70-7da9cc8c-d477-4f4a-9c7e-635c2de66367	orders/cmgxaugqq00023lwvqgmby9te/staged/7ec0f8dd-02a9-4592-9c94-6c294126bc57-Screenshot_2025-10-14_at_9.38.45_PM.png	image/png	89028	81abe61d1078aa87ea6604deb8962604	Screenshot 2025-10-14 at 9.38.45 PM.png	2025-10-19 07:03:34.586	PHOTO	f
cmgxd7t4k00083lpju12723a1	cmgxd7t0x00063lpjo03u9khr	s3	\N	e0386c70-7da9cc8c-d477-4f4a-9c7e-635c2de66367	orders/cmgxd6nbz00043lpjijltve66/staged/cfa69ff2-7cde-4558-a71a-0a5facb4d88f-Screenshot_2025-10-14_at_9.30.07_AM.png	image/png	30066	f37fa3d3ec5f464f3c91bfb13a9100cd	Screenshot 2025-10-14 at 9.30.07 AM.png	2025-10-19 07:08:30.644	PHOTO	f
cmgxdksxm000d3lpjc2nbrz9r	cmgxdksvp000b3lpj2ywaogj1	s3	\N	e0386c70-7da9cc8c-d477-4f4a-9c7e-635c2de66367	orders/cmgxdjt7800093lpjjs5kq6b2/staged/98077e0c-43af-4a02-8322-297d7ba27e6d-Screenshot_2025-10-14_at_9.39.00_PM.png	image/png	141620	1bf60b0df439242a3fc4aae2ee90554a	Screenshot 2025-10-14 at 9.39.00 PM.png	2025-10-19 07:18:36.922	PHOTO	f
cmgxe0rou000l3lpjbni221ie	cmgxe0rln000j3lpjcu6sgvi8	s3	\N	e0386c70-7da9cc8c-d477-4f4a-9c7e-635c2de66367	orders/cmgxe0nqm000h3lpjdaoleiem/staged/5ca751ea-a3e0-4d92-a0e4-8b022063033b-Screenshot_2025-10-14_at_9.30.02_AM.png	image/png	106695	75469429db909d260c5778191f9032cb	Screenshot 2025-10-14 at 9.30.02 AM.png	2025-10-19 07:31:01.806	PHOTO	f
cmgxe3qox000q3lpje7py2b9r	cmgxe3qmu000o3lpjqq1cq2hi	s3	\N	e0386c70-7da9cc8c-d477-4f4a-9c7e-635c2de66367	orders/cmgxe3mp5000m3lpjm7mx546n/staged/b8f78c88-d091-4cab-a545-25999c4c9c2c-Screenshot_2025-10-14_at_9.44.52_PM.png	image/png	142830	2872b5ce1c21ba7e0acf8b97e73d242d	Screenshot 2025-10-14 at 9.44.52 PM.png	2025-10-19 07:33:20.481	PHOTO	f
cmgyvk1nx000b3l79nu0yzswf	cmgyvk1lp00093l79u9nlherz	s3	\N	e0386c70-7da9cc8c-d477-4f4a-9c7e-635c2de66367	orders/cmgxtzydo00023l79tcj4knr1/staged/9702d511-3db7-463e-bab9-602d526e4442-Screenshot_2025-10-14_at_9.39.00_PM.png	image/png	141620	1bf60b0df439242a3fc4aae2ee90554a	Screenshot 2025-10-14 at 9.39.00 PM.png	2025-10-20 08:29:40.845	PHOTO	f
cmgyx4hmx000i3l790jec8j7p	cmgyx4hkg000g3l797it0nu6l	s3	\N	e0386c70-7da9cc8c-d477-4f4a-9c7e-635c2de66367	orders/cmgyx4c61000e3l79g2c4d92h/staged/1d299860-bbea-4ca3-b2b1-62c594af3772-Screenshot_2025-10-14_at_9.44.52_PM.png	image/png	142830	2872b5ce1c21ba7e0acf8b97e73d242d	Screenshot 2025-10-14 at 9.44.52 PM.png	2025-10-20 09:13:34.282	PHOTO	f
\.


--
-- Data for Name: OrderItemPerson; Type: TABLE DATA; Schema: public; Owner: ritual
--

COPY public."OrderItemPerson" (id, "itemId", "lastName", "firstName", "middleName", "birthDate", "deathDate") FROM stdin;
\.


--
-- Data for Name: RefreshSession; Type: TABLE DATA; Schema: public; Owner: ritual
--

COPY public."RefreshSession" (id, "userId", "tokenHash", "userAgent", ip, "expiresAt", "createdAt") FROM stdin;
cmgq6irdw00023lize5fsam9y	cmgq5jhkq00003liz26xp5do4	$argon2id$v=19$m=65536,t=3,p=4$PchEoU6LLOLxekyDvNED0g$ItFfTH0+eVkWTt2oFK2Ll35wCbCoy47Coo46OKXeUSM	\N	\N	2025-11-13 06:26:41.06	2025-10-14 06:26:41.061
cmgq70nlk00043liz3g9u1h2l	cmgq5jhkq00003liz26xp5do4	$argon2id$v=19$m=65536,t=3,p=4$wmGvOVHQ//G7eaVFjpEN2Q$DaYMxh12mWOnd3o/wFofG/eMs01iigrlElEUrUmoEuw	\N	\N	2025-11-13 06:40:35.96	2025-10-14 06:40:35.961
cmgq8dnbt00013leee5byp17d	cmgq5jhkq00003liz26xp5do4	$argon2id$v=19$m=65536,t=3,p=4$wAZpKRv/n+nLjVyBF+843Q$PvFT/ehUcRpxY0BaIokhwO7xdXhvkk4uIWyZSu3cVz8	\N	\N	2025-11-13 07:18:41.752	2025-10-14 07:18:41.753
cmgqjon0e00033lee24t3ud9u	cmgq5jhkq00003liz26xp5do4	$argon2id$v=19$m=65536,t=3,p=4$YsJ6JX+ft5yVtFD4m5FG1g$K+Uh787HBaywuO8ff2nUw6LbouqQXS2rGoVh/oRyHTY	\N	\N	2025-11-13 12:35:10.333	2025-10-14 12:35:10.334
cmgqjs43800063lee2wwgf4q9	cmgqjqoot00043leeqba9x6d1	$argon2id$v=19$m=65536,t=3,p=4$V/lziJwiS/yjpBlReY9Ylw$vXA7IbwTdxwunOUnNs2UzK8mhX62TthVdL3guGfQdXA	\N	\N	2025-11-13 12:37:52.436	2025-10-14 12:37:52.436
cmgqkjwjg00013lqeweuolg2c	cmgqjqoot00043leeqba9x6d1	$argon2id$v=19$m=65536,t=3,p=4$Kj1yxNkuaOwJGxpIk85U7A$rsNLTBCw+Epl8LQbKTLzp+Zp+OIE7/Lb1gHP90Ctwto	\N	\N	2025-11-13 12:59:29.019	2025-10-14 12:59:29.02
cmgqmbrs400033lqeqdph4caz	cmgqjqoot00043leeqba9x6d1	$argon2id$v=19$m=65536,t=3,p=4$RSIRneHJ3DafbLBuCrrriw$72VN+87XpLLqLELZyuwfvkVQ+2bcg3oowC/mNJ4oQhQ	\N	\N	2025-11-13 13:49:08.836	2025-10-14 13:49:08.837
cmgqml27z00053lqedgtl2nnv	cmgqjqoot00043leeqba9x6d1	$argon2id$v=19$m=65536,t=3,p=4$/hGWQ4fDeD979CtOFoKMng$w2AVgrhRM+mgnV3Yf9sVHTwjq2CfJ7P+2Kt/Wh7nAwg	\N	\N	2025-11-13 13:56:22.271	2025-10-14 13:56:22.272
cmgrgnidb00013ll2hdhhmdhk	cmgqjqoot00043leeqba9x6d1	$argon2id$v=19$m=65536,t=3,p=4$+oJasvKO91zq5urW+D69vA$61GsOfaRNNAENNMAHSlJr2wLOptN1F+wHOfSj0eK+HA	\N	\N	2025-11-14 03:58:04.988	2025-10-15 03:58:04.989
cmgrh6jv500013luqt7au59ml	cmgqjqoot00043leeqba9x6d1	$argon2id$v=19$m=65536,t=3,p=4$x3P2Bs3pJijLV7aVwI102w$JmVOElKcoASD70bpsgBg5Nf+q6POIkmC+/K5erBW1dY	\N	\N	2025-11-14 04:12:53.393	2025-10-15 04:12:53.394
cmgrio16v00013lcz8j60rh1e	cmgqjqoot00043leeqba9x6d1	$argon2id$v=19$m=65536,t=3,p=4$FstmDifUyHmwS4HtHGf9Cg$PR47lIOU/yrwzCF+03CaRQ97G0M8hyj+kgFLvTtemhs	\N	\N	2025-11-14 04:54:28.614	2025-10-15 04:54:28.615
cmgrjdhrj00073lcz8h2c7hsb	cmgqjqoot00043leeqba9x6d1	$argon2id$v=19$m=65536,t=3,p=4$Ns+I9BsEqYUU/EK1aVPPew$M5bt/g5vVjj7Gh3inYb8LmgvT9wFyfl0+dL8s0aoXt4	\N	\N	2025-11-14 05:14:16.494	2025-10-15 05:14:16.495
cmgrlwx7000013l13y3u5xgj7	cmgqjqoot00043leeqba9x6d1	$argon2id$v=19$m=65536,t=3,p=4$eUpoxCPsc/lZL2DCQykQCQ$3Ka2gHo4qjjYIZwmcRHcKgeR4HRteNWEcVV1IFtlVpQ	\N	\N	2025-11-14 06:25:22.187	2025-10-15 06:25:22.188
cmgrn4fbf00013l6blog2573n	cmgqjqoot00043leeqba9x6d1	$argon2id$v=19$m=65536,t=3,p=4$U13RIjjXlct6QHL4/kcodA$g0vnEpe67FRzp5fU2VmjfuYfaWA/0hQ8UahK4BWZLeg	\N	\N	2025-11-14 06:59:11.881	2025-10-15 06:59:11.883
cmgrnj55v00013ldnurj0ucjm	cmgqjqoot00043leeqba9x6d1	$argon2id$v=19$m=65536,t=3,p=4$UEC3kOAvRQASo9XpAL0VCA$/lzHE4r3l37ps8JPSZH+wgbG3x/ERfOcwj4UNZqSOgs	\N	\N	2025-11-14 07:10:38.562	2025-10-15 07:10:38.563
cmgszn22c00013li02emv4g6o	cmgqjqoot00043leeqba9x6d1	$argon2id$v=19$m=65536,t=3,p=4$QPj07jQG59QmQtRyN8JEVw$yQ0YldtBCSnG4mIE8XL9CqsJ6OXb+w0jsM3MnEDwzeE	\N	\N	2025-11-15 05:37:22.739	2025-10-16 05:37:22.74
cmgt12eb300093l3o4zl0plql	cmgqjqoot00043leeqba9x6d1	$argon2id$v=19$m=65536,t=3,p=4$emGfxC2+8twTISA7cI+LxA$Z7RZ16SVPJWkv3fx+99cahlS1Ks4od0vqHumzN4EaBE	\N	\N	2025-11-15 06:17:18.06	2025-10-16 06:17:18.063
cmgudawnl00013lkeppr94113	cmgqjqoot00043leeqba9x6d1	$argon2id$v=19$m=65536,t=3,p=4$mIRV0Fc8ZTgHJdlLDNhboQ$FjRVvHK4YW9wA+VKKNYHA6AQ3G06nPW3hzVHPtqM0PE	\N	\N	2025-11-16 04:47:36.656	2025-10-17 04:47:36.657
cmguwztiw00163l6nebn05h7e	cmgqjqoot00043leeqba9x6d1	$argon2id$v=19$m=65536,t=3,p=4$K1XtXFzncVC1MriNaqCvlQ$ppYhPsqOJs39XDhpGAF84/zmAmvquTHJajw/gooUXBY	\N	\N	2025-11-16 13:58:51.703	2025-10-17 13:58:51.704
cmguykmtx00013lzpo4kavly2	cmgqjqoot00043leeqba9x6d1	$argon2id$v=19$m=65536,t=3,p=4$Ry3hOs3FFwMEIgSzsKcrfQ$yOwS7QBD0eVUXxSpsc74oQrgWhEYm4N5OPuI65hUeLs	\N	\N	2025-11-16 14:43:02.419	2025-10-17 14:43:02.421
cmguyljx600033lzpgb7qsau9	cmgqjqoot00043leeqba9x6d1	$argon2id$v=19$m=65536,t=3,p=4$pGW5TOf55r8e0jcervzgTw$/W2UIxOVJw+jKvm3aNSi03vvRlMM4CtCnLGLqg5feRI	\N	\N	2025-11-16 14:43:45.305	2025-10-17 14:43:45.306
cmguymlnd00053lzpywi7k5ce	cmgqjqoot00043leeqba9x6d1	$argon2id$v=19$m=65536,t=3,p=4$v4sGmVkoAECCPAE6JWJHCw$d0Ueg1P2jnA3ElmvsKexfTpFnOUS9+GH7lQSaAkpJps	\N	\N	2025-11-16 14:44:34.201	2025-10-17 14:44:34.201
cmgv26lhq00053lj2j5y5schn	cmgqjqoot00043leeqba9x6d1	$argon2id$v=19$m=65536,t=3,p=4$X+2j9hi3+uBaV3N34/SpEQ$3fItrTI9XIymCdiV0oEgVgmn/MbR8rWf84shqS2Cda0	\N	\N	2025-11-16 16:24:05.966	2025-10-17 16:24:05.966
cmgxe848b000s3lpj7g5ztw7o	cmgx8kfj600003lbydkxlhqui	$argon2id$v=19$m=65536,t=3,p=4$OaVdXBvCK33apwBBXjE4EA$FeFAQRmOC9aQEJY8upTdMxWfV3wZcP3xDi8AjLVMPpE	\N	\N	2025-11-18 07:36:44.65	2025-10-19 07:36:44.651
cmgxtzlpn00013l7925h0w0nd	cmgx8kfj600003lbydkxlhqui	$argon2id$v=19$m=65536,t=3,p=4$zcWez75jhIoERjRoD1S13g$NMbywnsxuL5QG/bFFNzX5YUHR0Av7N0VaVKA5FnVs8Y	\N	\N	2025-11-18 14:58:01.257	2025-10-19 14:58:01.259
cmgyvit3b00073l79gon2lfw7	cmgyvi2zs00053l796nmye9jz	$argon2id$v=19$m=65536,t=3,p=4$/cpr0AJ9BFviuCQD0nwjkA$p4pg6ubNCIUpue7qwDrk2VZTE6E/Am79ArhaQZRnVl0	\N	\N	2025-11-19 08:28:43.077	2025-10-20 08:28:43.079
cmgyx1zvn000d3l79xgecbdwu	cmgyvi2zs00053l796nmye9jz	$argon2id$v=19$m=65536,t=3,p=4$EHSbIZRmyNB1bO4l/O8l7w$H1CXM0f/c9Hw8C5w62W0r+huG+WTWwVizA8VQB+Tv+o	\N	\N	2025-11-19 09:11:37.955	2025-10-20 09:11:37.955
\.


--
-- Data for Name: Size; Type: TABLE DATA; Schema: public; Owner: ritual
--

COPY public."Size" (id, "widthCm", "heightCm", label) FROM stdin;
5	13	19	13×19 см
17	24	18	24×18 см
30	13	18	13×18 см
8	18	24	18×24 см
26	11	15	11×15 см
6	15	11	15×11 см
32	9	12	9×12 см
11	50	70	50×70 см
28	30	40	30×40 см
14	20	25	20×25 см
23	12	9	12×9 см
22	50	100	50×100 см
13	20	30	20×30 см
27	40	60	40×60 см
24	60	120	60×120 см
25	15	20	15×20 см
15	18	13	18×13 см
1	25	30	25×30 см
3	30	60	30×60 см
31	17	22	17×22 см
10	30	20	30×20 см
2	50	80	50×80 см
20	55	80	55×80 см
7	60	40	60×40 см
4	20	15	20×15 см
29	25	20	25×20 см
21	80	50	80×50 см
19	30	25	30×25 см
12	60	100	60×100 см
16	40	30	40×30 см
18	60	30	60×30 см
9	70	50	70×50 см
\.


--
-- Data for Name: Template; Type: TABLE DATA; Schema: public; Owner: ritual
--

COPY public."Template" (id, code, label, shape, orientation, "colorMode", coverage, "supportsFrame", "requiresBackground", "requiresFinish", "supportsHoles", "personsMin", "personsMax", notes, "createdAt", "updatedAt", material, "basePriceMinor") FROM stdin;
cmfxj06440001qyf4tdpmqc9c	CERM-T-R-V-C	Табличка Т верт. цвет	RECTANGLE	VERTICAL	COLOR	NORMAL	t	f	f	t	1	1	\N	2025-09-24 05:10:49.589	2025-09-25 13:27:16.378	CERMET	0
cmfxj064g0002qyf4t8iakes9	CERM-T-R-H-BW	Табличка Т гор. ч/б	RECTANGLE	HORIZONTAL	BW	NORMAL	t	f	f	t	1	1	\N	2025-09-24 05:10:49.601	2025-09-25 13:27:16.387	CERMET	0
cmfxj064q0003qyf4jp5of5ag	CERM-T-R-H-C	Табличка Т гор. цвет	RECTANGLE	HORIZONTAL	COLOR	NORMAL	t	f	f	t	1	1	\N	2025-09-24 05:10:49.61	2025-09-25 13:27:16.397	CERMET	0
cmfxj064y0004qyf473wtlu0v	CERM-O-OV-V-BW	Овал верт. ч/б	OVAL	VERTICAL	BW	NORMAL	t	f	f	t	1	1	\N	2025-09-24 05:10:49.619	2025-09-25 13:27:16.406	CERMET	0
cmfxj065a0005qyf4x5jq9u9z	CERM-O-OV-V-C	Овал верт. цвет	OVAL	VERTICAL	COLOR	NORMAL	t	f	f	t	1	1	\N	2025-09-24 05:10:49.63	2025-09-25 13:27:16.417	CERMET	0
cmfxj065j0006qyf4l0x3wtma	CERM-O-OV-H-BW	Овал гор. ч/б	OVAL	HORIZONTAL	BW	NORMAL	t	f	f	t	1	1	\N	2025-09-24 05:10:49.64	2025-09-25 13:27:16.427	CERMET	0
cmfxj065u0007qyf4qx03pn4o	CERM-O-OV-H-C	Овал гор. цвет	OVAL	HORIZONTAL	COLOR	NORMAL	t	f	f	t	1	1	\N	2025-09-24 05:10:49.65	2025-09-25 13:27:16.438	CERMET	0
cmfxj06630008qyf4t0tqg2xg	WCG-T-R-V-BW	Керамогранит бел. табличка верт. ч/б	RECTANGLE	VERTICAL	BW	NORMAL	f	t	t	t	1	1	\N	2025-09-24 05:10:49.659	2025-09-25 13:27:16.447	WHITE_CERAMIC_GRANITE	0
cmfxj066l0009qyf4inp7dimr	WCG-T-R-V-C	Керамогранит бел. табличка верт. цвет	RECTANGLE	VERTICAL	COLOR	NORMAL	f	t	t	t	1	1	\N	2025-09-24 05:10:49.677	2025-09-25 13:27:16.464	WHITE_CERAMIC_GRANITE	0
cmfxj0671000aqyf4bjeyuyld	WCG-T-R-H-BW	Керамогранит бел. табличка гор. ч/б	RECTANGLE	HORIZONTAL	BW	NORMAL	f	t	t	t	1	1	\N	2025-09-24 05:10:49.693	2025-09-25 13:27:16.479	WHITE_CERAMIC_GRANITE	0
cmfxj067e000bqyf43t016hyf	WCG-T-R-H-C	Керамогранит бел. табличка гор. цвет	RECTANGLE	HORIZONTAL	COLOR	NORMAL	f	t	t	t	1	1	\N	2025-09-24 05:10:49.707	2025-09-25 13:27:16.497	WHITE_CERAMIC_GRANITE	0
cmfxj067s000cqyf49h06e1bz	WCG-TF-R-V-BW	Керамогранит бел. табличка полная верт. ч/б	RECTANGLE	VERTICAL	BW	FULL_WRAP	f	t	t	t	1	1	\N	2025-09-24 05:10:49.72	2025-09-25 13:27:16.515	WHITE_CERAMIC_GRANITE	0
cmfxj0687000dqyf40al7mmdm	WCG-TF-R-V-C	Керамогранит бел. табличка полная верт. цвет	RECTANGLE	VERTICAL	COLOR	FULL_WRAP	f	t	t	t	1	1	\N	2025-09-24 05:10:49.735	2025-09-25 13:27:16.533	WHITE_CERAMIC_GRANITE	0
cmfxj068z000fqyf4hfpn3hzr	WCG-TF-R-H-C	Керамогранит бел. табличка полная гор. цвет	RECTANGLE	HORIZONTAL	COLOR	FULL_WRAP	f	t	t	t	1	1	\N	2025-09-24 05:10:49.763	2025-09-25 13:27:16.566	WHITE_CERAMIC_GRANITE	0
cmfxj069c000gqyf4sx8m1y3o	WCG-O-OV-V-BW	Керамогранит бел. овал верт. ч/б	OVAL	VERTICAL	BW	NORMAL	f	t	t	t	1	1	\N	2025-09-24 05:10:49.776	2025-09-25 13:27:16.581	WHITE_CERAMIC_GRANITE	0
cmfxj069n000hqyf4jqfecti9	WCG-O-OV-V-C	Керамогранит бел. овал верт. цвет	OVAL	VERTICAL	COLOR	NORMAL	f	t	t	t	1	1	\N	2025-09-24 05:10:49.787	2025-09-25 13:27:16.594	WHITE_CERAMIC_GRANITE	0
cmfxj069y000iqyf49t2nne4b	WCG-O-OV-H-BW	Керамогранит бел. овал гор. ч/б	OVAL	HORIZONTAL	BW	NORMAL	f	t	t	t	1	1	\N	2025-09-24 05:10:49.799	2025-09-25 13:27:16.605	WHITE_CERAMIC_GRANITE	0
cmfxj06aa000jqyf42i8gaapi	WCG-O-OV-H-C	Керамогранит бел. овал гор. цвет	OVAL	HORIZONTAL	COLOR	NORMAL	f	t	t	t	1	1	\N	2025-09-24 05:10:49.81	2025-09-25 13:27:16.615	WHITE_CERAMIC_GRANITE	0
cmfxj06am000kqyf4bexungaa	WCG-A-AR-V-BW	Керамогранит бел. арка верт. ч/б	ARCH	VERTICAL	BW	NORMAL	f	t	t	t	1	1	\N	2025-09-24 05:10:49.822	2025-09-25 13:27:16.626	WHITE_CERAMIC_GRANITE	0
cmfxj06b0000lqyf4wjs9zuxt	WCG-A-AR-V-C	Керамогранит бел. арка верт. цвет	ARCH	VERTICAL	COLOR	NORMAL	f	t	t	t	1	1	\N	2025-09-24 05:10:49.836	2025-09-25 13:27:16.643	WHITE_CERAMIC_GRANITE	0
cmfxj06bd000mqyf4clxt8rld	GLS-T-R-V-BW	Стекло табличка верт. ч/б	RECTANGLE	VERTICAL	BW	NORMAL	f	t	f	t	1	1	\N	2025-09-24 05:10:49.849	2025-09-25 13:27:16.663	GLASS	0
cmfxj06bm000nqyf4506fh414	GLS-T-R-V-C	Стекло табличка верт. цвет	RECTANGLE	VERTICAL	COLOR	NORMAL	f	t	f	t	1	1	\N	2025-09-24 05:10:49.858	2025-09-25 13:27:16.677	GLASS	0
cmfxj06bw000oqyf4g79dsqjz	GLS-T-R-H-BW	Стекло табличка гор. ч/б	RECTANGLE	HORIZONTAL	BW	NORMAL	f	t	f	t	1	1	\N	2025-09-24 05:10:49.868	2025-09-25 13:27:16.69	GLASS	0
cmfxj06c5000pqyf4d2aedc5w	GLS-T-R-H-C	Стекло табличка гор. цвет	RECTANGLE	HORIZONTAL	COLOR	NORMAL	f	t	f	t	1	1	\N	2025-09-24 05:10:49.878	2025-09-25 13:27:16.703	GLASS	0
cmfxj06ce000qqyf499mks1as	GLS-O-OV-V-BW	Стекло овал верт. ч/б	OVAL	VERTICAL	BW	NORMAL	f	t	f	t	1	1	\N	2025-09-24 05:10:49.886	2025-09-25 13:27:16.716	GLASS	0
cmfxj06cm000rqyf4vk6eiayv	GLS-O-OV-V-C	Стекло овал верт. цвет	OVAL	VERTICAL	COLOR	NORMAL	f	t	f	t	1	1	\N	2025-09-24 05:10:49.894	2025-09-25 13:27:16.728	GLASS	0
cmfxj06cu000sqyf4hfkxu3cp	GLS-O-OV-H-BW	Стекло овал гор. ч/б	OVAL	HORIZONTAL	BW	NORMAL	f	t	f	t	1	1	\N	2025-09-24 05:10:49.903	2025-09-25 13:27:16.739	GLASS	0
cmfxj06d3000tqyf4e7ko0xld	GLS-O-OV-H-C	Стекло овал гор. цвет	OVAL	HORIZONTAL	COLOR	NORMAL	f	t	f	t	1	1	\N	2025-09-24 05:10:49.911	2025-09-25 13:27:16.751	GLASS	0
cmfxj06dc000uqyf4h8b7oazg	GLS-A-AR-V-BW	Стекло арка верт. ч/б	ARCH	VERTICAL	BW	NORMAL	f	t	f	t	1	1	\N	2025-09-24 05:10:49.92	2025-09-25 13:27:16.762	GLASS	0
cmfxj06dn000vqyf4o1qlkzz3	GLS-A-AR-V-C	Стекло арка верт. цвет	ARCH	VERTICAL	COLOR	NORMAL	f	t	f	t	1	1	\N	2025-09-24 05:10:49.931	2025-09-25 13:27:16.776	GLASS	0
cmfxj06dw000wqyf4992rrgnl	BCG-T-R-V-BW	Керамогранит чёрный верт. ч/б	RECTANGLE	VERTICAL	BW	NORMAL	f	f	t	t	1	1	\N	2025-09-24 05:10:49.941	2025-09-25 13:27:16.793	BLACK_CERAMIC_GRANITE	0
cmfxj06e6000xqyf4hmhzd05x	BCG-T-R-H-BW	Керамогранит чёрный гор. ч/б	RECTANGLE	HORIZONTAL	BW	NORMAL	f	f	t	t	1	1	\N	2025-09-24 05:10:49.95	2025-09-25 13:27:16.808	BLACK_CERAMIC_GRANITE	0
cmfxj06ef000yqyf4pp5gx5h1	GROWTH-R-V-C	Ростовая фотокерамика верт. цвет	RECTANGLE	VERTICAL	COLOR	NORMAL	f	f	t	t	1	1	\N	2025-09-24 05:10:49.959	2025-09-25 13:27:16.825	GROWTH_PHOTOCERAMICS	0
cmfxj06ep000zqyf42im6zh2b	GROWTH-R-H-C	Ростовая фотокерамика гор. цвет	RECTANGLE	HORIZONTAL	COLOR	NORMAL	f	f	t	t	1	1	\N	2025-09-24 05:10:49.97	2025-09-25 13:27:16.837	GROWTH_PHOTOCERAMICS	0
cmfxj06ew0010qyf46rabniha	ENGR-R-V-BW	Гравировка верт. ч/б	RECTANGLE	VERTICAL	BW	NORMAL	f	f	f	t	1	1	\N	2025-09-24 05:10:49.977	2025-09-25 13:27:16.847	ENGRAVING	0
cmfxj06f20011qyf456y34hfv	ENGR-R-H-BW	Гравировка гор. ч/б	RECTANGLE	HORIZONTAL	BW	NORMAL	f	f	f	t	1	1	\N	2025-09-24 05:10:49.983	2025-09-25 13:27:16.854	ENGRAVING	0
cmfxj068l000eqyf4iv29u1kz	WCG-TF-R-H-BW	Керамогранит бел. табличка полная гор. ч/б	RECTANGLE	HORIZONTAL	BW	FULL_WRAP	f	t	t	t	1	1	\N	2025-09-24 05:10:49.75	2025-10-13 05:58:42.759	WHITE_CERAMIC_GRANITE	4285
cmfxj063i0000qyf4ptstwhkl	CERM-T-R-V-BW	Табличка Т верт. ч/б	RECTANGLE	VERTICAL	BW	NORMAL	t	f	f	t	1	1	\N	2025-09-24 05:10:49.567	2025-10-13 05:51:17.927	CERMET	1000
\.


--
-- Data for Name: TemplateBackground; Type: TABLE DATA; Schema: public; Owner: ritual
--

COPY public."TemplateBackground" ("templateId", "backgroundId", "extraPriceMinor") FROM stdin;
cmfxj063i0000qyf4ptstwhkl	1	0
cmfxj063i0000qyf4ptstwhkl	2	0
cmfxj063i0000qyf4ptstwhkl	4	0
cmfxj063i0000qyf4ptstwhkl	5	0
cmfxj063i0000qyf4ptstwhkl	7	0
cmfxj063i0000qyf4ptstwhkl	10	0
cmfxj063i0000qyf4ptstwhkl	12	0
cmfxj063i0000qyf4ptstwhkl	13	0
cmfxj063i0000qyf4ptstwhkl	21	0
cmfxj063i0000qyf4ptstwhkl	23	0
cmfxj063i0000qyf4ptstwhkl	31	0
cmfxj063i0000qyf4ptstwhkl	32	0
cmfxj063i0000qyf4ptstwhkl	34	0
cmfxj063i0000qyf4ptstwhkl	36	0
cmfxj06440001qyf4tdpmqc9c	1	0
cmfxj06440001qyf4tdpmqc9c	2	0
cmfxj06440001qyf4tdpmqc9c	4	0
cmfxj06440001qyf4tdpmqc9c	5	0
cmfxj06440001qyf4tdpmqc9c	7	0
cmfxj06440001qyf4tdpmqc9c	10	0
cmfxj06440001qyf4tdpmqc9c	12	0
cmfxj06440001qyf4tdpmqc9c	13	0
cmfxj06440001qyf4tdpmqc9c	21	0
cmfxj06440001qyf4tdpmqc9c	23	0
cmfxj06440001qyf4tdpmqc9c	31	0
cmfxj06440001qyf4tdpmqc9c	32	0
cmfxj06440001qyf4tdpmqc9c	34	0
cmfxj06440001qyf4tdpmqc9c	36	0
cmfxj064g0002qyf4t8iakes9	1	0
cmfxj064g0002qyf4t8iakes9	2	0
cmfxj064g0002qyf4t8iakes9	4	0
cmfxj064g0002qyf4t8iakes9	5	0
cmfxj064g0002qyf4t8iakes9	7	0
cmfxj064g0002qyf4t8iakes9	10	0
cmfxj064g0002qyf4t8iakes9	12	0
cmfxj064g0002qyf4t8iakes9	13	0
cmfxj064g0002qyf4t8iakes9	21	0
cmfxj064g0002qyf4t8iakes9	23	0
cmfxj064g0002qyf4t8iakes9	31	0
cmfxj064g0002qyf4t8iakes9	32	0
cmfxj064g0002qyf4t8iakes9	34	0
cmfxj064g0002qyf4t8iakes9	36	0
cmfxj064q0003qyf4jp5of5ag	1	0
cmfxj064q0003qyf4jp5of5ag	2	0
cmfxj064q0003qyf4jp5of5ag	4	0
cmfxj064q0003qyf4jp5of5ag	5	0
cmfxj064q0003qyf4jp5of5ag	7	0
cmfxj064q0003qyf4jp5of5ag	10	0
cmfxj064q0003qyf4jp5of5ag	12	0
cmfxj064q0003qyf4jp5of5ag	13	0
cmfxj064q0003qyf4jp5of5ag	21	0
cmfxj064q0003qyf4jp5of5ag	23	0
cmfxj064q0003qyf4jp5of5ag	31	0
cmfxj064q0003qyf4jp5of5ag	32	0
cmfxj064q0003qyf4jp5of5ag	34	0
cmfxj064q0003qyf4jp5of5ag	36	0
cmfxj064y0004qyf473wtlu0v	1	0
cmfxj064y0004qyf473wtlu0v	2	0
cmfxj064y0004qyf473wtlu0v	3	0
cmfxj064y0004qyf473wtlu0v	4	0
cmfxj064y0004qyf473wtlu0v	5	0
cmfxj064y0004qyf473wtlu0v	6	0
cmfxj064y0004qyf473wtlu0v	7	0
cmfxj064y0004qyf473wtlu0v	8	0
cmfxj064y0004qyf473wtlu0v	9	0
cmfxj064y0004qyf473wtlu0v	10	0
cmfxj064y0004qyf473wtlu0v	11	0
cmfxj064y0004qyf473wtlu0v	12	0
cmfxj064y0004qyf473wtlu0v	13	0
cmfxj064y0004qyf473wtlu0v	14	0
cmfxj064y0004qyf473wtlu0v	15	0
cmfxj064y0004qyf473wtlu0v	16	0
cmfxj064y0004qyf473wtlu0v	17	0
cmfxj064y0004qyf473wtlu0v	18	0
cmfxj064y0004qyf473wtlu0v	19	0
cmfxj064y0004qyf473wtlu0v	20	0
cmfxj064y0004qyf473wtlu0v	21	0
cmfxj064y0004qyf473wtlu0v	22	0
cmfxj064y0004qyf473wtlu0v	23	0
cmfxj064y0004qyf473wtlu0v	24	0
cmfxj064y0004qyf473wtlu0v	25	0
cmfxj064y0004qyf473wtlu0v	26	0
cmfxj064y0004qyf473wtlu0v	27	0
cmfxj064y0004qyf473wtlu0v	28	0
cmfxj064y0004qyf473wtlu0v	29	0
cmfxj064y0004qyf473wtlu0v	30	0
cmfxj064y0004qyf473wtlu0v	31	0
cmfxj064y0004qyf473wtlu0v	32	0
cmfxj064y0004qyf473wtlu0v	33	0
cmfxj064y0004qyf473wtlu0v	34	0
cmfxj064y0004qyf473wtlu0v	35	0
cmfxj064y0004qyf473wtlu0v	36	0
cmfxj064y0004qyf473wtlu0v	37	0
cmfxj064y0004qyf473wtlu0v	38	0
cmfxj065a0005qyf4x5jq9u9z	1	0
cmfxj065a0005qyf4x5jq9u9z	2	0
cmfxj065a0005qyf4x5jq9u9z	3	0
cmfxj065a0005qyf4x5jq9u9z	4	0
cmfxj065a0005qyf4x5jq9u9z	5	0
cmfxj065a0005qyf4x5jq9u9z	6	0
cmfxj065a0005qyf4x5jq9u9z	7	0
cmfxj065a0005qyf4x5jq9u9z	8	0
cmfxj065a0005qyf4x5jq9u9z	9	0
cmfxj065a0005qyf4x5jq9u9z	10	0
cmfxj065a0005qyf4x5jq9u9z	11	0
cmfxj065a0005qyf4x5jq9u9z	12	0
cmfxj065a0005qyf4x5jq9u9z	13	0
cmfxj065a0005qyf4x5jq9u9z	14	0
cmfxj065a0005qyf4x5jq9u9z	15	0
cmfxj065a0005qyf4x5jq9u9z	16	0
cmfxj065a0005qyf4x5jq9u9z	17	0
cmfxj065a0005qyf4x5jq9u9z	18	0
cmfxj065a0005qyf4x5jq9u9z	19	0
cmfxj065a0005qyf4x5jq9u9z	20	0
cmfxj065a0005qyf4x5jq9u9z	21	0
cmfxj065a0005qyf4x5jq9u9z	22	0
cmfxj065a0005qyf4x5jq9u9z	23	0
cmfxj065a0005qyf4x5jq9u9z	24	0
cmfxj065a0005qyf4x5jq9u9z	25	0
cmfxj065a0005qyf4x5jq9u9z	26	0
cmfxj065a0005qyf4x5jq9u9z	27	0
cmfxj065a0005qyf4x5jq9u9z	28	0
cmfxj065a0005qyf4x5jq9u9z	29	0
cmfxj065a0005qyf4x5jq9u9z	30	0
cmfxj065a0005qyf4x5jq9u9z	31	0
cmfxj065a0005qyf4x5jq9u9z	32	0
cmfxj065a0005qyf4x5jq9u9z	33	0
cmfxj065a0005qyf4x5jq9u9z	34	0
cmfxj065a0005qyf4x5jq9u9z	35	0
cmfxj065a0005qyf4x5jq9u9z	36	0
cmfxj065a0005qyf4x5jq9u9z	37	0
cmfxj065a0005qyf4x5jq9u9z	38	0
cmfxj065j0006qyf4l0x3wtma	1	0
cmfxj065j0006qyf4l0x3wtma	2	0
cmfxj065j0006qyf4l0x3wtma	3	0
cmfxj065j0006qyf4l0x3wtma	4	0
cmfxj065j0006qyf4l0x3wtma	5	0
cmfxj065j0006qyf4l0x3wtma	6	0
cmfxj065j0006qyf4l0x3wtma	7	0
cmfxj065j0006qyf4l0x3wtma	8	0
cmfxj065j0006qyf4l0x3wtma	9	0
cmfxj065j0006qyf4l0x3wtma	10	0
cmfxj065j0006qyf4l0x3wtma	11	0
cmfxj065j0006qyf4l0x3wtma	12	0
cmfxj065j0006qyf4l0x3wtma	13	0
cmfxj065j0006qyf4l0x3wtma	14	0
cmfxj065j0006qyf4l0x3wtma	15	0
cmfxj065j0006qyf4l0x3wtma	16	0
cmfxj065j0006qyf4l0x3wtma	17	0
cmfxj065j0006qyf4l0x3wtma	18	0
cmfxj065j0006qyf4l0x3wtma	19	0
cmfxj065j0006qyf4l0x3wtma	20	0
cmfxj065j0006qyf4l0x3wtma	21	0
cmfxj065j0006qyf4l0x3wtma	22	0
cmfxj065j0006qyf4l0x3wtma	23	0
cmfxj065j0006qyf4l0x3wtma	24	0
cmfxj065j0006qyf4l0x3wtma	25	0
cmfxj065j0006qyf4l0x3wtma	26	0
cmfxj065j0006qyf4l0x3wtma	27	0
cmfxj065j0006qyf4l0x3wtma	28	0
cmfxj065j0006qyf4l0x3wtma	29	0
cmfxj065j0006qyf4l0x3wtma	30	0
cmfxj065j0006qyf4l0x3wtma	31	0
cmfxj065j0006qyf4l0x3wtma	32	0
cmfxj065j0006qyf4l0x3wtma	33	0
cmfxj065j0006qyf4l0x3wtma	34	0
cmfxj065j0006qyf4l0x3wtma	35	0
cmfxj065j0006qyf4l0x3wtma	36	0
cmfxj065j0006qyf4l0x3wtma	37	0
cmfxj065j0006qyf4l0x3wtma	38	0
cmfxj065u0007qyf4qx03pn4o	1	0
cmfxj065u0007qyf4qx03pn4o	2	0
cmfxj065u0007qyf4qx03pn4o	3	0
cmfxj065u0007qyf4qx03pn4o	4	0
cmfxj065u0007qyf4qx03pn4o	5	0
cmfxj065u0007qyf4qx03pn4o	6	0
cmfxj065u0007qyf4qx03pn4o	7	0
cmfxj065u0007qyf4qx03pn4o	8	0
cmfxj065u0007qyf4qx03pn4o	9	0
cmfxj065u0007qyf4qx03pn4o	10	0
cmfxj065u0007qyf4qx03pn4o	11	0
cmfxj065u0007qyf4qx03pn4o	12	0
cmfxj065u0007qyf4qx03pn4o	13	0
cmfxj065u0007qyf4qx03pn4o	14	0
cmfxj065u0007qyf4qx03pn4o	15	0
cmfxj065u0007qyf4qx03pn4o	16	0
cmfxj065u0007qyf4qx03pn4o	17	0
cmfxj065u0007qyf4qx03pn4o	18	0
cmfxj065u0007qyf4qx03pn4o	19	0
cmfxj065u0007qyf4qx03pn4o	20	0
cmfxj065u0007qyf4qx03pn4o	21	0
cmfxj065u0007qyf4qx03pn4o	22	0
cmfxj065u0007qyf4qx03pn4o	23	0
cmfxj065u0007qyf4qx03pn4o	24	0
cmfxj065u0007qyf4qx03pn4o	25	0
cmfxj065u0007qyf4qx03pn4o	26	0
cmfxj065u0007qyf4qx03pn4o	27	0
cmfxj065u0007qyf4qx03pn4o	28	0
cmfxj065u0007qyf4qx03pn4o	29	0
cmfxj065u0007qyf4qx03pn4o	30	0
cmfxj065u0007qyf4qx03pn4o	31	0
cmfxj065u0007qyf4qx03pn4o	32	0
cmfxj065u0007qyf4qx03pn4o	33	0
cmfxj065u0007qyf4qx03pn4o	34	0
cmfxj065u0007qyf4qx03pn4o	35	0
cmfxj065u0007qyf4qx03pn4o	36	0
cmfxj065u0007qyf4qx03pn4o	37	0
cmfxj065u0007qyf4qx03pn4o	38	0
cmfxj06630008qyf4t0tqg2xg	1	0
cmfxj06630008qyf4t0tqg2xg	2	0
cmfxj06630008qyf4t0tqg2xg	3	0
cmfxj06630008qyf4t0tqg2xg	4	0
cmfxj06630008qyf4t0tqg2xg	5	0
cmfxj06630008qyf4t0tqg2xg	6	0
cmfxj06630008qyf4t0tqg2xg	7	0
cmfxj06630008qyf4t0tqg2xg	8	0
cmfxj06630008qyf4t0tqg2xg	9	0
cmfxj06630008qyf4t0tqg2xg	10	0
cmfxj06630008qyf4t0tqg2xg	11	0
cmfxj06630008qyf4t0tqg2xg	12	0
cmfxj06630008qyf4t0tqg2xg	13	0
cmfxj06630008qyf4t0tqg2xg	14	0
cmfxj06630008qyf4t0tqg2xg	15	0
cmfxj06630008qyf4t0tqg2xg	16	0
cmfxj06630008qyf4t0tqg2xg	17	0
cmfxj06630008qyf4t0tqg2xg	18	0
cmfxj06630008qyf4t0tqg2xg	19	0
cmfxj06630008qyf4t0tqg2xg	20	0
cmfxj06630008qyf4t0tqg2xg	21	0
cmfxj06630008qyf4t0tqg2xg	22	0
cmfxj06630008qyf4t0tqg2xg	23	0
cmfxj06630008qyf4t0tqg2xg	24	0
cmfxj06630008qyf4t0tqg2xg	25	0
cmfxj06630008qyf4t0tqg2xg	26	0
cmfxj06630008qyf4t0tqg2xg	27	0
cmfxj06630008qyf4t0tqg2xg	28	0
cmfxj06630008qyf4t0tqg2xg	29	0
cmfxj06630008qyf4t0tqg2xg	30	0
cmfxj06630008qyf4t0tqg2xg	31	0
cmfxj06630008qyf4t0tqg2xg	32	0
cmfxj06630008qyf4t0tqg2xg	33	0
cmfxj06630008qyf4t0tqg2xg	34	0
cmfxj06630008qyf4t0tqg2xg	35	0
cmfxj06630008qyf4t0tqg2xg	36	0
cmfxj06630008qyf4t0tqg2xg	37	0
cmfxj06630008qyf4t0tqg2xg	38	0
cmfxj066l0009qyf4inp7dimr	1	0
cmfxj066l0009qyf4inp7dimr	2	0
cmfxj066l0009qyf4inp7dimr	3	0
cmfxj066l0009qyf4inp7dimr	4	0
cmfxj066l0009qyf4inp7dimr	5	0
cmfxj066l0009qyf4inp7dimr	6	0
cmfxj066l0009qyf4inp7dimr	7	0
cmfxj066l0009qyf4inp7dimr	8	0
cmfxj066l0009qyf4inp7dimr	9	0
cmfxj066l0009qyf4inp7dimr	10	0
cmfxj066l0009qyf4inp7dimr	11	0
cmfxj066l0009qyf4inp7dimr	12	0
cmfxj066l0009qyf4inp7dimr	13	0
cmfxj066l0009qyf4inp7dimr	14	0
cmfxj066l0009qyf4inp7dimr	15	0
cmfxj066l0009qyf4inp7dimr	16	0
cmfxj066l0009qyf4inp7dimr	17	0
cmfxj066l0009qyf4inp7dimr	18	0
cmfxj066l0009qyf4inp7dimr	19	0
cmfxj066l0009qyf4inp7dimr	20	0
cmfxj066l0009qyf4inp7dimr	21	0
cmfxj066l0009qyf4inp7dimr	22	0
cmfxj066l0009qyf4inp7dimr	23	0
cmfxj066l0009qyf4inp7dimr	24	0
cmfxj066l0009qyf4inp7dimr	25	0
cmfxj066l0009qyf4inp7dimr	26	0
cmfxj066l0009qyf4inp7dimr	27	0
cmfxj066l0009qyf4inp7dimr	28	0
cmfxj066l0009qyf4inp7dimr	29	0
cmfxj066l0009qyf4inp7dimr	30	0
cmfxj066l0009qyf4inp7dimr	31	0
cmfxj066l0009qyf4inp7dimr	32	0
cmfxj066l0009qyf4inp7dimr	33	0
cmfxj066l0009qyf4inp7dimr	34	0
cmfxj066l0009qyf4inp7dimr	35	0
cmfxj066l0009qyf4inp7dimr	36	0
cmfxj066l0009qyf4inp7dimr	37	0
cmfxj066l0009qyf4inp7dimr	38	0
cmfxj0671000aqyf4bjeyuyld	1	0
cmfxj0671000aqyf4bjeyuyld	2	0
cmfxj0671000aqyf4bjeyuyld	3	0
cmfxj0671000aqyf4bjeyuyld	4	0
cmfxj0671000aqyf4bjeyuyld	5	0
cmfxj0671000aqyf4bjeyuyld	6	0
cmfxj0671000aqyf4bjeyuyld	7	0
cmfxj0671000aqyf4bjeyuyld	8	0
cmfxj0671000aqyf4bjeyuyld	9	0
cmfxj0671000aqyf4bjeyuyld	10	0
cmfxj0671000aqyf4bjeyuyld	11	0
cmfxj0671000aqyf4bjeyuyld	12	0
cmfxj0671000aqyf4bjeyuyld	13	0
cmfxj0671000aqyf4bjeyuyld	14	0
cmfxj0671000aqyf4bjeyuyld	15	0
cmfxj0671000aqyf4bjeyuyld	16	0
cmfxj0671000aqyf4bjeyuyld	17	0
cmfxj0671000aqyf4bjeyuyld	18	0
cmfxj0671000aqyf4bjeyuyld	19	0
cmfxj0671000aqyf4bjeyuyld	20	0
cmfxj0671000aqyf4bjeyuyld	21	0
cmfxj0671000aqyf4bjeyuyld	22	0
cmfxj0671000aqyf4bjeyuyld	23	0
cmfxj0671000aqyf4bjeyuyld	24	0
cmfxj0671000aqyf4bjeyuyld	25	0
cmfxj0671000aqyf4bjeyuyld	26	0
cmfxj0671000aqyf4bjeyuyld	27	0
cmfxj0671000aqyf4bjeyuyld	28	0
cmfxj0671000aqyf4bjeyuyld	29	0
cmfxj0671000aqyf4bjeyuyld	30	0
cmfxj0671000aqyf4bjeyuyld	31	0
cmfxj0671000aqyf4bjeyuyld	32	0
cmfxj0671000aqyf4bjeyuyld	33	0
cmfxj0671000aqyf4bjeyuyld	34	0
cmfxj0671000aqyf4bjeyuyld	35	0
cmfxj0671000aqyf4bjeyuyld	36	0
cmfxj0671000aqyf4bjeyuyld	37	0
cmfxj0671000aqyf4bjeyuyld	38	0
cmfxj067e000bqyf43t016hyf	1	0
cmfxj067e000bqyf43t016hyf	2	0
cmfxj067e000bqyf43t016hyf	3	0
cmfxj067e000bqyf43t016hyf	4	0
cmfxj067e000bqyf43t016hyf	5	0
cmfxj067e000bqyf43t016hyf	6	0
cmfxj067e000bqyf43t016hyf	7	0
cmfxj067e000bqyf43t016hyf	8	0
cmfxj067e000bqyf43t016hyf	9	0
cmfxj067e000bqyf43t016hyf	10	0
cmfxj067e000bqyf43t016hyf	11	0
cmfxj067e000bqyf43t016hyf	12	0
cmfxj067e000bqyf43t016hyf	13	0
cmfxj067e000bqyf43t016hyf	14	0
cmfxj067e000bqyf43t016hyf	15	0
cmfxj067e000bqyf43t016hyf	16	0
cmfxj067e000bqyf43t016hyf	17	0
cmfxj067e000bqyf43t016hyf	18	0
cmfxj067e000bqyf43t016hyf	19	0
cmfxj067e000bqyf43t016hyf	20	0
cmfxj067e000bqyf43t016hyf	21	0
cmfxj067e000bqyf43t016hyf	22	0
cmfxj067e000bqyf43t016hyf	23	0
cmfxj067e000bqyf43t016hyf	24	0
cmfxj067e000bqyf43t016hyf	25	0
cmfxj067e000bqyf43t016hyf	26	0
cmfxj067e000bqyf43t016hyf	27	0
cmfxj067e000bqyf43t016hyf	28	0
cmfxj067e000bqyf43t016hyf	29	0
cmfxj067e000bqyf43t016hyf	30	0
cmfxj067e000bqyf43t016hyf	31	0
cmfxj067e000bqyf43t016hyf	32	0
cmfxj067e000bqyf43t016hyf	33	0
cmfxj067e000bqyf43t016hyf	34	0
cmfxj067e000bqyf43t016hyf	35	0
cmfxj067e000bqyf43t016hyf	36	0
cmfxj067e000bqyf43t016hyf	37	0
cmfxj067e000bqyf43t016hyf	38	0
cmfxj067s000cqyf49h06e1bz	1	0
cmfxj067s000cqyf49h06e1bz	2	0
cmfxj067s000cqyf49h06e1bz	3	0
cmfxj067s000cqyf49h06e1bz	4	0
cmfxj067s000cqyf49h06e1bz	5	0
cmfxj067s000cqyf49h06e1bz	6	0
cmfxj067s000cqyf49h06e1bz	7	0
cmfxj067s000cqyf49h06e1bz	8	0
cmfxj067s000cqyf49h06e1bz	9	0
cmfxj067s000cqyf49h06e1bz	10	0
cmfxj067s000cqyf49h06e1bz	11	0
cmfxj067s000cqyf49h06e1bz	12	0
cmfxj067s000cqyf49h06e1bz	13	0
cmfxj067s000cqyf49h06e1bz	14	0
cmfxj067s000cqyf49h06e1bz	15	0
cmfxj067s000cqyf49h06e1bz	16	0
cmfxj067s000cqyf49h06e1bz	17	0
cmfxj067s000cqyf49h06e1bz	18	0
cmfxj067s000cqyf49h06e1bz	19	0
cmfxj067s000cqyf49h06e1bz	20	0
cmfxj067s000cqyf49h06e1bz	21	0
cmfxj067s000cqyf49h06e1bz	22	0
cmfxj067s000cqyf49h06e1bz	23	0
cmfxj067s000cqyf49h06e1bz	24	0
cmfxj067s000cqyf49h06e1bz	25	0
cmfxj067s000cqyf49h06e1bz	26	0
cmfxj067s000cqyf49h06e1bz	27	0
cmfxj067s000cqyf49h06e1bz	28	0
cmfxj067s000cqyf49h06e1bz	29	0
cmfxj067s000cqyf49h06e1bz	30	0
cmfxj067s000cqyf49h06e1bz	31	0
cmfxj067s000cqyf49h06e1bz	32	0
cmfxj067s000cqyf49h06e1bz	33	0
cmfxj067s000cqyf49h06e1bz	34	0
cmfxj067s000cqyf49h06e1bz	35	0
cmfxj067s000cqyf49h06e1bz	36	0
cmfxj067s000cqyf49h06e1bz	37	0
cmfxj067s000cqyf49h06e1bz	38	0
cmfxj0687000dqyf40al7mmdm	1	0
cmfxj0687000dqyf40al7mmdm	2	0
cmfxj0687000dqyf40al7mmdm	3	0
cmfxj0687000dqyf40al7mmdm	4	0
cmfxj0687000dqyf40al7mmdm	5	0
cmfxj0687000dqyf40al7mmdm	6	0
cmfxj0687000dqyf40al7mmdm	7	0
cmfxj0687000dqyf40al7mmdm	8	0
cmfxj0687000dqyf40al7mmdm	9	0
cmfxj0687000dqyf40al7mmdm	10	0
cmfxj0687000dqyf40al7mmdm	11	0
cmfxj0687000dqyf40al7mmdm	12	0
cmfxj0687000dqyf40al7mmdm	13	0
cmfxj0687000dqyf40al7mmdm	14	0
cmfxj0687000dqyf40al7mmdm	15	0
cmfxj0687000dqyf40al7mmdm	16	0
cmfxj0687000dqyf40al7mmdm	17	0
cmfxj0687000dqyf40al7mmdm	18	0
cmfxj0687000dqyf40al7mmdm	19	0
cmfxj0687000dqyf40al7mmdm	20	0
cmfxj0687000dqyf40al7mmdm	21	0
cmfxj0687000dqyf40al7mmdm	22	0
cmfxj0687000dqyf40al7mmdm	23	0
cmfxj0687000dqyf40al7mmdm	24	0
cmfxj0687000dqyf40al7mmdm	25	0
cmfxj0687000dqyf40al7mmdm	26	0
cmfxj0687000dqyf40al7mmdm	27	0
cmfxj0687000dqyf40al7mmdm	28	0
cmfxj0687000dqyf40al7mmdm	29	0
cmfxj0687000dqyf40al7mmdm	30	0
cmfxj0687000dqyf40al7mmdm	31	0
cmfxj0687000dqyf40al7mmdm	32	0
cmfxj0687000dqyf40al7mmdm	33	0
cmfxj0687000dqyf40al7mmdm	34	0
cmfxj0687000dqyf40al7mmdm	35	0
cmfxj0687000dqyf40al7mmdm	36	0
cmfxj0687000dqyf40al7mmdm	37	0
cmfxj0687000dqyf40al7mmdm	38	0
cmfxj068l000eqyf4iv29u1kz	1	0
cmfxj068l000eqyf4iv29u1kz	2	0
cmfxj068l000eqyf4iv29u1kz	3	0
cmfxj068l000eqyf4iv29u1kz	4	0
cmfxj068l000eqyf4iv29u1kz	5	0
cmfxj068l000eqyf4iv29u1kz	6	0
cmfxj068l000eqyf4iv29u1kz	7	0
cmfxj068l000eqyf4iv29u1kz	8	0
cmfxj068l000eqyf4iv29u1kz	9	0
cmfxj068l000eqyf4iv29u1kz	10	0
cmfxj068l000eqyf4iv29u1kz	11	0
cmfxj068l000eqyf4iv29u1kz	12	0
cmfxj068l000eqyf4iv29u1kz	13	0
cmfxj068l000eqyf4iv29u1kz	14	0
cmfxj068l000eqyf4iv29u1kz	15	0
cmfxj068l000eqyf4iv29u1kz	16	0
cmfxj068l000eqyf4iv29u1kz	17	0
cmfxj068l000eqyf4iv29u1kz	18	0
cmfxj068l000eqyf4iv29u1kz	19	0
cmfxj068l000eqyf4iv29u1kz	20	0
cmfxj068l000eqyf4iv29u1kz	21	0
cmfxj068l000eqyf4iv29u1kz	22	0
cmfxj068l000eqyf4iv29u1kz	23	0
cmfxj068l000eqyf4iv29u1kz	24	0
cmfxj068l000eqyf4iv29u1kz	25	0
cmfxj068l000eqyf4iv29u1kz	26	0
cmfxj068l000eqyf4iv29u1kz	27	0
cmfxj068l000eqyf4iv29u1kz	28	0
cmfxj068l000eqyf4iv29u1kz	29	0
cmfxj068l000eqyf4iv29u1kz	30	0
cmfxj068l000eqyf4iv29u1kz	31	0
cmfxj068l000eqyf4iv29u1kz	32	0
cmfxj068l000eqyf4iv29u1kz	33	0
cmfxj068l000eqyf4iv29u1kz	34	0
cmfxj068l000eqyf4iv29u1kz	35	0
cmfxj068l000eqyf4iv29u1kz	36	0
cmfxj068l000eqyf4iv29u1kz	37	0
cmfxj068l000eqyf4iv29u1kz	38	0
cmfxj068z000fqyf4hfpn3hzr	1	0
cmfxj068z000fqyf4hfpn3hzr	2	0
cmfxj068z000fqyf4hfpn3hzr	3	0
cmfxj068z000fqyf4hfpn3hzr	4	0
cmfxj068z000fqyf4hfpn3hzr	5	0
cmfxj068z000fqyf4hfpn3hzr	6	0
cmfxj068z000fqyf4hfpn3hzr	7	0
cmfxj068z000fqyf4hfpn3hzr	8	0
cmfxj068z000fqyf4hfpn3hzr	9	0
cmfxj068z000fqyf4hfpn3hzr	10	0
cmfxj068z000fqyf4hfpn3hzr	11	0
cmfxj068z000fqyf4hfpn3hzr	12	0
cmfxj068z000fqyf4hfpn3hzr	13	0
cmfxj068z000fqyf4hfpn3hzr	14	0
cmfxj068z000fqyf4hfpn3hzr	15	0
cmfxj068z000fqyf4hfpn3hzr	16	0
cmfxj068z000fqyf4hfpn3hzr	17	0
cmfxj068z000fqyf4hfpn3hzr	18	0
cmfxj068z000fqyf4hfpn3hzr	19	0
cmfxj068z000fqyf4hfpn3hzr	20	0
cmfxj068z000fqyf4hfpn3hzr	21	0
cmfxj068z000fqyf4hfpn3hzr	22	0
cmfxj068z000fqyf4hfpn3hzr	23	0
cmfxj068z000fqyf4hfpn3hzr	24	0
cmfxj068z000fqyf4hfpn3hzr	25	0
cmfxj068z000fqyf4hfpn3hzr	26	0
cmfxj068z000fqyf4hfpn3hzr	27	0
cmfxj068z000fqyf4hfpn3hzr	28	0
cmfxj068z000fqyf4hfpn3hzr	29	0
cmfxj068z000fqyf4hfpn3hzr	30	0
cmfxj068z000fqyf4hfpn3hzr	31	0
cmfxj068z000fqyf4hfpn3hzr	32	0
cmfxj068z000fqyf4hfpn3hzr	33	0
cmfxj068z000fqyf4hfpn3hzr	34	0
cmfxj068z000fqyf4hfpn3hzr	35	0
cmfxj068z000fqyf4hfpn3hzr	36	0
cmfxj068z000fqyf4hfpn3hzr	37	0
cmfxj068z000fqyf4hfpn3hzr	38	0
cmfxj069c000gqyf4sx8m1y3o	1	0
cmfxj069c000gqyf4sx8m1y3o	2	0
cmfxj069c000gqyf4sx8m1y3o	3	0
cmfxj069c000gqyf4sx8m1y3o	4	0
cmfxj069c000gqyf4sx8m1y3o	5	0
cmfxj069c000gqyf4sx8m1y3o	6	0
cmfxj069c000gqyf4sx8m1y3o	7	0
cmfxj069c000gqyf4sx8m1y3o	8	0
cmfxj069c000gqyf4sx8m1y3o	9	0
cmfxj069c000gqyf4sx8m1y3o	10	0
cmfxj069c000gqyf4sx8m1y3o	11	0
cmfxj069c000gqyf4sx8m1y3o	12	0
cmfxj069c000gqyf4sx8m1y3o	13	0
cmfxj069c000gqyf4sx8m1y3o	14	0
cmfxj069c000gqyf4sx8m1y3o	15	0
cmfxj069c000gqyf4sx8m1y3o	16	0
cmfxj069c000gqyf4sx8m1y3o	17	0
cmfxj069c000gqyf4sx8m1y3o	18	0
cmfxj069c000gqyf4sx8m1y3o	19	0
cmfxj069c000gqyf4sx8m1y3o	20	0
cmfxj069c000gqyf4sx8m1y3o	21	0
cmfxj069c000gqyf4sx8m1y3o	22	0
cmfxj069c000gqyf4sx8m1y3o	23	0
cmfxj069c000gqyf4sx8m1y3o	24	0
cmfxj069c000gqyf4sx8m1y3o	25	0
cmfxj069c000gqyf4sx8m1y3o	26	0
cmfxj069c000gqyf4sx8m1y3o	27	0
cmfxj069c000gqyf4sx8m1y3o	28	0
cmfxj069c000gqyf4sx8m1y3o	29	0
cmfxj069c000gqyf4sx8m1y3o	30	0
cmfxj069c000gqyf4sx8m1y3o	31	0
cmfxj069c000gqyf4sx8m1y3o	32	0
cmfxj069c000gqyf4sx8m1y3o	33	0
cmfxj069c000gqyf4sx8m1y3o	34	0
cmfxj069c000gqyf4sx8m1y3o	35	0
cmfxj069c000gqyf4sx8m1y3o	36	0
cmfxj069c000gqyf4sx8m1y3o	37	0
cmfxj069c000gqyf4sx8m1y3o	38	0
cmfxj069n000hqyf4jqfecti9	1	0
cmfxj069n000hqyf4jqfecti9	2	0
cmfxj069n000hqyf4jqfecti9	3	0
cmfxj069n000hqyf4jqfecti9	4	0
cmfxj069n000hqyf4jqfecti9	5	0
cmfxj069n000hqyf4jqfecti9	6	0
cmfxj069n000hqyf4jqfecti9	7	0
cmfxj069n000hqyf4jqfecti9	8	0
cmfxj069n000hqyf4jqfecti9	9	0
cmfxj069n000hqyf4jqfecti9	10	0
cmfxj069n000hqyf4jqfecti9	11	0
cmfxj069n000hqyf4jqfecti9	12	0
cmfxj069n000hqyf4jqfecti9	13	0
cmfxj069n000hqyf4jqfecti9	14	0
cmfxj069n000hqyf4jqfecti9	15	0
cmfxj069n000hqyf4jqfecti9	16	0
cmfxj069n000hqyf4jqfecti9	17	0
cmfxj069n000hqyf4jqfecti9	18	0
cmfxj069n000hqyf4jqfecti9	19	0
cmfxj069n000hqyf4jqfecti9	20	0
cmfxj069n000hqyf4jqfecti9	21	0
cmfxj069n000hqyf4jqfecti9	22	0
cmfxj069n000hqyf4jqfecti9	23	0
cmfxj069n000hqyf4jqfecti9	24	0
cmfxj069n000hqyf4jqfecti9	25	0
cmfxj069n000hqyf4jqfecti9	26	0
cmfxj069n000hqyf4jqfecti9	27	0
cmfxj069n000hqyf4jqfecti9	28	0
cmfxj069n000hqyf4jqfecti9	29	0
cmfxj069n000hqyf4jqfecti9	30	0
cmfxj069n000hqyf4jqfecti9	31	0
cmfxj069n000hqyf4jqfecti9	32	0
cmfxj069n000hqyf4jqfecti9	33	0
cmfxj069n000hqyf4jqfecti9	34	0
cmfxj069n000hqyf4jqfecti9	35	0
cmfxj069n000hqyf4jqfecti9	36	0
cmfxj069n000hqyf4jqfecti9	37	0
cmfxj069n000hqyf4jqfecti9	38	0
cmfxj069y000iqyf49t2nne4b	1	0
cmfxj069y000iqyf49t2nne4b	2	0
cmfxj069y000iqyf49t2nne4b	3	0
cmfxj069y000iqyf49t2nne4b	4	0
cmfxj069y000iqyf49t2nne4b	5	0
cmfxj069y000iqyf49t2nne4b	6	0
cmfxj069y000iqyf49t2nne4b	7	0
cmfxj069y000iqyf49t2nne4b	8	0
cmfxj069y000iqyf49t2nne4b	9	0
cmfxj069y000iqyf49t2nne4b	10	0
cmfxj069y000iqyf49t2nne4b	11	0
cmfxj069y000iqyf49t2nne4b	12	0
cmfxj069y000iqyf49t2nne4b	13	0
cmfxj069y000iqyf49t2nne4b	14	0
cmfxj069y000iqyf49t2nne4b	15	0
cmfxj069y000iqyf49t2nne4b	16	0
cmfxj069y000iqyf49t2nne4b	17	0
cmfxj069y000iqyf49t2nne4b	18	0
cmfxj069y000iqyf49t2nne4b	19	0
cmfxj069y000iqyf49t2nne4b	20	0
cmfxj069y000iqyf49t2nne4b	21	0
cmfxj069y000iqyf49t2nne4b	22	0
cmfxj069y000iqyf49t2nne4b	23	0
cmfxj069y000iqyf49t2nne4b	24	0
cmfxj069y000iqyf49t2nne4b	25	0
cmfxj069y000iqyf49t2nne4b	26	0
cmfxj069y000iqyf49t2nne4b	27	0
cmfxj069y000iqyf49t2nne4b	28	0
cmfxj069y000iqyf49t2nne4b	29	0
cmfxj069y000iqyf49t2nne4b	30	0
cmfxj069y000iqyf49t2nne4b	31	0
cmfxj069y000iqyf49t2nne4b	32	0
cmfxj069y000iqyf49t2nne4b	33	0
cmfxj069y000iqyf49t2nne4b	34	0
cmfxj069y000iqyf49t2nne4b	35	0
cmfxj069y000iqyf49t2nne4b	36	0
cmfxj069y000iqyf49t2nne4b	37	0
cmfxj069y000iqyf49t2nne4b	38	0
cmfxj06aa000jqyf42i8gaapi	1	0
cmfxj06aa000jqyf42i8gaapi	2	0
cmfxj06aa000jqyf42i8gaapi	3	0
cmfxj06aa000jqyf42i8gaapi	4	0
cmfxj06aa000jqyf42i8gaapi	5	0
cmfxj06aa000jqyf42i8gaapi	6	0
cmfxj06aa000jqyf42i8gaapi	7	0
cmfxj06aa000jqyf42i8gaapi	8	0
cmfxj06aa000jqyf42i8gaapi	9	0
cmfxj06aa000jqyf42i8gaapi	10	0
cmfxj06aa000jqyf42i8gaapi	11	0
cmfxj06aa000jqyf42i8gaapi	12	0
cmfxj06aa000jqyf42i8gaapi	13	0
cmfxj06aa000jqyf42i8gaapi	14	0
cmfxj06aa000jqyf42i8gaapi	15	0
cmfxj06aa000jqyf42i8gaapi	16	0
cmfxj06aa000jqyf42i8gaapi	17	0
cmfxj06aa000jqyf42i8gaapi	18	0
cmfxj06aa000jqyf42i8gaapi	19	0
cmfxj06aa000jqyf42i8gaapi	20	0
cmfxj06aa000jqyf42i8gaapi	21	0
cmfxj06aa000jqyf42i8gaapi	22	0
cmfxj06aa000jqyf42i8gaapi	23	0
cmfxj06aa000jqyf42i8gaapi	24	0
cmfxj06aa000jqyf42i8gaapi	25	0
cmfxj06aa000jqyf42i8gaapi	26	0
cmfxj06aa000jqyf42i8gaapi	27	0
cmfxj06aa000jqyf42i8gaapi	28	0
cmfxj06aa000jqyf42i8gaapi	29	0
cmfxj06aa000jqyf42i8gaapi	30	0
cmfxj06aa000jqyf42i8gaapi	31	0
cmfxj06aa000jqyf42i8gaapi	32	0
cmfxj06aa000jqyf42i8gaapi	33	0
cmfxj06aa000jqyf42i8gaapi	34	0
cmfxj06aa000jqyf42i8gaapi	35	0
cmfxj06aa000jqyf42i8gaapi	36	0
cmfxj06aa000jqyf42i8gaapi	37	0
cmfxj06aa000jqyf42i8gaapi	38	0
cmfxj06am000kqyf4bexungaa	1	0
cmfxj06am000kqyf4bexungaa	2	0
cmfxj06am000kqyf4bexungaa	3	0
cmfxj06am000kqyf4bexungaa	4	0
cmfxj06am000kqyf4bexungaa	5	0
cmfxj06am000kqyf4bexungaa	6	0
cmfxj06am000kqyf4bexungaa	7	0
cmfxj06am000kqyf4bexungaa	8	0
cmfxj06am000kqyf4bexungaa	9	0
cmfxj06am000kqyf4bexungaa	10	0
cmfxj06am000kqyf4bexungaa	11	0
cmfxj06am000kqyf4bexungaa	12	0
cmfxj06am000kqyf4bexungaa	13	0
cmfxj06am000kqyf4bexungaa	14	0
cmfxj06am000kqyf4bexungaa	15	0
cmfxj06am000kqyf4bexungaa	16	0
cmfxj06am000kqyf4bexungaa	17	0
cmfxj06am000kqyf4bexungaa	18	0
cmfxj06am000kqyf4bexungaa	19	0
cmfxj06am000kqyf4bexungaa	20	0
cmfxj06am000kqyf4bexungaa	21	0
cmfxj06am000kqyf4bexungaa	22	0
cmfxj06am000kqyf4bexungaa	23	0
cmfxj06am000kqyf4bexungaa	24	0
cmfxj06am000kqyf4bexungaa	25	0
cmfxj06am000kqyf4bexungaa	26	0
cmfxj06am000kqyf4bexungaa	27	0
cmfxj06am000kqyf4bexungaa	28	0
cmfxj06am000kqyf4bexungaa	29	0
cmfxj06am000kqyf4bexungaa	30	0
cmfxj06am000kqyf4bexungaa	31	0
cmfxj06am000kqyf4bexungaa	32	0
cmfxj06am000kqyf4bexungaa	33	0
cmfxj06am000kqyf4bexungaa	34	0
cmfxj06am000kqyf4bexungaa	35	0
cmfxj06am000kqyf4bexungaa	36	0
cmfxj06am000kqyf4bexungaa	37	0
cmfxj06am000kqyf4bexungaa	38	0
cmfxj06b0000lqyf4wjs9zuxt	1	0
cmfxj06b0000lqyf4wjs9zuxt	2	0
cmfxj06b0000lqyf4wjs9zuxt	3	0
cmfxj06b0000lqyf4wjs9zuxt	4	0
cmfxj06b0000lqyf4wjs9zuxt	5	0
cmfxj06b0000lqyf4wjs9zuxt	6	0
cmfxj06b0000lqyf4wjs9zuxt	7	0
cmfxj06b0000lqyf4wjs9zuxt	8	0
cmfxj06b0000lqyf4wjs9zuxt	9	0
cmfxj06b0000lqyf4wjs9zuxt	10	0
cmfxj06b0000lqyf4wjs9zuxt	11	0
cmfxj06b0000lqyf4wjs9zuxt	12	0
cmfxj06b0000lqyf4wjs9zuxt	13	0
cmfxj06b0000lqyf4wjs9zuxt	14	0
cmfxj06b0000lqyf4wjs9zuxt	15	0
cmfxj06b0000lqyf4wjs9zuxt	16	0
cmfxj06b0000lqyf4wjs9zuxt	17	0
cmfxj06b0000lqyf4wjs9zuxt	18	0
cmfxj06b0000lqyf4wjs9zuxt	19	0
cmfxj06b0000lqyf4wjs9zuxt	20	0
cmfxj06b0000lqyf4wjs9zuxt	21	0
cmfxj06b0000lqyf4wjs9zuxt	22	0
cmfxj06b0000lqyf4wjs9zuxt	23	0
cmfxj06b0000lqyf4wjs9zuxt	24	0
cmfxj06b0000lqyf4wjs9zuxt	25	0
cmfxj06b0000lqyf4wjs9zuxt	26	0
cmfxj06b0000lqyf4wjs9zuxt	27	0
cmfxj06b0000lqyf4wjs9zuxt	28	0
cmfxj06b0000lqyf4wjs9zuxt	29	0
cmfxj06b0000lqyf4wjs9zuxt	30	0
cmfxj06b0000lqyf4wjs9zuxt	31	0
cmfxj06b0000lqyf4wjs9zuxt	32	0
cmfxj06b0000lqyf4wjs9zuxt	33	0
cmfxj06b0000lqyf4wjs9zuxt	34	0
cmfxj06b0000lqyf4wjs9zuxt	35	0
cmfxj06b0000lqyf4wjs9zuxt	36	0
cmfxj06b0000lqyf4wjs9zuxt	37	0
cmfxj06b0000lqyf4wjs9zuxt	38	0
cmfxj06bd000mqyf4clxt8rld	1	0
cmfxj06bd000mqyf4clxt8rld	2	0
cmfxj06bd000mqyf4clxt8rld	3	0
cmfxj06bd000mqyf4clxt8rld	4	0
cmfxj06bd000mqyf4clxt8rld	5	0
cmfxj06bd000mqyf4clxt8rld	6	0
cmfxj06bd000mqyf4clxt8rld	7	0
cmfxj06bd000mqyf4clxt8rld	8	0
cmfxj06bd000mqyf4clxt8rld	9	0
cmfxj06bd000mqyf4clxt8rld	10	0
cmfxj06bd000mqyf4clxt8rld	11	0
cmfxj06bd000mqyf4clxt8rld	12	0
cmfxj06bd000mqyf4clxt8rld	13	0
cmfxj06bd000mqyf4clxt8rld	14	0
cmfxj06bd000mqyf4clxt8rld	15	0
cmfxj06bd000mqyf4clxt8rld	16	0
cmfxj06bd000mqyf4clxt8rld	17	0
cmfxj06bd000mqyf4clxt8rld	18	0
cmfxj06bd000mqyf4clxt8rld	19	0
cmfxj06bd000mqyf4clxt8rld	20	0
cmfxj06bd000mqyf4clxt8rld	21	0
cmfxj06bd000mqyf4clxt8rld	22	0
cmfxj06bd000mqyf4clxt8rld	23	0
cmfxj06bd000mqyf4clxt8rld	24	0
cmfxj06bd000mqyf4clxt8rld	25	0
cmfxj06bd000mqyf4clxt8rld	26	0
cmfxj06bd000mqyf4clxt8rld	27	0
cmfxj06bd000mqyf4clxt8rld	28	0
cmfxj06bd000mqyf4clxt8rld	29	0
cmfxj06bd000mqyf4clxt8rld	30	0
cmfxj06bd000mqyf4clxt8rld	31	0
cmfxj06bd000mqyf4clxt8rld	32	0
cmfxj06bd000mqyf4clxt8rld	33	0
cmfxj06bd000mqyf4clxt8rld	34	0
cmfxj06bd000mqyf4clxt8rld	35	0
cmfxj06bd000mqyf4clxt8rld	36	0
cmfxj06bd000mqyf4clxt8rld	37	0
cmfxj06bd000mqyf4clxt8rld	38	0
cmfxj06bm000nqyf4506fh414	1	0
cmfxj06bm000nqyf4506fh414	2	0
cmfxj06bm000nqyf4506fh414	3	0
cmfxj06bm000nqyf4506fh414	4	0
cmfxj06bm000nqyf4506fh414	5	0
cmfxj06bm000nqyf4506fh414	6	0
cmfxj06bm000nqyf4506fh414	7	0
cmfxj06bm000nqyf4506fh414	8	0
cmfxj06bm000nqyf4506fh414	9	0
cmfxj06bm000nqyf4506fh414	10	0
cmfxj06bm000nqyf4506fh414	11	0
cmfxj06bm000nqyf4506fh414	12	0
cmfxj06bm000nqyf4506fh414	13	0
cmfxj06bm000nqyf4506fh414	14	0
cmfxj06bm000nqyf4506fh414	15	0
cmfxj06bm000nqyf4506fh414	16	0
cmfxj06bm000nqyf4506fh414	17	0
cmfxj06bm000nqyf4506fh414	18	0
cmfxj06bm000nqyf4506fh414	19	0
cmfxj06bm000nqyf4506fh414	20	0
cmfxj06bm000nqyf4506fh414	21	0
cmfxj06bm000nqyf4506fh414	22	0
cmfxj06bm000nqyf4506fh414	23	0
cmfxj06bm000nqyf4506fh414	24	0
cmfxj06bm000nqyf4506fh414	25	0
cmfxj06bm000nqyf4506fh414	26	0
cmfxj06bm000nqyf4506fh414	27	0
cmfxj06bm000nqyf4506fh414	28	0
cmfxj06bm000nqyf4506fh414	29	0
cmfxj06bm000nqyf4506fh414	30	0
cmfxj06bm000nqyf4506fh414	31	0
cmfxj06bm000nqyf4506fh414	32	0
cmfxj06bm000nqyf4506fh414	33	0
cmfxj06bm000nqyf4506fh414	34	0
cmfxj06bm000nqyf4506fh414	35	0
cmfxj06bm000nqyf4506fh414	36	0
cmfxj06bm000nqyf4506fh414	37	0
cmfxj06bm000nqyf4506fh414	38	0
cmfxj06bw000oqyf4g79dsqjz	1	0
cmfxj06bw000oqyf4g79dsqjz	2	0
cmfxj06bw000oqyf4g79dsqjz	3	0
cmfxj06bw000oqyf4g79dsqjz	4	0
cmfxj06bw000oqyf4g79dsqjz	5	0
cmfxj06bw000oqyf4g79dsqjz	6	0
cmfxj06bw000oqyf4g79dsqjz	7	0
cmfxj06bw000oqyf4g79dsqjz	8	0
cmfxj06bw000oqyf4g79dsqjz	9	0
cmfxj06bw000oqyf4g79dsqjz	10	0
cmfxj06bw000oqyf4g79dsqjz	11	0
cmfxj06bw000oqyf4g79dsqjz	12	0
cmfxj06bw000oqyf4g79dsqjz	13	0
cmfxj06bw000oqyf4g79dsqjz	14	0
cmfxj06bw000oqyf4g79dsqjz	15	0
cmfxj06bw000oqyf4g79dsqjz	16	0
cmfxj06bw000oqyf4g79dsqjz	17	0
cmfxj06bw000oqyf4g79dsqjz	18	0
cmfxj06bw000oqyf4g79dsqjz	19	0
cmfxj06bw000oqyf4g79dsqjz	20	0
cmfxj06bw000oqyf4g79dsqjz	21	0
cmfxj06bw000oqyf4g79dsqjz	22	0
cmfxj06bw000oqyf4g79dsqjz	23	0
cmfxj06bw000oqyf4g79dsqjz	24	0
cmfxj06bw000oqyf4g79dsqjz	25	0
cmfxj06bw000oqyf4g79dsqjz	26	0
cmfxj06bw000oqyf4g79dsqjz	27	0
cmfxj06bw000oqyf4g79dsqjz	28	0
cmfxj06bw000oqyf4g79dsqjz	29	0
cmfxj06bw000oqyf4g79dsqjz	30	0
cmfxj06bw000oqyf4g79dsqjz	31	0
cmfxj06bw000oqyf4g79dsqjz	32	0
cmfxj06bw000oqyf4g79dsqjz	33	0
cmfxj06bw000oqyf4g79dsqjz	34	0
cmfxj06bw000oqyf4g79dsqjz	35	0
cmfxj06bw000oqyf4g79dsqjz	36	0
cmfxj06bw000oqyf4g79dsqjz	37	0
cmfxj06bw000oqyf4g79dsqjz	38	0
cmfxj06c5000pqyf4d2aedc5w	1	0
cmfxj06c5000pqyf4d2aedc5w	2	0
cmfxj06c5000pqyf4d2aedc5w	3	0
cmfxj06c5000pqyf4d2aedc5w	4	0
cmfxj06c5000pqyf4d2aedc5w	5	0
cmfxj06c5000pqyf4d2aedc5w	6	0
cmfxj06c5000pqyf4d2aedc5w	7	0
cmfxj06c5000pqyf4d2aedc5w	8	0
cmfxj06c5000pqyf4d2aedc5w	9	0
cmfxj06c5000pqyf4d2aedc5w	10	0
cmfxj06c5000pqyf4d2aedc5w	11	0
cmfxj06c5000pqyf4d2aedc5w	12	0
cmfxj06c5000pqyf4d2aedc5w	13	0
cmfxj06c5000pqyf4d2aedc5w	14	0
cmfxj06c5000pqyf4d2aedc5w	15	0
cmfxj06c5000pqyf4d2aedc5w	16	0
cmfxj06c5000pqyf4d2aedc5w	17	0
cmfxj06c5000pqyf4d2aedc5w	18	0
cmfxj06c5000pqyf4d2aedc5w	19	0
cmfxj06c5000pqyf4d2aedc5w	20	0
cmfxj06c5000pqyf4d2aedc5w	21	0
cmfxj06c5000pqyf4d2aedc5w	22	0
cmfxj06c5000pqyf4d2aedc5w	23	0
cmfxj06c5000pqyf4d2aedc5w	24	0
cmfxj06c5000pqyf4d2aedc5w	25	0
cmfxj06c5000pqyf4d2aedc5w	26	0
cmfxj06c5000pqyf4d2aedc5w	27	0
cmfxj06c5000pqyf4d2aedc5w	28	0
cmfxj06c5000pqyf4d2aedc5w	29	0
cmfxj06c5000pqyf4d2aedc5w	30	0
cmfxj06c5000pqyf4d2aedc5w	31	0
cmfxj06c5000pqyf4d2aedc5w	32	0
cmfxj06c5000pqyf4d2aedc5w	33	0
cmfxj06c5000pqyf4d2aedc5w	34	0
cmfxj06c5000pqyf4d2aedc5w	35	0
cmfxj06c5000pqyf4d2aedc5w	36	0
cmfxj06c5000pqyf4d2aedc5w	37	0
cmfxj06c5000pqyf4d2aedc5w	38	0
cmfxj06ce000qqyf499mks1as	1	0
cmfxj06ce000qqyf499mks1as	2	0
cmfxj06ce000qqyf499mks1as	3	0
cmfxj06ce000qqyf499mks1as	4	0
cmfxj06ce000qqyf499mks1as	5	0
cmfxj06ce000qqyf499mks1as	6	0
cmfxj06ce000qqyf499mks1as	7	0
cmfxj06ce000qqyf499mks1as	8	0
cmfxj06ce000qqyf499mks1as	9	0
cmfxj06ce000qqyf499mks1as	10	0
cmfxj06ce000qqyf499mks1as	11	0
cmfxj06ce000qqyf499mks1as	12	0
cmfxj06ce000qqyf499mks1as	13	0
cmfxj06ce000qqyf499mks1as	14	0
cmfxj06ce000qqyf499mks1as	15	0
cmfxj06ce000qqyf499mks1as	16	0
cmfxj06ce000qqyf499mks1as	17	0
cmfxj06ce000qqyf499mks1as	18	0
cmfxj06ce000qqyf499mks1as	19	0
cmfxj06ce000qqyf499mks1as	20	0
cmfxj06ce000qqyf499mks1as	21	0
cmfxj06ce000qqyf499mks1as	22	0
cmfxj06ce000qqyf499mks1as	23	0
cmfxj06ce000qqyf499mks1as	24	0
cmfxj06ce000qqyf499mks1as	25	0
cmfxj06ce000qqyf499mks1as	26	0
cmfxj06ce000qqyf499mks1as	27	0
cmfxj06ce000qqyf499mks1as	28	0
cmfxj06ce000qqyf499mks1as	29	0
cmfxj06ce000qqyf499mks1as	30	0
cmfxj06ce000qqyf499mks1as	31	0
cmfxj06ce000qqyf499mks1as	32	0
cmfxj06ce000qqyf499mks1as	33	0
cmfxj06ce000qqyf499mks1as	34	0
cmfxj06ce000qqyf499mks1as	35	0
cmfxj06ce000qqyf499mks1as	36	0
cmfxj06ce000qqyf499mks1as	37	0
cmfxj06ce000qqyf499mks1as	38	0
cmfxj06cm000rqyf4vk6eiayv	1	0
cmfxj06cm000rqyf4vk6eiayv	2	0
cmfxj06cm000rqyf4vk6eiayv	3	0
cmfxj06cm000rqyf4vk6eiayv	4	0
cmfxj06cm000rqyf4vk6eiayv	5	0
cmfxj06cm000rqyf4vk6eiayv	6	0
cmfxj06cm000rqyf4vk6eiayv	7	0
cmfxj06cm000rqyf4vk6eiayv	8	0
cmfxj06cm000rqyf4vk6eiayv	9	0
cmfxj06cm000rqyf4vk6eiayv	10	0
cmfxj06cm000rqyf4vk6eiayv	11	0
cmfxj06cm000rqyf4vk6eiayv	12	0
cmfxj06cm000rqyf4vk6eiayv	13	0
cmfxj06cm000rqyf4vk6eiayv	14	0
cmfxj06cm000rqyf4vk6eiayv	15	0
cmfxj06cm000rqyf4vk6eiayv	16	0
cmfxj06cm000rqyf4vk6eiayv	17	0
cmfxj06cm000rqyf4vk6eiayv	18	0
cmfxj06cm000rqyf4vk6eiayv	19	0
cmfxj06cm000rqyf4vk6eiayv	20	0
cmfxj06cm000rqyf4vk6eiayv	21	0
cmfxj06cm000rqyf4vk6eiayv	22	0
cmfxj06cm000rqyf4vk6eiayv	23	0
cmfxj06cm000rqyf4vk6eiayv	24	0
cmfxj06cm000rqyf4vk6eiayv	25	0
cmfxj06cm000rqyf4vk6eiayv	26	0
cmfxj06cm000rqyf4vk6eiayv	27	0
cmfxj06cm000rqyf4vk6eiayv	28	0
cmfxj06cm000rqyf4vk6eiayv	29	0
cmfxj06cm000rqyf4vk6eiayv	30	0
cmfxj06cm000rqyf4vk6eiayv	31	0
cmfxj06cm000rqyf4vk6eiayv	32	0
cmfxj06cm000rqyf4vk6eiayv	33	0
cmfxj06cm000rqyf4vk6eiayv	34	0
cmfxj06cm000rqyf4vk6eiayv	35	0
cmfxj06cm000rqyf4vk6eiayv	36	0
cmfxj06cm000rqyf4vk6eiayv	37	0
cmfxj06cm000rqyf4vk6eiayv	38	0
cmfxj06cu000sqyf4hfkxu3cp	1	0
cmfxj06cu000sqyf4hfkxu3cp	2	0
cmfxj06cu000sqyf4hfkxu3cp	3	0
cmfxj06cu000sqyf4hfkxu3cp	4	0
cmfxj06cu000sqyf4hfkxu3cp	5	0
cmfxj06cu000sqyf4hfkxu3cp	6	0
cmfxj06cu000sqyf4hfkxu3cp	7	0
cmfxj06cu000sqyf4hfkxu3cp	8	0
cmfxj06cu000sqyf4hfkxu3cp	9	0
cmfxj06cu000sqyf4hfkxu3cp	10	0
cmfxj06cu000sqyf4hfkxu3cp	11	0
cmfxj06cu000sqyf4hfkxu3cp	12	0
cmfxj06cu000sqyf4hfkxu3cp	13	0
cmfxj06cu000sqyf4hfkxu3cp	14	0
cmfxj06cu000sqyf4hfkxu3cp	15	0
cmfxj06cu000sqyf4hfkxu3cp	16	0
cmfxj06cu000sqyf4hfkxu3cp	17	0
cmfxj06cu000sqyf4hfkxu3cp	18	0
cmfxj06cu000sqyf4hfkxu3cp	19	0
cmfxj06cu000sqyf4hfkxu3cp	20	0
cmfxj06cu000sqyf4hfkxu3cp	21	0
cmfxj06cu000sqyf4hfkxu3cp	22	0
cmfxj06cu000sqyf4hfkxu3cp	23	0
cmfxj06cu000sqyf4hfkxu3cp	24	0
cmfxj06cu000sqyf4hfkxu3cp	25	0
cmfxj06cu000sqyf4hfkxu3cp	26	0
cmfxj06cu000sqyf4hfkxu3cp	27	0
cmfxj06cu000sqyf4hfkxu3cp	28	0
cmfxj06cu000sqyf4hfkxu3cp	29	0
cmfxj06cu000sqyf4hfkxu3cp	30	0
cmfxj06cu000sqyf4hfkxu3cp	31	0
cmfxj06cu000sqyf4hfkxu3cp	32	0
cmfxj06cu000sqyf4hfkxu3cp	33	0
cmfxj06cu000sqyf4hfkxu3cp	34	0
cmfxj06cu000sqyf4hfkxu3cp	35	0
cmfxj06cu000sqyf4hfkxu3cp	36	0
cmfxj06cu000sqyf4hfkxu3cp	37	0
cmfxj06cu000sqyf4hfkxu3cp	38	0
cmfxj06d3000tqyf4e7ko0xld	1	0
cmfxj06d3000tqyf4e7ko0xld	2	0
cmfxj06d3000tqyf4e7ko0xld	3	0
cmfxj06d3000tqyf4e7ko0xld	4	0
cmfxj06d3000tqyf4e7ko0xld	5	0
cmfxj06d3000tqyf4e7ko0xld	6	0
cmfxj06d3000tqyf4e7ko0xld	7	0
cmfxj06d3000tqyf4e7ko0xld	8	0
cmfxj06d3000tqyf4e7ko0xld	9	0
cmfxj06d3000tqyf4e7ko0xld	10	0
cmfxj06d3000tqyf4e7ko0xld	11	0
cmfxj06d3000tqyf4e7ko0xld	12	0
cmfxj06d3000tqyf4e7ko0xld	13	0
cmfxj06d3000tqyf4e7ko0xld	14	0
cmfxj06d3000tqyf4e7ko0xld	15	0
cmfxj06d3000tqyf4e7ko0xld	16	0
cmfxj06d3000tqyf4e7ko0xld	17	0
cmfxj06d3000tqyf4e7ko0xld	18	0
cmfxj06d3000tqyf4e7ko0xld	19	0
cmfxj06d3000tqyf4e7ko0xld	20	0
cmfxj06d3000tqyf4e7ko0xld	21	0
cmfxj06d3000tqyf4e7ko0xld	22	0
cmfxj06d3000tqyf4e7ko0xld	23	0
cmfxj06d3000tqyf4e7ko0xld	24	0
cmfxj06d3000tqyf4e7ko0xld	25	0
cmfxj06d3000tqyf4e7ko0xld	26	0
cmfxj06d3000tqyf4e7ko0xld	27	0
cmfxj06d3000tqyf4e7ko0xld	28	0
cmfxj06d3000tqyf4e7ko0xld	29	0
cmfxj06d3000tqyf4e7ko0xld	30	0
cmfxj06d3000tqyf4e7ko0xld	31	0
cmfxj06d3000tqyf4e7ko0xld	32	0
cmfxj06d3000tqyf4e7ko0xld	33	0
cmfxj06d3000tqyf4e7ko0xld	34	0
cmfxj06d3000tqyf4e7ko0xld	35	0
cmfxj06d3000tqyf4e7ko0xld	36	0
cmfxj06d3000tqyf4e7ko0xld	37	0
cmfxj06d3000tqyf4e7ko0xld	38	0
cmfxj06dc000uqyf4h8b7oazg	1	0
cmfxj06dc000uqyf4h8b7oazg	2	0
cmfxj06dc000uqyf4h8b7oazg	3	0
cmfxj06dc000uqyf4h8b7oazg	4	0
cmfxj06dc000uqyf4h8b7oazg	5	0
cmfxj06dc000uqyf4h8b7oazg	6	0
cmfxj06dc000uqyf4h8b7oazg	7	0
cmfxj06dc000uqyf4h8b7oazg	8	0
cmfxj06dc000uqyf4h8b7oazg	9	0
cmfxj06dc000uqyf4h8b7oazg	10	0
cmfxj06dc000uqyf4h8b7oazg	11	0
cmfxj06dc000uqyf4h8b7oazg	12	0
cmfxj06dc000uqyf4h8b7oazg	13	0
cmfxj06dc000uqyf4h8b7oazg	14	0
cmfxj06dc000uqyf4h8b7oazg	15	0
cmfxj06dc000uqyf4h8b7oazg	16	0
cmfxj06dc000uqyf4h8b7oazg	17	0
cmfxj06dc000uqyf4h8b7oazg	18	0
cmfxj06dc000uqyf4h8b7oazg	19	0
cmfxj06dc000uqyf4h8b7oazg	20	0
cmfxj06dc000uqyf4h8b7oazg	21	0
cmfxj06dc000uqyf4h8b7oazg	22	0
cmfxj06dc000uqyf4h8b7oazg	23	0
cmfxj06dc000uqyf4h8b7oazg	24	0
cmfxj06dc000uqyf4h8b7oazg	25	0
cmfxj06dc000uqyf4h8b7oazg	26	0
cmfxj06dc000uqyf4h8b7oazg	27	0
cmfxj06dc000uqyf4h8b7oazg	28	0
cmfxj06dc000uqyf4h8b7oazg	29	0
cmfxj06dc000uqyf4h8b7oazg	30	0
cmfxj06dc000uqyf4h8b7oazg	31	0
cmfxj06dc000uqyf4h8b7oazg	32	0
cmfxj06dc000uqyf4h8b7oazg	33	0
cmfxj06dc000uqyf4h8b7oazg	34	0
cmfxj06dc000uqyf4h8b7oazg	35	0
cmfxj06dc000uqyf4h8b7oazg	36	0
cmfxj06dc000uqyf4h8b7oazg	37	0
cmfxj06dc000uqyf4h8b7oazg	38	0
cmfxj06dn000vqyf4o1qlkzz3	1	0
cmfxj06dn000vqyf4o1qlkzz3	2	0
cmfxj06dn000vqyf4o1qlkzz3	3	0
cmfxj06dn000vqyf4o1qlkzz3	4	0
cmfxj06dn000vqyf4o1qlkzz3	5	0
cmfxj06dn000vqyf4o1qlkzz3	6	0
cmfxj06dn000vqyf4o1qlkzz3	7	0
cmfxj06dn000vqyf4o1qlkzz3	8	0
cmfxj06dn000vqyf4o1qlkzz3	9	0
cmfxj06dn000vqyf4o1qlkzz3	10	0
cmfxj06dn000vqyf4o1qlkzz3	11	0
cmfxj06dn000vqyf4o1qlkzz3	12	0
cmfxj06dn000vqyf4o1qlkzz3	13	0
cmfxj06dn000vqyf4o1qlkzz3	14	0
cmfxj06dn000vqyf4o1qlkzz3	15	0
cmfxj06dn000vqyf4o1qlkzz3	16	0
cmfxj06dn000vqyf4o1qlkzz3	17	0
cmfxj06dn000vqyf4o1qlkzz3	18	0
cmfxj06dn000vqyf4o1qlkzz3	19	0
cmfxj06dn000vqyf4o1qlkzz3	20	0
cmfxj06dn000vqyf4o1qlkzz3	21	0
cmfxj06dn000vqyf4o1qlkzz3	22	0
cmfxj06dn000vqyf4o1qlkzz3	23	0
cmfxj06dn000vqyf4o1qlkzz3	24	0
cmfxj06dn000vqyf4o1qlkzz3	25	0
cmfxj06dn000vqyf4o1qlkzz3	26	0
cmfxj06dn000vqyf4o1qlkzz3	27	0
cmfxj06dn000vqyf4o1qlkzz3	28	0
cmfxj06dn000vqyf4o1qlkzz3	29	0
cmfxj06dn000vqyf4o1qlkzz3	30	0
cmfxj06dn000vqyf4o1qlkzz3	31	0
cmfxj06dn000vqyf4o1qlkzz3	32	0
cmfxj06dn000vqyf4o1qlkzz3	33	0
cmfxj06dn000vqyf4o1qlkzz3	34	0
cmfxj06dn000vqyf4o1qlkzz3	35	0
cmfxj06dn000vqyf4o1qlkzz3	36	0
cmfxj06dn000vqyf4o1qlkzz3	37	0
cmfxj06dn000vqyf4o1qlkzz3	38	0
\.


--
-- Data for Name: TemplateFinish; Type: TABLE DATA; Schema: public; Owner: ritual
--

COPY public."TemplateFinish" ("templateId", finish, "extraPriceMinor") FROM stdin;
cmfxj06630008qyf4t0tqg2xg	MATTE	0
cmfxj06630008qyf4t0tqg2xg	GLOSS	0
cmfxj066l0009qyf4inp7dimr	MATTE	0
cmfxj066l0009qyf4inp7dimr	GLOSS	0
cmfxj0671000aqyf4bjeyuyld	MATTE	0
cmfxj0671000aqyf4bjeyuyld	GLOSS	0
cmfxj067e000bqyf43t016hyf	MATTE	0
cmfxj067e000bqyf43t016hyf	GLOSS	0
cmfxj067s000cqyf49h06e1bz	MATTE	0
cmfxj067s000cqyf49h06e1bz	GLOSS	0
cmfxj0687000dqyf40al7mmdm	MATTE	0
cmfxj0687000dqyf40al7mmdm	GLOSS	0
cmfxj068l000eqyf4iv29u1kz	MATTE	0
cmfxj068l000eqyf4iv29u1kz	GLOSS	0
cmfxj068z000fqyf4hfpn3hzr	MATTE	0
cmfxj068z000fqyf4hfpn3hzr	GLOSS	0
cmfxj069c000gqyf4sx8m1y3o	MATTE	0
cmfxj069c000gqyf4sx8m1y3o	GLOSS	0
cmfxj069n000hqyf4jqfecti9	MATTE	0
cmfxj069n000hqyf4jqfecti9	GLOSS	0
cmfxj069y000iqyf49t2nne4b	MATTE	0
cmfxj069y000iqyf49t2nne4b	GLOSS	0
cmfxj06aa000jqyf42i8gaapi	MATTE	0
cmfxj06aa000jqyf42i8gaapi	GLOSS	0
cmfxj06am000kqyf4bexungaa	MATTE	0
cmfxj06am000kqyf4bexungaa	GLOSS	0
cmfxj06b0000lqyf4wjs9zuxt	MATTE	0
cmfxj06b0000lqyf4wjs9zuxt	GLOSS	0
cmfxj06dw000wqyf4992rrgnl	MATTE	0
cmfxj06dw000wqyf4992rrgnl	GLOSS	0
cmfxj06e6000xqyf4hmhzd05x	MATTE	0
cmfxj06e6000xqyf4hmhzd05x	GLOSS	0
cmfxj06ef000yqyf4pp5gx5h1	GLOSS	0
cmfxj06ep000zqyf42im6zh2b	GLOSS	0
\.


--
-- Data for Name: TemplateFrame; Type: TABLE DATA; Schema: public; Owner: ritual
--

COPY public."TemplateFrame" ("templateId", "frameId", "extraPriceMinor") FROM stdin;
cmfxj063i0000qyf4ptstwhkl	1	0
cmfxj063i0000qyf4ptstwhkl	2	0
cmfxj063i0000qyf4ptstwhkl	3	0
cmfxj063i0000qyf4ptstwhkl	4	0
cmfxj063i0000qyf4ptstwhkl	5	0
cmfxj063i0000qyf4ptstwhkl	6	0
cmfxj06440001qyf4tdpmqc9c	1	0
cmfxj06440001qyf4tdpmqc9c	2	0
cmfxj06440001qyf4tdpmqc9c	3	0
cmfxj06440001qyf4tdpmqc9c	4	0
cmfxj06440001qyf4tdpmqc9c	5	0
cmfxj06440001qyf4tdpmqc9c	6	0
cmfxj064g0002qyf4t8iakes9	1	0
cmfxj064g0002qyf4t8iakes9	2	0
cmfxj064g0002qyf4t8iakes9	3	0
cmfxj064g0002qyf4t8iakes9	4	0
cmfxj064g0002qyf4t8iakes9	5	0
cmfxj064g0002qyf4t8iakes9	6	0
cmfxj064q0003qyf4jp5of5ag	1	0
cmfxj064q0003qyf4jp5of5ag	2	0
cmfxj064q0003qyf4jp5of5ag	3	0
cmfxj064q0003qyf4jp5of5ag	4	0
cmfxj064q0003qyf4jp5of5ag	5	0
cmfxj064q0003qyf4jp5of5ag	6	0
cmfxj064y0004qyf473wtlu0v	1	0
cmfxj064y0004qyf473wtlu0v	2	0
cmfxj064y0004qyf473wtlu0v	3	0
cmfxj064y0004qyf473wtlu0v	4	0
cmfxj064y0004qyf473wtlu0v	5	0
cmfxj064y0004qyf473wtlu0v	6	0
cmfxj065a0005qyf4x5jq9u9z	1	0
cmfxj065a0005qyf4x5jq9u9z	2	0
cmfxj065a0005qyf4x5jq9u9z	3	0
cmfxj065a0005qyf4x5jq9u9z	4	0
cmfxj065a0005qyf4x5jq9u9z	5	0
cmfxj065a0005qyf4x5jq9u9z	6	0
cmfxj065j0006qyf4l0x3wtma	1	0
cmfxj065j0006qyf4l0x3wtma	2	0
cmfxj065j0006qyf4l0x3wtma	3	0
cmfxj065j0006qyf4l0x3wtma	4	0
cmfxj065j0006qyf4l0x3wtma	5	0
cmfxj065j0006qyf4l0x3wtma	6	0
cmfxj065u0007qyf4qx03pn4o	1	0
cmfxj065u0007qyf4qx03pn4o	2	0
cmfxj065u0007qyf4qx03pn4o	3	0
cmfxj065u0007qyf4qx03pn4o	4	0
cmfxj065u0007qyf4qx03pn4o	5	0
cmfxj065u0007qyf4qx03pn4o	6	0
\.


--
-- Data for Name: TemplateHole; Type: TABLE DATA; Schema: public; Owner: ritual
--

COPY public."TemplateHole" ("templateId", pattern, "extraPriceMinor") FROM stdin;
cmfxj063i0000qyf4ptstwhkl	NONE	0
cmfxj063i0000qyf4ptstwhkl	TWO_VERTICAL	0
cmfxj063i0000qyf4ptstwhkl	FOUR_CORNERS	0
cmfxj06440001qyf4tdpmqc9c	NONE	0
cmfxj06440001qyf4tdpmqc9c	TWO_VERTICAL	0
cmfxj06440001qyf4tdpmqc9c	FOUR_CORNERS	0
cmfxj064g0002qyf4t8iakes9	NONE	0
cmfxj064g0002qyf4t8iakes9	TWO_HORIZONTAL	0
cmfxj064g0002qyf4t8iakes9	FOUR_CORNERS	0
cmfxj064q0003qyf4jp5of5ag	NONE	0
cmfxj064q0003qyf4jp5of5ag	TWO_HORIZONTAL	0
cmfxj064q0003qyf4jp5of5ag	FOUR_CORNERS	0
cmfxj064y0004qyf473wtlu0v	NONE	0
cmfxj064y0004qyf473wtlu0v	TWO_VERTICAL	0
cmfxj065a0005qyf4x5jq9u9z	NONE	0
cmfxj065a0005qyf4x5jq9u9z	TWO_VERTICAL	0
cmfxj065j0006qyf4l0x3wtma	NONE	0
cmfxj065j0006qyf4l0x3wtma	TWO_HORIZONTAL	0
cmfxj065u0007qyf4qx03pn4o	NONE	0
cmfxj065u0007qyf4qx03pn4o	TWO_HORIZONTAL	0
cmfxj06630008qyf4t0tqg2xg	NONE	0
cmfxj06630008qyf4t0tqg2xg	TWO_VERTICAL	0
cmfxj06630008qyf4t0tqg2xg	FOUR_CORNERS	0
cmfxj066l0009qyf4inp7dimr	NONE	0
cmfxj066l0009qyf4inp7dimr	TWO_VERTICAL	0
cmfxj066l0009qyf4inp7dimr	FOUR_CORNERS	0
cmfxj0671000aqyf4bjeyuyld	NONE	0
cmfxj0671000aqyf4bjeyuyld	TWO_HORIZONTAL	0
cmfxj0671000aqyf4bjeyuyld	FOUR_CORNERS	0
cmfxj067e000bqyf43t016hyf	NONE	0
cmfxj067e000bqyf43t016hyf	TWO_HORIZONTAL	0
cmfxj067e000bqyf43t016hyf	FOUR_CORNERS	0
cmfxj067s000cqyf49h06e1bz	NONE	0
cmfxj067s000cqyf49h06e1bz	TWO_VERTICAL	0
cmfxj067s000cqyf49h06e1bz	FOUR_CORNERS	0
cmfxj0687000dqyf40al7mmdm	NONE	0
cmfxj0687000dqyf40al7mmdm	TWO_VERTICAL	0
cmfxj0687000dqyf40al7mmdm	FOUR_CORNERS	0
cmfxj068l000eqyf4iv29u1kz	NONE	0
cmfxj068l000eqyf4iv29u1kz	TWO_HORIZONTAL	0
cmfxj068l000eqyf4iv29u1kz	FOUR_CORNERS	0
cmfxj068z000fqyf4hfpn3hzr	NONE	0
cmfxj068z000fqyf4hfpn3hzr	TWO_HORIZONTAL	0
cmfxj068z000fqyf4hfpn3hzr	FOUR_CORNERS	0
cmfxj069c000gqyf4sx8m1y3o	NONE	0
cmfxj069c000gqyf4sx8m1y3o	TWO_VERTICAL	0
cmfxj069n000hqyf4jqfecti9	NONE	0
cmfxj069n000hqyf4jqfecti9	TWO_VERTICAL	0
cmfxj069y000iqyf49t2nne4b	NONE	0
cmfxj069y000iqyf49t2nne4b	TWO_HORIZONTAL	0
cmfxj06aa000jqyf42i8gaapi	NONE	0
cmfxj06aa000jqyf42i8gaapi	TWO_HORIZONTAL	0
cmfxj06am000kqyf4bexungaa	NONE	0
cmfxj06am000kqyf4bexungaa	TWO_VERTICAL	0
cmfxj06am000kqyf4bexungaa	FOUR_CORNERS	0
cmfxj06b0000lqyf4wjs9zuxt	NONE	0
cmfxj06b0000lqyf4wjs9zuxt	TWO_VERTICAL	0
cmfxj06b0000lqyf4wjs9zuxt	FOUR_CORNERS	0
cmfxj06bd000mqyf4clxt8rld	NONE	0
cmfxj06bd000mqyf4clxt8rld	TWO_VERTICAL	0
cmfxj06bd000mqyf4clxt8rld	FOUR_CORNERS	0
cmfxj06bm000nqyf4506fh414	NONE	0
cmfxj06bm000nqyf4506fh414	TWO_VERTICAL	0
cmfxj06bm000nqyf4506fh414	FOUR_CORNERS	0
cmfxj06bw000oqyf4g79dsqjz	NONE	0
cmfxj06bw000oqyf4g79dsqjz	TWO_HORIZONTAL	0
cmfxj06bw000oqyf4g79dsqjz	FOUR_CORNERS	0
cmfxj06c5000pqyf4d2aedc5w	NONE	0
cmfxj06c5000pqyf4d2aedc5w	TWO_HORIZONTAL	0
cmfxj06c5000pqyf4d2aedc5w	FOUR_CORNERS	0
cmfxj06ce000qqyf499mks1as	NONE	0
cmfxj06ce000qqyf499mks1as	TWO_VERTICAL	0
cmfxj06cm000rqyf4vk6eiayv	NONE	0
cmfxj06cm000rqyf4vk6eiayv	TWO_VERTICAL	0
cmfxj06cu000sqyf4hfkxu3cp	NONE	0
cmfxj06cu000sqyf4hfkxu3cp	TWO_HORIZONTAL	0
cmfxj06d3000tqyf4e7ko0xld	NONE	0
cmfxj06d3000tqyf4e7ko0xld	TWO_HORIZONTAL	0
cmfxj06dc000uqyf4h8b7oazg	NONE	0
cmfxj06dc000uqyf4h8b7oazg	TWO_VERTICAL	0
cmfxj06dc000uqyf4h8b7oazg	FOUR_CORNERS	0
cmfxj06dn000vqyf4o1qlkzz3	NONE	0
cmfxj06dn000vqyf4o1qlkzz3	TWO_VERTICAL	0
cmfxj06dn000vqyf4o1qlkzz3	FOUR_CORNERS	0
cmfxj06dw000wqyf4992rrgnl	NONE	0
cmfxj06dw000wqyf4992rrgnl	TWO_VERTICAL	0
cmfxj06dw000wqyf4992rrgnl	FOUR_CORNERS	0
cmfxj06e6000xqyf4hmhzd05x	NONE	0
cmfxj06e6000xqyf4hmhzd05x	TWO_HORIZONTAL	0
cmfxj06e6000xqyf4hmhzd05x	FOUR_CORNERS	0
cmfxj06ef000yqyf4pp5gx5h1	NONE	0
cmfxj06ef000yqyf4pp5gx5h1	TWO_VERTICAL	0
cmfxj06ep000zqyf42im6zh2b	NONE	0
cmfxj06ep000zqyf42im6zh2b	TWO_HORIZONTAL	0
cmfxj06ew0010qyf46rabniha	NONE	0
cmfxj06ew0010qyf46rabniha	TWO_VERTICAL	0
cmfxj06ew0010qyf46rabniha	FOUR_CORNERS	0
cmfxj06f20011qyf456y34hfv	NONE	0
cmfxj06f20011qyf456y34hfv	TWO_HORIZONTAL	0
cmfxj06f20011qyf456y34hfv	FOUR_CORNERS	0
\.


--
-- Data for Name: TemplateSize; Type: TABLE DATA; Schema: public; Owner: ritual
--

COPY public."TemplateSize" ("templateId", "sizeId", "extraPriceMinor") FROM stdin;
cmfxj063i0000qyf4ptstwhkl	5	0
cmfxj063i0000qyf4ptstwhkl	31	0
cmfxj06440001qyf4tdpmqc9c	5	0
cmfxj06440001qyf4tdpmqc9c	31	0
cmfxj064y0004qyf473wtlu0v	8	0
cmfxj064y0004qyf473wtlu0v	14	0
cmfxj064y0004qyf473wtlu0v	25	0
cmfxj064y0004qyf473wtlu0v	26	0
cmfxj064y0004qyf473wtlu0v	30	0
cmfxj064y0004qyf473wtlu0v	32	0
cmfxj065a0005qyf4x5jq9u9z	8	0
cmfxj065a0005qyf4x5jq9u9z	14	0
cmfxj065a0005qyf4x5jq9u9z	25	0
cmfxj065a0005qyf4x5jq9u9z	26	0
cmfxj065a0005qyf4x5jq9u9z	30	0
cmfxj065a0005qyf4x5jq9u9z	32	0
cmfxj065j0006qyf4l0x3wtma	4	0
cmfxj065j0006qyf4l0x3wtma	6	0
cmfxj065j0006qyf4l0x3wtma	15	0
cmfxj065j0006qyf4l0x3wtma	17	0
cmfxj065j0006qyf4l0x3wtma	23	0
cmfxj065j0006qyf4l0x3wtma	29	0
cmfxj065u0007qyf4qx03pn4o	4	0
cmfxj065u0007qyf4qx03pn4o	6	0
cmfxj065u0007qyf4qx03pn4o	15	0
cmfxj065u0007qyf4qx03pn4o	17	0
cmfxj065u0007qyf4qx03pn4o	23	0
cmfxj065u0007qyf4qx03pn4o	29	0
cmfxj06630008qyf4t0tqg2xg	1	0
cmfxj06630008qyf4t0tqg2xg	2	0
cmfxj06630008qyf4t0tqg2xg	3	0
cmfxj06630008qyf4t0tqg2xg	11	0
cmfxj06630008qyf4t0tqg2xg	13	0
cmfxj06630008qyf4t0tqg2xg	14	0
cmfxj06630008qyf4t0tqg2xg	25	0
cmfxj06630008qyf4t0tqg2xg	27	0
cmfxj06630008qyf4t0tqg2xg	28	0
cmfxj06630008qyf4t0tqg2xg	30	0
cmfxj066l0009qyf4inp7dimr	1	0
cmfxj066l0009qyf4inp7dimr	2	0
cmfxj066l0009qyf4inp7dimr	3	0
cmfxj066l0009qyf4inp7dimr	11	0
cmfxj066l0009qyf4inp7dimr	13	0
cmfxj066l0009qyf4inp7dimr	14	0
cmfxj066l0009qyf4inp7dimr	25	0
cmfxj066l0009qyf4inp7dimr	27	0
cmfxj066l0009qyf4inp7dimr	28	0
cmfxj066l0009qyf4inp7dimr	30	0
cmfxj0671000aqyf4bjeyuyld	4	0
cmfxj0671000aqyf4bjeyuyld	7	0
cmfxj0671000aqyf4bjeyuyld	9	0
cmfxj0671000aqyf4bjeyuyld	10	0
cmfxj0671000aqyf4bjeyuyld	15	0
cmfxj0671000aqyf4bjeyuyld	16	0
cmfxj0671000aqyf4bjeyuyld	18	0
cmfxj0671000aqyf4bjeyuyld	19	0
cmfxj0671000aqyf4bjeyuyld	21	0
cmfxj0671000aqyf4bjeyuyld	29	0
cmfxj067e000bqyf43t016hyf	4	0
cmfxj067e000bqyf43t016hyf	7	0
cmfxj067e000bqyf43t016hyf	9	0
cmfxj067e000bqyf43t016hyf	10	0
cmfxj067e000bqyf43t016hyf	15	0
cmfxj067e000bqyf43t016hyf	16	0
cmfxj067e000bqyf43t016hyf	18	0
cmfxj067e000bqyf43t016hyf	19	0
cmfxj067e000bqyf43t016hyf	21	0
cmfxj067e000bqyf43t016hyf	29	0
cmfxj067s000cqyf49h06e1bz	1	0
cmfxj067s000cqyf49h06e1bz	2	0
cmfxj067s000cqyf49h06e1bz	3	0
cmfxj067s000cqyf49h06e1bz	11	0
cmfxj067s000cqyf49h06e1bz	13	0
cmfxj067s000cqyf49h06e1bz	14	0
cmfxj067s000cqyf49h06e1bz	25	0
cmfxj067s000cqyf49h06e1bz	27	0
cmfxj067s000cqyf49h06e1bz	28	0
cmfxj067s000cqyf49h06e1bz	30	0
cmfxj0687000dqyf40al7mmdm	1	0
cmfxj0687000dqyf40al7mmdm	2	0
cmfxj0687000dqyf40al7mmdm	3	0
cmfxj0687000dqyf40al7mmdm	11	0
cmfxj0687000dqyf40al7mmdm	13	0
cmfxj0687000dqyf40al7mmdm	14	0
cmfxj0687000dqyf40al7mmdm	25	0
cmfxj0687000dqyf40al7mmdm	27	0
cmfxj0687000dqyf40al7mmdm	28	0
cmfxj0687000dqyf40al7mmdm	30	0
cmfxj068l000eqyf4iv29u1kz	4	0
cmfxj068l000eqyf4iv29u1kz	7	0
cmfxj068l000eqyf4iv29u1kz	9	0
cmfxj068l000eqyf4iv29u1kz	10	0
cmfxj068l000eqyf4iv29u1kz	15	0
cmfxj068l000eqyf4iv29u1kz	16	0
cmfxj068l000eqyf4iv29u1kz	18	0
cmfxj068l000eqyf4iv29u1kz	19	0
cmfxj068l000eqyf4iv29u1kz	21	0
cmfxj068l000eqyf4iv29u1kz	29	0
cmfxj068z000fqyf4hfpn3hzr	4	0
cmfxj068z000fqyf4hfpn3hzr	7	0
cmfxj068z000fqyf4hfpn3hzr	9	0
cmfxj068z000fqyf4hfpn3hzr	10	0
cmfxj068z000fqyf4hfpn3hzr	15	0
cmfxj068z000fqyf4hfpn3hzr	16	0
cmfxj068z000fqyf4hfpn3hzr	18	0
cmfxj068z000fqyf4hfpn3hzr	19	0
cmfxj068z000fqyf4hfpn3hzr	21	0
cmfxj068z000fqyf4hfpn3hzr	29	0
cmfxj069c000gqyf4sx8m1y3o	8	0
cmfxj069c000gqyf4sx8m1y3o	14	0
cmfxj069c000gqyf4sx8m1y3o	25	0
cmfxj069c000gqyf4sx8m1y3o	26	0
cmfxj069c000gqyf4sx8m1y3o	30	0
cmfxj069c000gqyf4sx8m1y3o	32	0
cmfxj069n000hqyf4jqfecti9	8	0
cmfxj069n000hqyf4jqfecti9	14	0
cmfxj069n000hqyf4jqfecti9	25	0
cmfxj069n000hqyf4jqfecti9	26	0
cmfxj069n000hqyf4jqfecti9	30	0
cmfxj069n000hqyf4jqfecti9	32	0
cmfxj069y000iqyf49t2nne4b	4	0
cmfxj069y000iqyf49t2nne4b	6	0
cmfxj069y000iqyf49t2nne4b	15	0
cmfxj069y000iqyf49t2nne4b	17	0
cmfxj069y000iqyf49t2nne4b	23	0
cmfxj069y000iqyf49t2nne4b	29	0
cmfxj06aa000jqyf42i8gaapi	4	0
cmfxj06aa000jqyf42i8gaapi	6	0
cmfxj06aa000jqyf42i8gaapi	15	0
cmfxj06aa000jqyf42i8gaapi	17	0
cmfxj06aa000jqyf42i8gaapi	23	0
cmfxj06aa000jqyf42i8gaapi	29	0
cmfxj06am000kqyf4bexungaa	1	0
cmfxj06am000kqyf4bexungaa	13	0
cmfxj06am000kqyf4bexungaa	14	0
cmfxj06am000kqyf4bexungaa	28	0
cmfxj06b0000lqyf4wjs9zuxt	1	0
cmfxj06b0000lqyf4wjs9zuxt	13	0
cmfxj06b0000lqyf4wjs9zuxt	14	0
cmfxj06b0000lqyf4wjs9zuxt	28	0
cmfxj06bd000mqyf4clxt8rld	1	0
cmfxj06bd000mqyf4clxt8rld	13	0
cmfxj06bd000mqyf4clxt8rld	14	0
cmfxj06bd000mqyf4clxt8rld	25	0
cmfxj06bd000mqyf4clxt8rld	28	0
cmfxj06bd000mqyf4clxt8rld	30	0
cmfxj06bm000nqyf4506fh414	1	0
cmfxj06bm000nqyf4506fh414	13	0
cmfxj06bm000nqyf4506fh414	14	0
cmfxj06bm000nqyf4506fh414	25	0
cmfxj06bm000nqyf4506fh414	28	0
cmfxj06bm000nqyf4506fh414	30	0
cmfxj06bw000oqyf4g79dsqjz	4	0
cmfxj06bw000oqyf4g79dsqjz	10	0
cmfxj06bw000oqyf4g79dsqjz	15	0
cmfxj06bw000oqyf4g79dsqjz	16	0
cmfxj06bw000oqyf4g79dsqjz	19	0
cmfxj06bw000oqyf4g79dsqjz	29	0
cmfxj06c5000pqyf4d2aedc5w	4	0
cmfxj06c5000pqyf4d2aedc5w	10	0
cmfxj06c5000pqyf4d2aedc5w	15	0
cmfxj06c5000pqyf4d2aedc5w	16	0
cmfxj06c5000pqyf4d2aedc5w	19	0
cmfxj06c5000pqyf4d2aedc5w	29	0
cmfxj06ce000qqyf499mks1as	8	0
cmfxj06ce000qqyf499mks1as	14	0
cmfxj06ce000qqyf499mks1as	25	0
cmfxj06ce000qqyf499mks1as	26	0
cmfxj06ce000qqyf499mks1as	30	0
cmfxj06ce000qqyf499mks1as	32	0
cmfxj06cm000rqyf4vk6eiayv	8	0
cmfxj06cm000rqyf4vk6eiayv	14	0
cmfxj06cm000rqyf4vk6eiayv	25	0
cmfxj06cm000rqyf4vk6eiayv	26	0
cmfxj06cm000rqyf4vk6eiayv	30	0
cmfxj06cm000rqyf4vk6eiayv	32	0
cmfxj06cu000sqyf4hfkxu3cp	4	0
cmfxj06cu000sqyf4hfkxu3cp	6	0
cmfxj06cu000sqyf4hfkxu3cp	15	0
cmfxj06cu000sqyf4hfkxu3cp	17	0
cmfxj06cu000sqyf4hfkxu3cp	23	0
cmfxj06cu000sqyf4hfkxu3cp	29	0
cmfxj06d3000tqyf4e7ko0xld	4	0
cmfxj06d3000tqyf4e7ko0xld	6	0
cmfxj06d3000tqyf4e7ko0xld	15	0
cmfxj06d3000tqyf4e7ko0xld	17	0
cmfxj06d3000tqyf4e7ko0xld	23	0
cmfxj06d3000tqyf4e7ko0xld	29	0
cmfxj06dc000uqyf4h8b7oazg	1	0
cmfxj06dc000uqyf4h8b7oazg	13	0
cmfxj06dc000uqyf4h8b7oazg	14	0
cmfxj06dc000uqyf4h8b7oazg	28	0
cmfxj06dn000vqyf4o1qlkzz3	1	0
cmfxj06dn000vqyf4o1qlkzz3	13	0
cmfxj06dn000vqyf4o1qlkzz3	14	0
cmfxj06dn000vqyf4o1qlkzz3	28	0
cmfxj06dw000wqyf4992rrgnl	1	0
cmfxj06dw000wqyf4992rrgnl	2	0
cmfxj06dw000wqyf4992rrgnl	3	0
cmfxj06dw000wqyf4992rrgnl	11	0
cmfxj06dw000wqyf4992rrgnl	13	0
cmfxj06dw000wqyf4992rrgnl	14	0
cmfxj06dw000wqyf4992rrgnl	25	0
cmfxj06dw000wqyf4992rrgnl	27	0
cmfxj06dw000wqyf4992rrgnl	28	0
cmfxj06dw000wqyf4992rrgnl	30	0
cmfxj06e6000xqyf4hmhzd05x	4	0
cmfxj06e6000xqyf4hmhzd05x	7	0
cmfxj06e6000xqyf4hmhzd05x	9	0
cmfxj06e6000xqyf4hmhzd05x	10	0
cmfxj06e6000xqyf4hmhzd05x	15	0
cmfxj06e6000xqyf4hmhzd05x	16	0
cmfxj06e6000xqyf4hmhzd05x	18	0
cmfxj06e6000xqyf4hmhzd05x	19	0
cmfxj06e6000xqyf4hmhzd05x	21	0
cmfxj06e6000xqyf4hmhzd05x	29	0
cmfxj06ef000yqyf4pp5gx5h1	2	0
cmfxj06ef000yqyf4pp5gx5h1	11	0
cmfxj06ef000yqyf4pp5gx5h1	12	0
cmfxj06ef000yqyf4pp5gx5h1	20	0
cmfxj06ef000yqyf4pp5gx5h1	22	0
cmfxj06ef000yqyf4pp5gx5h1	24	0
cmfxj06ef000yqyf4pp5gx5h1	27	0
cmfxj06ep000zqyf42im6zh2b	7	0
cmfxj06ep000zqyf42im6zh2b	9	0
cmfxj06ep000zqyf42im6zh2b	21	0
cmfxj06ew0010qyf46rabniha	1	0
cmfxj06ew0010qyf46rabniha	13	0
cmfxj06ew0010qyf46rabniha	14	0
cmfxj06ew0010qyf46rabniha	25	0
cmfxj06ew0010qyf46rabniha	28	0
cmfxj06ew0010qyf46rabniha	30	0
cmfxj06f20011qyf456y34hfv	4	0
cmfxj06f20011qyf456y34hfv	10	0
cmfxj06f20011qyf456y34hfv	15	0
cmfxj06f20011qyf456y34hfv	16	0
cmfxj06f20011qyf456y34hfv	19	0
cmfxj06f20011qyf456y34hfv	29	0
\.


--
-- Data for Name: TemplateVariant; Type: TABLE DATA; Schema: public; Owner: ritual
--

COPY public."TemplateVariant" ("templateId", "holePattern", "finishRequired") FROM stdin;
cmfxj063i0000qyf4ptstwhkl	NONE	f
cmfxj063i0000qyf4ptstwhkl	TWO_VERTICAL	f
cmfxj063i0000qyf4ptstwhkl	FOUR_CORNERS	f
cmfxj06440001qyf4tdpmqc9c	NONE	f
cmfxj06440001qyf4tdpmqc9c	TWO_VERTICAL	f
cmfxj06440001qyf4tdpmqc9c	FOUR_CORNERS	f
cmfxj064g0002qyf4t8iakes9	NONE	f
cmfxj064g0002qyf4t8iakes9	TWO_HORIZONTAL	f
cmfxj064g0002qyf4t8iakes9	FOUR_CORNERS	f
cmfxj064q0003qyf4jp5of5ag	NONE	f
cmfxj064q0003qyf4jp5of5ag	TWO_HORIZONTAL	f
cmfxj064q0003qyf4jp5of5ag	FOUR_CORNERS	f
cmfxj064y0004qyf473wtlu0v	NONE	f
cmfxj064y0004qyf473wtlu0v	TWO_VERTICAL	f
cmfxj065a0005qyf4x5jq9u9z	NONE	f
cmfxj065a0005qyf4x5jq9u9z	TWO_VERTICAL	f
cmfxj065j0006qyf4l0x3wtma	NONE	f
cmfxj065j0006qyf4l0x3wtma	TWO_HORIZONTAL	f
cmfxj065u0007qyf4qx03pn4o	NONE	f
cmfxj065u0007qyf4qx03pn4o	TWO_HORIZONTAL	f
cmfxj06630008qyf4t0tqg2xg	NONE	t
cmfxj06630008qyf4t0tqg2xg	TWO_VERTICAL	t
cmfxj06630008qyf4t0tqg2xg	FOUR_CORNERS	t
cmfxj066l0009qyf4inp7dimr	NONE	t
cmfxj066l0009qyf4inp7dimr	TWO_VERTICAL	t
cmfxj066l0009qyf4inp7dimr	FOUR_CORNERS	t
cmfxj0671000aqyf4bjeyuyld	NONE	t
cmfxj0671000aqyf4bjeyuyld	TWO_HORIZONTAL	t
cmfxj0671000aqyf4bjeyuyld	FOUR_CORNERS	t
cmfxj067e000bqyf43t016hyf	NONE	t
cmfxj067e000bqyf43t016hyf	TWO_HORIZONTAL	t
cmfxj067e000bqyf43t016hyf	FOUR_CORNERS	t
cmfxj067s000cqyf49h06e1bz	NONE	t
cmfxj067s000cqyf49h06e1bz	TWO_VERTICAL	t
cmfxj067s000cqyf49h06e1bz	FOUR_CORNERS	t
cmfxj0687000dqyf40al7mmdm	NONE	t
cmfxj0687000dqyf40al7mmdm	TWO_VERTICAL	t
cmfxj0687000dqyf40al7mmdm	FOUR_CORNERS	t
cmfxj068l000eqyf4iv29u1kz	NONE	t
cmfxj068l000eqyf4iv29u1kz	TWO_HORIZONTAL	t
cmfxj068l000eqyf4iv29u1kz	FOUR_CORNERS	t
cmfxj068z000fqyf4hfpn3hzr	NONE	t
cmfxj068z000fqyf4hfpn3hzr	TWO_HORIZONTAL	t
cmfxj068z000fqyf4hfpn3hzr	FOUR_CORNERS	t
cmfxj069c000gqyf4sx8m1y3o	NONE	t
cmfxj069c000gqyf4sx8m1y3o	TWO_VERTICAL	t
cmfxj069n000hqyf4jqfecti9	NONE	t
cmfxj069n000hqyf4jqfecti9	TWO_VERTICAL	t
cmfxj069y000iqyf49t2nne4b	NONE	t
cmfxj069y000iqyf49t2nne4b	TWO_HORIZONTAL	t
cmfxj06aa000jqyf42i8gaapi	NONE	t
cmfxj06aa000jqyf42i8gaapi	TWO_HORIZONTAL	t
cmfxj06am000kqyf4bexungaa	NONE	t
cmfxj06am000kqyf4bexungaa	TWO_VERTICAL	t
cmfxj06am000kqyf4bexungaa	FOUR_CORNERS	t
cmfxj06b0000lqyf4wjs9zuxt	NONE	t
cmfxj06b0000lqyf4wjs9zuxt	TWO_VERTICAL	t
cmfxj06b0000lqyf4wjs9zuxt	FOUR_CORNERS	t
cmfxj06bd000mqyf4clxt8rld	NONE	f
cmfxj06bd000mqyf4clxt8rld	TWO_VERTICAL	f
cmfxj06bd000mqyf4clxt8rld	FOUR_CORNERS	f
cmfxj06bm000nqyf4506fh414	NONE	f
cmfxj06bm000nqyf4506fh414	TWO_VERTICAL	f
cmfxj06bm000nqyf4506fh414	FOUR_CORNERS	f
cmfxj06bw000oqyf4g79dsqjz	NONE	f
cmfxj06bw000oqyf4g79dsqjz	TWO_HORIZONTAL	f
cmfxj06bw000oqyf4g79dsqjz	FOUR_CORNERS	f
cmfxj06c5000pqyf4d2aedc5w	NONE	f
cmfxj06c5000pqyf4d2aedc5w	TWO_HORIZONTAL	f
cmfxj06c5000pqyf4d2aedc5w	FOUR_CORNERS	f
cmfxj06ce000qqyf499mks1as	NONE	f
cmfxj06ce000qqyf499mks1as	TWO_VERTICAL	f
cmfxj06cm000rqyf4vk6eiayv	NONE	f
cmfxj06cm000rqyf4vk6eiayv	TWO_VERTICAL	f
cmfxj06cu000sqyf4hfkxu3cp	NONE	f
cmfxj06cu000sqyf4hfkxu3cp	TWO_HORIZONTAL	f
cmfxj06d3000tqyf4e7ko0xld	NONE	f
cmfxj06d3000tqyf4e7ko0xld	TWO_HORIZONTAL	f
cmfxj06dc000uqyf4h8b7oazg	NONE	f
cmfxj06dc000uqyf4h8b7oazg	TWO_VERTICAL	f
cmfxj06dc000uqyf4h8b7oazg	FOUR_CORNERS	f
cmfxj06dn000vqyf4o1qlkzz3	NONE	f
cmfxj06dn000vqyf4o1qlkzz3	TWO_VERTICAL	f
cmfxj06dn000vqyf4o1qlkzz3	FOUR_CORNERS	f
cmfxj06dw000wqyf4992rrgnl	NONE	t
cmfxj06dw000wqyf4992rrgnl	TWO_VERTICAL	t
cmfxj06dw000wqyf4992rrgnl	FOUR_CORNERS	t
cmfxj06e6000xqyf4hmhzd05x	NONE	t
cmfxj06e6000xqyf4hmhzd05x	TWO_HORIZONTAL	t
cmfxj06e6000xqyf4hmhzd05x	FOUR_CORNERS	t
cmfxj06ef000yqyf4pp5gx5h1	NONE	t
cmfxj06ef000yqyf4pp5gx5h1	TWO_VERTICAL	t
cmfxj06ep000zqyf42im6zh2b	NONE	t
cmfxj06ep000zqyf42im6zh2b	TWO_HORIZONTAL	t
cmfxj06ew0010qyf46rabniha	NONE	f
cmfxj06ew0010qyf46rabniha	TWO_VERTICAL	f
cmfxj06ew0010qyf46rabniha	FOUR_CORNERS	f
cmfxj06f20011qyf456y34hfv	NONE	f
cmfxj06f20011qyf456y34hfv	TWO_HORIZONTAL	f
cmfxj06f20011qyf456y34hfv	FOUR_CORNERS	f
\.


--
-- Data for Name: TemplateVariantFinish; Type: TABLE DATA; Schema: public; Owner: ritual
--

COPY public."TemplateVariantFinish" ("templateId", "holePattern", "finishId") FROM stdin;
cmfxj06630008qyf4t0tqg2xg	NONE	1
cmfxj06630008qyf4t0tqg2xg	NONE	2
cmfxj06630008qyf4t0tqg2xg	TWO_VERTICAL	1
cmfxj06630008qyf4t0tqg2xg	TWO_VERTICAL	2
cmfxj06630008qyf4t0tqg2xg	FOUR_CORNERS	1
cmfxj06630008qyf4t0tqg2xg	FOUR_CORNERS	2
cmfxj066l0009qyf4inp7dimr	NONE	1
cmfxj066l0009qyf4inp7dimr	NONE	2
cmfxj066l0009qyf4inp7dimr	TWO_VERTICAL	1
cmfxj066l0009qyf4inp7dimr	TWO_VERTICAL	2
cmfxj066l0009qyf4inp7dimr	FOUR_CORNERS	1
cmfxj066l0009qyf4inp7dimr	FOUR_CORNERS	2
cmfxj0671000aqyf4bjeyuyld	NONE	1
cmfxj0671000aqyf4bjeyuyld	NONE	2
cmfxj0671000aqyf4bjeyuyld	TWO_HORIZONTAL	1
cmfxj0671000aqyf4bjeyuyld	TWO_HORIZONTAL	2
cmfxj0671000aqyf4bjeyuyld	FOUR_CORNERS	1
cmfxj0671000aqyf4bjeyuyld	FOUR_CORNERS	2
cmfxj067e000bqyf43t016hyf	NONE	1
cmfxj067e000bqyf43t016hyf	NONE	2
cmfxj067e000bqyf43t016hyf	TWO_HORIZONTAL	1
cmfxj067e000bqyf43t016hyf	TWO_HORIZONTAL	2
cmfxj067e000bqyf43t016hyf	FOUR_CORNERS	1
cmfxj067e000bqyf43t016hyf	FOUR_CORNERS	2
cmfxj067s000cqyf49h06e1bz	NONE	1
cmfxj067s000cqyf49h06e1bz	NONE	2
cmfxj067s000cqyf49h06e1bz	TWO_VERTICAL	1
cmfxj067s000cqyf49h06e1bz	TWO_VERTICAL	2
cmfxj067s000cqyf49h06e1bz	FOUR_CORNERS	1
cmfxj067s000cqyf49h06e1bz	FOUR_CORNERS	2
cmfxj0687000dqyf40al7mmdm	NONE	1
cmfxj0687000dqyf40al7mmdm	NONE	2
cmfxj0687000dqyf40al7mmdm	TWO_VERTICAL	1
cmfxj0687000dqyf40al7mmdm	TWO_VERTICAL	2
cmfxj0687000dqyf40al7mmdm	FOUR_CORNERS	1
cmfxj0687000dqyf40al7mmdm	FOUR_CORNERS	2
cmfxj068l000eqyf4iv29u1kz	NONE	1
cmfxj068l000eqyf4iv29u1kz	NONE	2
cmfxj068l000eqyf4iv29u1kz	TWO_HORIZONTAL	1
cmfxj068l000eqyf4iv29u1kz	TWO_HORIZONTAL	2
cmfxj068l000eqyf4iv29u1kz	FOUR_CORNERS	1
cmfxj068l000eqyf4iv29u1kz	FOUR_CORNERS	2
cmfxj068z000fqyf4hfpn3hzr	NONE	1
cmfxj068z000fqyf4hfpn3hzr	NONE	2
cmfxj068z000fqyf4hfpn3hzr	TWO_HORIZONTAL	1
cmfxj068z000fqyf4hfpn3hzr	TWO_HORIZONTAL	2
cmfxj068z000fqyf4hfpn3hzr	FOUR_CORNERS	1
cmfxj068z000fqyf4hfpn3hzr	FOUR_CORNERS	2
cmfxj069c000gqyf4sx8m1y3o	NONE	1
cmfxj069c000gqyf4sx8m1y3o	NONE	2
cmfxj069c000gqyf4sx8m1y3o	TWO_VERTICAL	1
cmfxj069c000gqyf4sx8m1y3o	TWO_VERTICAL	2
cmfxj069n000hqyf4jqfecti9	NONE	1
cmfxj069n000hqyf4jqfecti9	NONE	2
cmfxj069n000hqyf4jqfecti9	TWO_VERTICAL	1
cmfxj069n000hqyf4jqfecti9	TWO_VERTICAL	2
cmfxj069y000iqyf49t2nne4b	NONE	1
cmfxj069y000iqyf49t2nne4b	NONE	2
cmfxj069y000iqyf49t2nne4b	TWO_HORIZONTAL	1
cmfxj069y000iqyf49t2nne4b	TWO_HORIZONTAL	2
cmfxj06aa000jqyf42i8gaapi	NONE	1
cmfxj06aa000jqyf42i8gaapi	NONE	2
cmfxj06aa000jqyf42i8gaapi	TWO_HORIZONTAL	1
cmfxj06aa000jqyf42i8gaapi	TWO_HORIZONTAL	2
cmfxj06am000kqyf4bexungaa	NONE	1
cmfxj06am000kqyf4bexungaa	NONE	2
cmfxj06am000kqyf4bexungaa	TWO_VERTICAL	1
cmfxj06am000kqyf4bexungaa	TWO_VERTICAL	2
cmfxj06am000kqyf4bexungaa	FOUR_CORNERS	1
cmfxj06am000kqyf4bexungaa	FOUR_CORNERS	2
cmfxj06b0000lqyf4wjs9zuxt	NONE	1
cmfxj06b0000lqyf4wjs9zuxt	NONE	2
cmfxj06b0000lqyf4wjs9zuxt	TWO_VERTICAL	1
cmfxj06b0000lqyf4wjs9zuxt	TWO_VERTICAL	2
cmfxj06b0000lqyf4wjs9zuxt	FOUR_CORNERS	1
cmfxj06b0000lqyf4wjs9zuxt	FOUR_CORNERS	2
cmfxj06dw000wqyf4992rrgnl	NONE	1
cmfxj06dw000wqyf4992rrgnl	NONE	2
cmfxj06dw000wqyf4992rrgnl	TWO_VERTICAL	1
cmfxj06dw000wqyf4992rrgnl	TWO_VERTICAL	2
cmfxj06dw000wqyf4992rrgnl	FOUR_CORNERS	1
cmfxj06dw000wqyf4992rrgnl	FOUR_CORNERS	2
cmfxj06e6000xqyf4hmhzd05x	NONE	1
cmfxj06e6000xqyf4hmhzd05x	NONE	2
cmfxj06e6000xqyf4hmhzd05x	TWO_HORIZONTAL	1
cmfxj06e6000xqyf4hmhzd05x	TWO_HORIZONTAL	2
cmfxj06e6000xqyf4hmhzd05x	FOUR_CORNERS	1
cmfxj06e6000xqyf4hmhzd05x	FOUR_CORNERS	2
cmfxj06ef000yqyf4pp5gx5h1	NONE	2
cmfxj06ef000yqyf4pp5gx5h1	TWO_VERTICAL	2
cmfxj06ep000zqyf42im6zh2b	NONE	2
cmfxj06ep000zqyf42im6zh2b	TWO_HORIZONTAL	2
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: ritual
--

COPY public."User" (id, email, "passwordHash", name, phone, role, "createdAt", "updatedAt") FROM stdin;
cmgp3juxo00003lv3wt83oaf3	admin@example.com	$argon2id$v=19$m=65536,t=3,p=4$YenMHbpAmL1RV6UO98opJA$lc1v6Eux/r2nBB+fm0gDcDEF5MgrXN+RsO6YEorzgXA	Super Admin	\N	ADMIN	2025-10-13 12:15:47.292	2025-10-13 12:15:47.292
cmgp3l1l800003lvlmabni0a4	1	$argon2id$v=19$m=65536,t=3,p=4$uuI/NuA2LSjo+ewdzDXAhA$r/YY9BPCZVWHY0vZabqh2rx9WiiYmjmURwzyrNiGDZA	Super Admin	\N	ADMIN	2025-10-13 12:16:42.573	2025-10-13 12:16:42.573
cmgq5jhkq00003liz26xp5do4	wwqewqe@www.rr	$argon2id$v=19$m=65536,t=3,p=4$GKJSA6InfVj7XaQ2QdRtFA$NmYb6BjJuZsojyLcFlGApy80SjYQiQvCBgI/EG9DvHE	\N	\N	CUSTOMER	2025-10-14 05:59:15.386	2025-10-14 05:59:15.386
cmgqjqoot00043leeqba9x6d1	example@alejandro.dre	$argon2id$v=19$m=65536,t=3,p=4$lWEwZKa8cscQ4YdKrUm4Xw$TFnO+6BfgC5Lqv44+og6lGCzKarVBrkiT6/ld8c6Qfs	Александр Пример 1	+7 999 999 9999	CUSTOMER	2025-10-14 12:36:45.822	2025-10-14 12:36:45.822
cmgx8kfj600003lbydkxlhqui	vasya@pupkin.doma	$argon2id$v=19$m=65536,t=3,p=4$QCoaNXNN19jWJiTqDQhl4A$Cdbm7rkkS0qc+WWNjAE2fI/uznEChFFzeoB1A8I3Ing	vasya pupkin	+7 988 888 88 88	CUSTOMER	2025-10-19 04:58:21.474	2025-10-19 04:58:21.474
cmgyvi2zs00053l796nmye9jz	asd@fgh.yt	$argon2id$v=19$m=65536,t=3,p=4$1FMM9ID2Dehg2JzjrgoSBw$GF/WSaypOUTiHjTPVpohFwy5oWUcZqwsbCM0KoMfqbI	Евгений Тук	+7 989 888 88 88	CUSTOMER	2025-10-20 08:28:09.256	2025-10-20 08:28:09.256
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: ritual
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
c391ad95-94cd-4725-9d4d-98aab3e9dff1	b36d0de2ea0ad1c8d3e2f7eb357b93be20bbb1dc4ef5d075883321210b23ed45	2025-09-30 08:58:47.452784+00	20250829043246_init_catalog	\N	\N	2025-09-30 08:58:47.371484+00	1
6a79a1c0-d7bb-4d71-b491-fa8f69d853af	829ddde30c421d7b6393ee195aa3593f30aa8fdc299aac367b81c2171b12b955	2025-10-16 04:59:17.769699+00	20251016045917_order_item_assets	\N	\N	2025-10-16 04:59:17.742091+00	1
c85c763a-6dd3-4009-875b-13bafe13377d	668a66939e4e470919c78327dd4d4b2e3e0b3e6ec7e396ce0c53a37b5e0a37c4	2025-09-30 08:58:47.459328+00	20250830053330_new1234	\N	\N	2025-09-30 08:58:47.453329+00	1
d597a4a6-c9cb-4c57-911f-c7b353246669	af355babcfeccbea0115aa5b01d23e8ea81eb6705b379ec8d76af6f0aedcf6a6	2025-09-30 08:58:47.474539+00	20250901044325_another	\N	\N	2025-09-30 08:58:47.459905+00	1
504c5c10-3824-4036-a49c-95dde5287358	3e1b4203164bee4e82684230fe333d324bf0e0d0d343ff0e2f78770a1d5d1c3a	2025-09-30 08:58:47.478291+00	20250911063507_update_order_status_field	\N	\N	2025-09-30 08:58:47.475364+00	1
17772850-d1ee-427c-a3fa-32a1dd06358e	bfdc4c9f725548f0c99980b6e7540069d59a022c0f34a08a6e42a0ee2576653e	2025-10-16 05:10:18.467396+00	20251016051018_order_item_asset_kind_primary	\N	\N	2025-10-16 05:10:18.462106+00	1
f3c3d4ce-5c62-44bd-b1db-06bd53581735	5fdf6d6d28a6c027e6e2809eba111f0351a80098a1a4dc255dda4775e4ad9645	2025-09-30 08:58:47.482201+00	20250911064157_update_order_number_status_field	\N	\N	2025-09-30 08:58:47.478798+00	1
a77b0933-90ba-4776-983a-c723136e48c5	9bf5f11d2d643fe654b239fa9c44e1de828649ab587d7ee06371393b1cf83b9e	2025-09-30 08:58:47.484663+00	20250911064426_update_customer_email_field	\N	\N	2025-09-30 08:58:47.482614+00	1
98de086e-3571-481c-9365-98286013a354	2e84c1860f1b5293c5459e8e7668aa2a4c894ae24bdbefbf0ca8e30f13af9d3f	2025-09-30 08:58:47.48851+00	20250914082325_update_asset_model_fields	\N	\N	2025-09-30 08:58:47.485379+00	1
9b243baa-5efc-4524-9e3c-e8f77f4664ac	07c771ea3331949e82f3b3704d4d9814c4a91139e3638b660e34119e5dcdb60c	2025-09-30 08:58:47.491867+00	20250914082500_update_asset_size_and_mime_fields	\N	\N	2025-09-30 08:58:47.489196+00	1
fce00bf2-9b4f-419c-8008-25064249c2fe	b36d0de2ea0ad1c8d3e2f7eb357b93be20bbb1dc4ef5d075883321210b23ed45	2025-09-24 04:56:33.890035+00	20250829043246_init_catalog	\N	\N	2025-09-24 04:56:33.813476+00	1
9c1c150c-a137-434f-b79a-ba2198e20b22	668a66939e4e470919c78327dd4d4b2e3e0b3e6ec7e396ce0c53a37b5e0a37c4	2025-09-24 04:56:33.896061+00	20250830053330_new1234	\N	\N	2025-09-24 04:56:33.890712+00	1
743951c5-681e-4207-ab1d-643a830a4f61	af355babcfeccbea0115aa5b01d23e8ea81eb6705b379ec8d76af6f0aedcf6a6	2025-09-24 04:56:33.910274+00	20250901044325_another	\N	\N	2025-09-24 04:56:33.896607+00	1
c3ca1b2d-461d-49ed-81ad-0d7229543d3b	3e1b4203164bee4e82684230fe333d324bf0e0d0d343ff0e2f78770a1d5d1c3a	2025-09-24 04:56:33.913057+00	20250911063507_update_order_status_field	\N	\N	2025-09-24 04:56:33.91066+00	1
3d8d701d-302c-4b6d-866d-e8b87069a78c	5fdf6d6d28a6c027e6e2809eba111f0351a80098a1a4dc255dda4775e4ad9645	2025-09-24 04:56:33.91601+00	20250911064157_update_order_number_status_field	\N	\N	2025-09-24 04:56:33.913474+00	1
d8549812-f3e1-4626-9f8a-491572aa6272	9bf5f11d2d643fe654b239fa9c44e1de828649ab587d7ee06371393b1cf83b9e	2025-09-24 04:56:33.918048+00	20250911064426_update_customer_email_field	\N	\N	2025-09-24 04:56:33.916366+00	1
a31607fa-89a2-4476-953f-b67daed6623f	2e84c1860f1b5293c5459e8e7668aa2a4c894ae24bdbefbf0ca8e30f13af9d3f	2025-09-24 04:56:33.920483+00	20250914082325_update_asset_model_fields	\N	\N	2025-09-24 04:56:33.918619+00	1
86428c48-3889-43f6-a138-8dbea2dfa013	07c771ea3331949e82f3b3704d4d9814c4a91139e3638b660e34119e5dcdb60c	2025-09-24 04:56:33.922697+00	20250914082500_update_asset_size_and_mime_fields	\N	\N	2025-09-24 04:56:33.920914+00	1
99203e5e-3d0c-4171-9855-3f1d76484d93	47012695dd7eb99cbf2f774d06024888e3a56c6d0612f434673e64584a76c8b4	2025-10-11 11:19:52.08662+00	20251011111952_add_pricing	\N	\N	2025-10-11 11:19:52.074112+00	1
ad840bf1-73f3-49c9-a130-c00e7875f00e	3b284febd6d6439ac46d488d01f58be1ceaa4fc299d202010450b3d14c20d799	2025-10-13 06:55:20.751365+00	20251013065520_users_and_roles	\N	\N	2025-10-13 06:55:20.725679+00	1
\.


--
-- Name: Background_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ritual
--

SELECT pg_catalog.setval('public."Background_id_seq"', 76, true);


--
-- Name: FinishVariant_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ritual
--

SELECT pg_catalog.setval('public."FinishVariant_id_seq"', 4, true);


--
-- Name: Frame_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ritual
--

SELECT pg_catalog.setval('public."Frame_id_seq"', 12, true);


--
-- Name: Size_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ritual
--

SELECT pg_catalog.setval('public."Size_id_seq"', 64, true);


--
-- Name: Background Background_pkey; Type: CONSTRAINT; Schema: public; Owner: ritual
--

ALTER TABLE ONLY public."Background"
    ADD CONSTRAINT "Background_pkey" PRIMARY KEY (id);


--
-- Name: FinishVariant FinishVariant_pkey; Type: CONSTRAINT; Schema: public; Owner: ritual
--

ALTER TABLE ONLY public."FinishVariant"
    ADD CONSTRAINT "FinishVariant_pkey" PRIMARY KEY (id);


--
-- Name: Frame Frame_pkey; Type: CONSTRAINT; Schema: public; Owner: ritual
--

ALTER TABLE ONLY public."Frame"
    ADD CONSTRAINT "Frame_pkey" PRIMARY KEY (id);


--
-- Name: OrderItemAsset OrderItemAsset_pkey; Type: CONSTRAINT; Schema: public; Owner: ritual
--

ALTER TABLE ONLY public."OrderItemAsset"
    ADD CONSTRAINT "OrderItemAsset_pkey" PRIMARY KEY (id);


--
-- Name: OrderItemPerson OrderItemPerson_pkey; Type: CONSTRAINT; Schema: public; Owner: ritual
--

ALTER TABLE ONLY public."OrderItemPerson"
    ADD CONSTRAINT "OrderItemPerson_pkey" PRIMARY KEY (id);


--
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: ritual
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: ritual
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: RefreshSession RefreshSession_pkey; Type: CONSTRAINT; Schema: public; Owner: ritual
--

ALTER TABLE ONLY public."RefreshSession"
    ADD CONSTRAINT "RefreshSession_pkey" PRIMARY KEY (id);


--
-- Name: Size Size_pkey; Type: CONSTRAINT; Schema: public; Owner: ritual
--

ALTER TABLE ONLY public."Size"
    ADD CONSTRAINT "Size_pkey" PRIMARY KEY (id);


--
-- Name: TemplateBackground TemplateBackground_pkey; Type: CONSTRAINT; Schema: public; Owner: ritual
--

ALTER TABLE ONLY public."TemplateBackground"
    ADD CONSTRAINT "TemplateBackground_pkey" PRIMARY KEY ("templateId", "backgroundId");


--
-- Name: TemplateFinish TemplateFinish_pkey; Type: CONSTRAINT; Schema: public; Owner: ritual
--

ALTER TABLE ONLY public."TemplateFinish"
    ADD CONSTRAINT "TemplateFinish_pkey" PRIMARY KEY ("templateId", finish);


--
-- Name: TemplateFrame TemplateFrame_pkey; Type: CONSTRAINT; Schema: public; Owner: ritual
--

ALTER TABLE ONLY public."TemplateFrame"
    ADD CONSTRAINT "TemplateFrame_pkey" PRIMARY KEY ("templateId", "frameId");


--
-- Name: TemplateHole TemplateHole_pkey; Type: CONSTRAINT; Schema: public; Owner: ritual
--

ALTER TABLE ONLY public."TemplateHole"
    ADD CONSTRAINT "TemplateHole_pkey" PRIMARY KEY ("templateId", pattern);


--
-- Name: TemplateSize TemplateSize_pkey; Type: CONSTRAINT; Schema: public; Owner: ritual
--

ALTER TABLE ONLY public."TemplateSize"
    ADD CONSTRAINT "TemplateSize_pkey" PRIMARY KEY ("templateId", "sizeId");


--
-- Name: TemplateVariantFinish TemplateVariantFinish_pkey; Type: CONSTRAINT; Schema: public; Owner: ritual
--

ALTER TABLE ONLY public."TemplateVariantFinish"
    ADD CONSTRAINT "TemplateVariantFinish_pkey" PRIMARY KEY ("templateId", "holePattern", "finishId");


--
-- Name: TemplateVariant TemplateVariant_pkey; Type: CONSTRAINT; Schema: public; Owner: ritual
--

ALTER TABLE ONLY public."TemplateVariant"
    ADD CONSTRAINT "TemplateVariant_pkey" PRIMARY KEY ("templateId", "holePattern");


--
-- Name: Template Template_pkey; Type: CONSTRAINT; Schema: public; Owner: ritual
--

ALTER TABLE ONLY public."Template"
    ADD CONSTRAINT "Template_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: ritual
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: ritual
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Background_code_key; Type: INDEX; Schema: public; Owner: ritual
--

CREATE UNIQUE INDEX "Background_code_key" ON public."Background" USING btree (code);


--
-- Name: FinishVariant_code_key; Type: INDEX; Schema: public; Owner: ritual
--

CREATE UNIQUE INDEX "FinishVariant_code_key" ON public."FinishVariant" USING btree (code);


--
-- Name: Frame_code_key; Type: INDEX; Schema: public; Owner: ritual
--

CREATE UNIQUE INDEX "Frame_code_key" ON public."Frame" USING btree (code);


--
-- Name: OrderItemAsset_orderItemId_createdAt_idx; Type: INDEX; Schema: public; Owner: ritual
--

CREATE INDEX "OrderItemAsset_orderItemId_createdAt_idx" ON public."OrderItemAsset" USING btree ("orderItemId", "createdAt");


--
-- Name: OrderItemPerson_itemId_idx; Type: INDEX; Schema: public; Owner: ritual
--

CREATE INDEX "OrderItemPerson_itemId_idx" ON public."OrderItemPerson" USING btree ("itemId");


--
-- Name: OrderItem_backgroundId_idx; Type: INDEX; Schema: public; Owner: ritual
--

CREATE INDEX "OrderItem_backgroundId_idx" ON public."OrderItem" USING btree ("backgroundId");


--
-- Name: OrderItem_frameId_idx; Type: INDEX; Schema: public; Owner: ritual
--

CREATE INDEX "OrderItem_frameId_idx" ON public."OrderItem" USING btree ("frameId");


--
-- Name: OrderItem_orderId_idx; Type: INDEX; Schema: public; Owner: ritual
--

CREATE INDEX "OrderItem_orderId_idx" ON public."OrderItem" USING btree ("orderId");


--
-- Name: OrderItem_sizeId_idx; Type: INDEX; Schema: public; Owner: ritual
--

CREATE INDEX "OrderItem_sizeId_idx" ON public."OrderItem" USING btree ("sizeId");


--
-- Name: OrderItem_templateId_idx; Type: INDEX; Schema: public; Owner: ritual
--

CREATE INDEX "OrderItem_templateId_idx" ON public."OrderItem" USING btree ("templateId");


--
-- Name: Order_number_key; Type: INDEX; Schema: public; Owner: ritual
--

CREATE UNIQUE INDEX "Order_number_key" ON public."Order" USING btree (number);


--
-- Name: Order_orderNumber_key; Type: INDEX; Schema: public; Owner: ritual
--

CREATE UNIQUE INDEX "Order_orderNumber_key" ON public."Order" USING btree ("orderNumber");


--
-- Name: Size_heightCm_widthCm_idx; Type: INDEX; Schema: public; Owner: ritual
--

CREATE INDEX "Size_heightCm_widthCm_idx" ON public."Size" USING btree ("heightCm", "widthCm");


--
-- Name: Size_widthCm_heightCm_key; Type: INDEX; Schema: public; Owner: ritual
--

CREATE UNIQUE INDEX "Size_widthCm_heightCm_key" ON public."Size" USING btree ("widthCm", "heightCm");


--
-- Name: Template_code_key; Type: INDEX; Schema: public; Owner: ritual
--

CREATE UNIQUE INDEX "Template_code_key" ON public."Template" USING btree (code);


--
-- Name: Template_colorMode_idx; Type: INDEX; Schema: public; Owner: ritual
--

CREATE INDEX "Template_colorMode_idx" ON public."Template" USING btree ("colorMode");


--
-- Name: Template_material_shape_idx; Type: INDEX; Schema: public; Owner: ritual
--

CREATE INDEX "Template_material_shape_idx" ON public."Template" USING btree (material, shape);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: ritual
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: OrderItemAsset OrderItemAsset_orderItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ritual
--

ALTER TABLE ONLY public."OrderItemAsset"
    ADD CONSTRAINT "OrderItemAsset_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES public."OrderItem"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItemPerson OrderItemPerson_itemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ritual
--

ALTER TABLE ONLY public."OrderItemPerson"
    ADD CONSTRAINT "OrderItemPerson_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES public."OrderItem"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItem OrderItem_backgroundId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ritual
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_backgroundId_fkey" FOREIGN KEY ("backgroundId") REFERENCES public."Background"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_frameId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ritual
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_frameId_fkey" FOREIGN KEY ("frameId") REFERENCES public."Frame"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ritual
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItem OrderItem_sizeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ritual
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES public."Size"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ritual
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public."Template"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ritual
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Order Order_managerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ritual
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: RefreshSession RefreshSession_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ritual
--

ALTER TABLE ONLY public."RefreshSession"
    ADD CONSTRAINT "RefreshSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TemplateBackground TemplateBackground_backgroundId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ritual
--

ALTER TABLE ONLY public."TemplateBackground"
    ADD CONSTRAINT "TemplateBackground_backgroundId_fkey" FOREIGN KEY ("backgroundId") REFERENCES public."Background"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TemplateBackground TemplateBackground_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ritual
--

ALTER TABLE ONLY public."TemplateBackground"
    ADD CONSTRAINT "TemplateBackground_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public."Template"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TemplateFinish TemplateFinish_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ritual
--

ALTER TABLE ONLY public."TemplateFinish"
    ADD CONSTRAINT "TemplateFinish_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public."Template"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TemplateFrame TemplateFrame_frameId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ritual
--

ALTER TABLE ONLY public."TemplateFrame"
    ADD CONSTRAINT "TemplateFrame_frameId_fkey" FOREIGN KEY ("frameId") REFERENCES public."Frame"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TemplateFrame TemplateFrame_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ritual
--

ALTER TABLE ONLY public."TemplateFrame"
    ADD CONSTRAINT "TemplateFrame_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public."Template"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TemplateHole TemplateHole_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ritual
--

ALTER TABLE ONLY public."TemplateHole"
    ADD CONSTRAINT "TemplateHole_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public."Template"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TemplateSize TemplateSize_sizeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ritual
--

ALTER TABLE ONLY public."TemplateSize"
    ADD CONSTRAINT "TemplateSize_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES public."Size"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TemplateSize TemplateSize_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ritual
--

ALTER TABLE ONLY public."TemplateSize"
    ADD CONSTRAINT "TemplateSize_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public."Template"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TemplateVariantFinish TemplateVariantFinish_finishId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ritual
--

ALTER TABLE ONLY public."TemplateVariantFinish"
    ADD CONSTRAINT "TemplateVariantFinish_finishId_fkey" FOREIGN KEY ("finishId") REFERENCES public."FinishVariant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TemplateVariantFinish TemplateVariantFinish_templateId_holePattern_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ritual
--

ALTER TABLE ONLY public."TemplateVariantFinish"
    ADD CONSTRAINT "TemplateVariantFinish_templateId_holePattern_fkey" FOREIGN KEY ("templateId", "holePattern") REFERENCES public."TemplateVariant"("templateId", "holePattern") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TemplateVariant TemplateVariant_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ritual
--

ALTER TABLE ONLY public."TemplateVariant"
    ADD CONSTRAINT "TemplateVariant_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public."Template"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict ePWcAAWTULIN9po8UbWgyvrfy2mGGsLgyGtOqWT0zf0lfXWcwsHDMhenDJaZIuB

