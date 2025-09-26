--
-- PostgreSQL database dump
--

\restrict 8HEX67Hbh2b1rwONWeh11Egcnu89XbANobIuVMzOhia6n9mPRPftiMNKxklVDSb

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
-- Name: AssetKind; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AssetKind" AS ENUM (
    'PHOTO',
    'REFERENCE',
    'DOCUMENT'
);


--
-- Name: ColorMode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ColorMode" AS ENUM (
    'BW',
    'COLOR'
);


--
-- Name: Coverage; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Coverage" AS ENUM (
    'NORMAL',
    'FULL_WRAP'
);


--
-- Name: Finish; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Finish" AS ENUM (
    'MATTE',
    'GLOSS'
);


--
-- Name: HolePattern; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."HolePattern" AS ENUM (
    'NONE',
    'TWO_HORIZONTAL',
    'TWO_VERTICAL',
    'FOUR_CORNERS'
);


--
-- Name: Material; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Material" AS ENUM (
    'CERMET',
    'WHITE_CERAMIC_GRANITE',
    'BLACK_CERAMIC_GRANITE',
    'GLASS',
    'GROWTH_PHOTOCERAMICS',
    'ENGRAVING'
);


--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'DRAFT',
    'ACCEPTED',
    'IN_PROGRESS',
    'APPROVAL',
    'SENT',
    'READY'
);


--
-- Name: Orientation; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Orientation" AS ENUM (
    'VERTICAL',
    'HORIZONTAL'
);


--
-- Name: Shape; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Shape" AS ENUM (
    'RECTANGLE',
    'OVAL',
    'ARCH',
    'STAR',
    'HEART'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Asset; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Asset" (
    id text NOT NULL,
    "itemId" text NOT NULL,
    kind public."AssetKind" NOT NULL,
    filename text NOT NULL,
    url text,
    "primary" boolean DEFAULT false NOT NULL,
    note text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    mime text,
    size integer
);


--
-- Name: Background; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Background" (
    id integer NOT NULL,
    code integer NOT NULL,
    name text NOT NULL
);


--
-- Name: Background_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Background_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Background_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Background_id_seq" OWNED BY public."Background".id;


--
-- Name: FinishVariant; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."FinishVariant" (
    id integer NOT NULL,
    code text NOT NULL,
    label text NOT NULL
);


--
-- Name: FinishVariant_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."FinishVariant_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: FinishVariant_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."FinishVariant_id_seq" OWNED BY public."FinishVariant".id;


--
-- Name: Frame; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Frame" (
    id integer NOT NULL,
    code integer NOT NULL,
    name text NOT NULL
);


--
-- Name: Frame_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Frame_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Frame_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Frame_id_seq" OWNED BY public."Frame".id;


--
-- Name: Order; Type: TABLE; Schema: public; Owner: -
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
    "customerEmail" text
);


--
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: -
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
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: OrderItemPerson; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: Size; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Size" (
    id integer NOT NULL,
    "widthCm" integer NOT NULL,
    "heightCm" integer NOT NULL,
    label text NOT NULL
);


--
-- Name: Size_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Size_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Size_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Size_id_seq" OWNED BY public."Size".id;


--
-- Name: Template; Type: TABLE; Schema: public; Owner: -
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
    material public."Material" NOT NULL
);


--
-- Name: TemplateBackground; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TemplateBackground" (
    "templateId" text NOT NULL,
    "backgroundId" integer NOT NULL
);


--
-- Name: TemplateFinish; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TemplateFinish" (
    "templateId" text NOT NULL,
    finish public."Finish" NOT NULL
);


--
-- Name: TemplateFrame; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TemplateFrame" (
    "templateId" text NOT NULL,
    "frameId" integer NOT NULL
);


--
-- Name: TemplateHole; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TemplateHole" (
    "templateId" text NOT NULL,
    pattern public."HolePattern" NOT NULL
);


--
-- Name: TemplateSize; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TemplateSize" (
    "templateId" text NOT NULL,
    "sizeId" integer NOT NULL
);


--
-- Name: TemplateVariant; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TemplateVariant" (
    "templateId" text NOT NULL,
    "holePattern" public."HolePattern" NOT NULL,
    "finishRequired" boolean DEFAULT false NOT NULL
);


--
-- Name: TemplateVariantFinish; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TemplateVariantFinish" (
    "templateId" text NOT NULL,
    "holePattern" public."HolePattern" NOT NULL,
    "finishId" integer NOT NULL
);


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: Background id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Background" ALTER COLUMN id SET DEFAULT nextval('public."Background_id_seq"'::regclass);


--
-- Name: FinishVariant id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FinishVariant" ALTER COLUMN id SET DEFAULT nextval('public."FinishVariant_id_seq"'::regclass);


--
-- Name: Frame id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Frame" ALTER COLUMN id SET DEFAULT nextval('public."Frame_id_seq"'::regclass);


--
-- Name: Size id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Size" ALTER COLUMN id SET DEFAULT nextval('public."Size_id_seq"'::regclass);


--
-- Data for Name: Asset; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Asset" (id, "itemId", kind, filename, url, "primary", note, "createdAt", mime, size) FROM stdin;
\.


--
-- Data for Name: Background; Type: TABLE DATA; Schema: public; Owner: -
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
-- Data for Name: FinishVariant; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."FinishVariant" (id, code, label) FROM stdin;
1	MATTE	Матовый
2	GLOSS	Глянец
\.


--
-- Data for Name: Frame; Type: TABLE DATA; Schema: public; Owner: -
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
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Order" (id, number, "customerName", "customerPhone", "intakePoint", delivery, "intakeDate", "approveNeeded", "createdAt", "updatedAt", "orderStatus", "orderNumber", "customerEmail") FROM stdin;
cmfyytrs90000oh2vqeoj7p1n	20250925-4952	aaa	sssss			2025-09-25 05:21:31.101	f	2025-09-25 05:21:31.104	2025-09-25 05:26:18.518	IN_PROGRESS	RS-20250925-0002	ddsdsd
cmfyz2kpi0000p42w8zxgpkd1	20250925-7322					2025-09-25 05:28:21.844	f	2025-09-25 05:28:21.845	2025-09-25 05:28:21.845	DRAFT	\N	\N
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."OrderItem" (id, "orderId", "templateId", "sizeId", "holePattern", "frameId", "backgroundId", finish, comment, "templateCode", "templateLabel", "createdAt", "updatedAt") FROM stdin;
cmfyytrt50002oh2v84gebtxe	cmfyytrs90000oh2vqeoj7p1n	cmfxj063i0000qyf4ptstwhkl	5	NONE	1	1	\N	\N	CERM-T-R-V-BW	Табличка Т верт. ч/б	2025-09-25 05:21:31.145	2025-09-25 05:21:31.145
cmfyz2kqg0002p42w93r6y7qv	cmfyz2kpi0000p42w8zxgpkd1	cmfxj063i0000qyf4ptstwhkl	5	NONE	1	1	\N	\N	CERM-T-R-V-BW	Табличка Т верт. ч/б	2025-09-25 05:28:21.88	2025-09-25 05:28:21.88
\.


--
-- Data for Name: OrderItemPerson; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."OrderItemPerson" (id, "itemId", "lastName", "firstName", "middleName", "birthDate", "deathDate") FROM stdin;
\.


--
-- Data for Name: Size; Type: TABLE DATA; Schema: public; Owner: -
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
-- Data for Name: Template; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Template" (id, code, label, shape, orientation, "colorMode", coverage, "supportsFrame", "requiresBackground", "requiresFinish", "supportsHoles", "personsMin", "personsMax", notes, "createdAt", "updatedAt", material) FROM stdin;
cmfxj063i0000qyf4ptstwhkl	CERM-T-R-V-BW	Табличка Т верт. ч/б	RECTANGLE	VERTICAL	BW	NORMAL	t	f	f	t	1	1	\N	2025-09-24 05:10:49.567	2025-09-25 13:27:16.344	CERMET
cmfxj06440001qyf4tdpmqc9c	CERM-T-R-V-C	Табличка Т верт. цвет	RECTANGLE	VERTICAL	COLOR	NORMAL	t	f	f	t	1	1	\N	2025-09-24 05:10:49.589	2025-09-25 13:27:16.378	CERMET
cmfxj064g0002qyf4t8iakes9	CERM-T-R-H-BW	Табличка Т гор. ч/б	RECTANGLE	HORIZONTAL	BW	NORMAL	t	f	f	t	1	1	\N	2025-09-24 05:10:49.601	2025-09-25 13:27:16.387	CERMET
cmfxj064q0003qyf4jp5of5ag	CERM-T-R-H-C	Табличка Т гор. цвет	RECTANGLE	HORIZONTAL	COLOR	NORMAL	t	f	f	t	1	1	\N	2025-09-24 05:10:49.61	2025-09-25 13:27:16.397	CERMET
cmfxj064y0004qyf473wtlu0v	CERM-O-OV-V-BW	Овал верт. ч/б	OVAL	VERTICAL	BW	NORMAL	t	f	f	t	1	1	\N	2025-09-24 05:10:49.619	2025-09-25 13:27:16.406	CERMET
cmfxj065a0005qyf4x5jq9u9z	CERM-O-OV-V-C	Овал верт. цвет	OVAL	VERTICAL	COLOR	NORMAL	t	f	f	t	1	1	\N	2025-09-24 05:10:49.63	2025-09-25 13:27:16.417	CERMET
cmfxj065j0006qyf4l0x3wtma	CERM-O-OV-H-BW	Овал гор. ч/б	OVAL	HORIZONTAL	BW	NORMAL	t	f	f	t	1	1	\N	2025-09-24 05:10:49.64	2025-09-25 13:27:16.427	CERMET
cmfxj065u0007qyf4qx03pn4o	CERM-O-OV-H-C	Овал гор. цвет	OVAL	HORIZONTAL	COLOR	NORMAL	t	f	f	t	1	1	\N	2025-09-24 05:10:49.65	2025-09-25 13:27:16.438	CERMET
cmfxj06630008qyf4t0tqg2xg	WCG-T-R-V-BW	Керамогранит бел. табличка верт. ч/б	RECTANGLE	VERTICAL	BW	NORMAL	f	t	t	t	1	1	\N	2025-09-24 05:10:49.659	2025-09-25 13:27:16.447	WHITE_CERAMIC_GRANITE
cmfxj066l0009qyf4inp7dimr	WCG-T-R-V-C	Керамогранит бел. табличка верт. цвет	RECTANGLE	VERTICAL	COLOR	NORMAL	f	t	t	t	1	1	\N	2025-09-24 05:10:49.677	2025-09-25 13:27:16.464	WHITE_CERAMIC_GRANITE
cmfxj0671000aqyf4bjeyuyld	WCG-T-R-H-BW	Керамогранит бел. табличка гор. ч/б	RECTANGLE	HORIZONTAL	BW	NORMAL	f	t	t	t	1	1	\N	2025-09-24 05:10:49.693	2025-09-25 13:27:16.479	WHITE_CERAMIC_GRANITE
cmfxj067e000bqyf43t016hyf	WCG-T-R-H-C	Керамогранит бел. табличка гор. цвет	RECTANGLE	HORIZONTAL	COLOR	NORMAL	f	t	t	t	1	1	\N	2025-09-24 05:10:49.707	2025-09-25 13:27:16.497	WHITE_CERAMIC_GRANITE
cmfxj067s000cqyf49h06e1bz	WCG-TF-R-V-BW	Керамогранит бел. табличка полная верт. ч/б	RECTANGLE	VERTICAL	BW	FULL_WRAP	f	t	t	t	1	1	\N	2025-09-24 05:10:49.72	2025-09-25 13:27:16.515	WHITE_CERAMIC_GRANITE
cmfxj0687000dqyf40al7mmdm	WCG-TF-R-V-C	Керамогранит бел. табличка полная верт. цвет	RECTANGLE	VERTICAL	COLOR	FULL_WRAP	f	t	t	t	1	1	\N	2025-09-24 05:10:49.735	2025-09-25 13:27:16.533	WHITE_CERAMIC_GRANITE
cmfxj068l000eqyf4iv29u1kz	WCG-TF-R-H-BW	Керамогранит бел. табличка полная гор. ч/б	RECTANGLE	HORIZONTAL	BW	FULL_WRAP	f	t	t	t	1	1	\N	2025-09-24 05:10:49.75	2025-09-25 13:27:16.55	WHITE_CERAMIC_GRANITE
cmfxj068z000fqyf4hfpn3hzr	WCG-TF-R-H-C	Керамогранит бел. табличка полная гор. цвет	RECTANGLE	HORIZONTAL	COLOR	FULL_WRAP	f	t	t	t	1	1	\N	2025-09-24 05:10:49.763	2025-09-25 13:27:16.566	WHITE_CERAMIC_GRANITE
cmfxj069c000gqyf4sx8m1y3o	WCG-O-OV-V-BW	Керамогранит бел. овал верт. ч/б	OVAL	VERTICAL	BW	NORMAL	f	t	t	t	1	1	\N	2025-09-24 05:10:49.776	2025-09-25 13:27:16.581	WHITE_CERAMIC_GRANITE
cmfxj069n000hqyf4jqfecti9	WCG-O-OV-V-C	Керамогранит бел. овал верт. цвет	OVAL	VERTICAL	COLOR	NORMAL	f	t	t	t	1	1	\N	2025-09-24 05:10:49.787	2025-09-25 13:27:16.594	WHITE_CERAMIC_GRANITE
cmfxj069y000iqyf49t2nne4b	WCG-O-OV-H-BW	Керамогранит бел. овал гор. ч/б	OVAL	HORIZONTAL	BW	NORMAL	f	t	t	t	1	1	\N	2025-09-24 05:10:49.799	2025-09-25 13:27:16.605	WHITE_CERAMIC_GRANITE
cmfxj06aa000jqyf42i8gaapi	WCG-O-OV-H-C	Керамогранит бел. овал гор. цвет	OVAL	HORIZONTAL	COLOR	NORMAL	f	t	t	t	1	1	\N	2025-09-24 05:10:49.81	2025-09-25 13:27:16.615	WHITE_CERAMIC_GRANITE
cmfxj06am000kqyf4bexungaa	WCG-A-AR-V-BW	Керамогранит бел. арка верт. ч/б	ARCH	VERTICAL	BW	NORMAL	f	t	t	t	1	1	\N	2025-09-24 05:10:49.822	2025-09-25 13:27:16.626	WHITE_CERAMIC_GRANITE
cmfxj06b0000lqyf4wjs9zuxt	WCG-A-AR-V-C	Керамогранит бел. арка верт. цвет	ARCH	VERTICAL	COLOR	NORMAL	f	t	t	t	1	1	\N	2025-09-24 05:10:49.836	2025-09-25 13:27:16.643	WHITE_CERAMIC_GRANITE
cmfxj06bd000mqyf4clxt8rld	GLS-T-R-V-BW	Стекло табличка верт. ч/б	RECTANGLE	VERTICAL	BW	NORMAL	f	t	f	t	1	1	\N	2025-09-24 05:10:49.849	2025-09-25 13:27:16.663	GLASS
cmfxj06bm000nqyf4506fh414	GLS-T-R-V-C	Стекло табличка верт. цвет	RECTANGLE	VERTICAL	COLOR	NORMAL	f	t	f	t	1	1	\N	2025-09-24 05:10:49.858	2025-09-25 13:27:16.677	GLASS
cmfxj06bw000oqyf4g79dsqjz	GLS-T-R-H-BW	Стекло табличка гор. ч/б	RECTANGLE	HORIZONTAL	BW	NORMAL	f	t	f	t	1	1	\N	2025-09-24 05:10:49.868	2025-09-25 13:27:16.69	GLASS
cmfxj06c5000pqyf4d2aedc5w	GLS-T-R-H-C	Стекло табличка гор. цвет	RECTANGLE	HORIZONTAL	COLOR	NORMAL	f	t	f	t	1	1	\N	2025-09-24 05:10:49.878	2025-09-25 13:27:16.703	GLASS
cmfxj06ce000qqyf499mks1as	GLS-O-OV-V-BW	Стекло овал верт. ч/б	OVAL	VERTICAL	BW	NORMAL	f	t	f	t	1	1	\N	2025-09-24 05:10:49.886	2025-09-25 13:27:16.716	GLASS
cmfxj06cm000rqyf4vk6eiayv	GLS-O-OV-V-C	Стекло овал верт. цвет	OVAL	VERTICAL	COLOR	NORMAL	f	t	f	t	1	1	\N	2025-09-24 05:10:49.894	2025-09-25 13:27:16.728	GLASS
cmfxj06cu000sqyf4hfkxu3cp	GLS-O-OV-H-BW	Стекло овал гор. ч/б	OVAL	HORIZONTAL	BW	NORMAL	f	t	f	t	1	1	\N	2025-09-24 05:10:49.903	2025-09-25 13:27:16.739	GLASS
cmfxj06d3000tqyf4e7ko0xld	GLS-O-OV-H-C	Стекло овал гор. цвет	OVAL	HORIZONTAL	COLOR	NORMAL	f	t	f	t	1	1	\N	2025-09-24 05:10:49.911	2025-09-25 13:27:16.751	GLASS
cmfxj06dc000uqyf4h8b7oazg	GLS-A-AR-V-BW	Стекло арка верт. ч/б	ARCH	VERTICAL	BW	NORMAL	f	t	f	t	1	1	\N	2025-09-24 05:10:49.92	2025-09-25 13:27:16.762	GLASS
cmfxj06dn000vqyf4o1qlkzz3	GLS-A-AR-V-C	Стекло арка верт. цвет	ARCH	VERTICAL	COLOR	NORMAL	f	t	f	t	1	1	\N	2025-09-24 05:10:49.931	2025-09-25 13:27:16.776	GLASS
cmfxj06dw000wqyf4992rrgnl	BCG-T-R-V-BW	Керамогранит чёрный верт. ч/б	RECTANGLE	VERTICAL	BW	NORMAL	f	f	t	t	1	1	\N	2025-09-24 05:10:49.941	2025-09-25 13:27:16.793	BLACK_CERAMIC_GRANITE
cmfxj06e6000xqyf4hmhzd05x	BCG-T-R-H-BW	Керамогранит чёрный гор. ч/б	RECTANGLE	HORIZONTAL	BW	NORMAL	f	f	t	t	1	1	\N	2025-09-24 05:10:49.95	2025-09-25 13:27:16.808	BLACK_CERAMIC_GRANITE
cmfxj06ef000yqyf4pp5gx5h1	GROWTH-R-V-C	Ростовая фотокерамика верт. цвет	RECTANGLE	VERTICAL	COLOR	NORMAL	f	f	t	t	1	1	\N	2025-09-24 05:10:49.959	2025-09-25 13:27:16.825	GROWTH_PHOTOCERAMICS
cmfxj06ep000zqyf42im6zh2b	GROWTH-R-H-C	Ростовая фотокерамика гор. цвет	RECTANGLE	HORIZONTAL	COLOR	NORMAL	f	f	t	t	1	1	\N	2025-09-24 05:10:49.97	2025-09-25 13:27:16.837	GROWTH_PHOTOCERAMICS
cmfxj06ew0010qyf46rabniha	ENGR-R-V-BW	Гравировка верт. ч/б	RECTANGLE	VERTICAL	BW	NORMAL	f	f	f	t	1	1	\N	2025-09-24 05:10:49.977	2025-09-25 13:27:16.847	ENGRAVING
cmfxj06f20011qyf456y34hfv	ENGR-R-H-BW	Гравировка гор. ч/б	RECTANGLE	HORIZONTAL	BW	NORMAL	f	f	f	t	1	1	\N	2025-09-24 05:10:49.983	2025-09-25 13:27:16.854	ENGRAVING
\.


--
-- Data for Name: TemplateBackground; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TemplateBackground" ("templateId", "backgroundId") FROM stdin;
cmfxj063i0000qyf4ptstwhkl	1
cmfxj063i0000qyf4ptstwhkl	2
cmfxj063i0000qyf4ptstwhkl	4
cmfxj063i0000qyf4ptstwhkl	5
cmfxj063i0000qyf4ptstwhkl	7
cmfxj063i0000qyf4ptstwhkl	10
cmfxj063i0000qyf4ptstwhkl	12
cmfxj063i0000qyf4ptstwhkl	13
cmfxj063i0000qyf4ptstwhkl	21
cmfxj063i0000qyf4ptstwhkl	23
cmfxj063i0000qyf4ptstwhkl	31
cmfxj063i0000qyf4ptstwhkl	32
cmfxj063i0000qyf4ptstwhkl	34
cmfxj063i0000qyf4ptstwhkl	36
cmfxj06440001qyf4tdpmqc9c	1
cmfxj06440001qyf4tdpmqc9c	2
cmfxj06440001qyf4tdpmqc9c	4
cmfxj06440001qyf4tdpmqc9c	5
cmfxj06440001qyf4tdpmqc9c	7
cmfxj06440001qyf4tdpmqc9c	10
cmfxj06440001qyf4tdpmqc9c	12
cmfxj06440001qyf4tdpmqc9c	13
cmfxj06440001qyf4tdpmqc9c	21
cmfxj06440001qyf4tdpmqc9c	23
cmfxj06440001qyf4tdpmqc9c	31
cmfxj06440001qyf4tdpmqc9c	32
cmfxj06440001qyf4tdpmqc9c	34
cmfxj06440001qyf4tdpmqc9c	36
cmfxj064g0002qyf4t8iakes9	1
cmfxj064g0002qyf4t8iakes9	2
cmfxj064g0002qyf4t8iakes9	4
cmfxj064g0002qyf4t8iakes9	5
cmfxj064g0002qyf4t8iakes9	7
cmfxj064g0002qyf4t8iakes9	10
cmfxj064g0002qyf4t8iakes9	12
cmfxj064g0002qyf4t8iakes9	13
cmfxj064g0002qyf4t8iakes9	21
cmfxj064g0002qyf4t8iakes9	23
cmfxj064g0002qyf4t8iakes9	31
cmfxj064g0002qyf4t8iakes9	32
cmfxj064g0002qyf4t8iakes9	34
cmfxj064g0002qyf4t8iakes9	36
cmfxj064q0003qyf4jp5of5ag	1
cmfxj064q0003qyf4jp5of5ag	2
cmfxj064q0003qyf4jp5of5ag	4
cmfxj064q0003qyf4jp5of5ag	5
cmfxj064q0003qyf4jp5of5ag	7
cmfxj064q0003qyf4jp5of5ag	10
cmfxj064q0003qyf4jp5of5ag	12
cmfxj064q0003qyf4jp5of5ag	13
cmfxj064q0003qyf4jp5of5ag	21
cmfxj064q0003qyf4jp5of5ag	23
cmfxj064q0003qyf4jp5of5ag	31
cmfxj064q0003qyf4jp5of5ag	32
cmfxj064q0003qyf4jp5of5ag	34
cmfxj064q0003qyf4jp5of5ag	36
cmfxj064y0004qyf473wtlu0v	1
cmfxj064y0004qyf473wtlu0v	2
cmfxj064y0004qyf473wtlu0v	3
cmfxj064y0004qyf473wtlu0v	4
cmfxj064y0004qyf473wtlu0v	5
cmfxj064y0004qyf473wtlu0v	6
cmfxj064y0004qyf473wtlu0v	7
cmfxj064y0004qyf473wtlu0v	8
cmfxj064y0004qyf473wtlu0v	9
cmfxj064y0004qyf473wtlu0v	10
cmfxj064y0004qyf473wtlu0v	11
cmfxj064y0004qyf473wtlu0v	12
cmfxj064y0004qyf473wtlu0v	13
cmfxj064y0004qyf473wtlu0v	14
cmfxj064y0004qyf473wtlu0v	15
cmfxj064y0004qyf473wtlu0v	16
cmfxj064y0004qyf473wtlu0v	17
cmfxj064y0004qyf473wtlu0v	18
cmfxj064y0004qyf473wtlu0v	19
cmfxj064y0004qyf473wtlu0v	20
cmfxj064y0004qyf473wtlu0v	21
cmfxj064y0004qyf473wtlu0v	22
cmfxj064y0004qyf473wtlu0v	23
cmfxj064y0004qyf473wtlu0v	24
cmfxj064y0004qyf473wtlu0v	25
cmfxj064y0004qyf473wtlu0v	26
cmfxj064y0004qyf473wtlu0v	27
cmfxj064y0004qyf473wtlu0v	28
cmfxj064y0004qyf473wtlu0v	29
cmfxj064y0004qyf473wtlu0v	30
cmfxj064y0004qyf473wtlu0v	31
cmfxj064y0004qyf473wtlu0v	32
cmfxj064y0004qyf473wtlu0v	33
cmfxj064y0004qyf473wtlu0v	34
cmfxj064y0004qyf473wtlu0v	35
cmfxj064y0004qyf473wtlu0v	36
cmfxj064y0004qyf473wtlu0v	37
cmfxj064y0004qyf473wtlu0v	38
cmfxj065a0005qyf4x5jq9u9z	1
cmfxj065a0005qyf4x5jq9u9z	2
cmfxj065a0005qyf4x5jq9u9z	3
cmfxj065a0005qyf4x5jq9u9z	4
cmfxj065a0005qyf4x5jq9u9z	5
cmfxj065a0005qyf4x5jq9u9z	6
cmfxj065a0005qyf4x5jq9u9z	7
cmfxj065a0005qyf4x5jq9u9z	8
cmfxj065a0005qyf4x5jq9u9z	9
cmfxj065a0005qyf4x5jq9u9z	10
cmfxj065a0005qyf4x5jq9u9z	11
cmfxj065a0005qyf4x5jq9u9z	12
cmfxj065a0005qyf4x5jq9u9z	13
cmfxj065a0005qyf4x5jq9u9z	14
cmfxj065a0005qyf4x5jq9u9z	15
cmfxj065a0005qyf4x5jq9u9z	16
cmfxj065a0005qyf4x5jq9u9z	17
cmfxj065a0005qyf4x5jq9u9z	18
cmfxj065a0005qyf4x5jq9u9z	19
cmfxj065a0005qyf4x5jq9u9z	20
cmfxj065a0005qyf4x5jq9u9z	21
cmfxj065a0005qyf4x5jq9u9z	22
cmfxj065a0005qyf4x5jq9u9z	23
cmfxj065a0005qyf4x5jq9u9z	24
cmfxj065a0005qyf4x5jq9u9z	25
cmfxj065a0005qyf4x5jq9u9z	26
cmfxj065a0005qyf4x5jq9u9z	27
cmfxj065a0005qyf4x5jq9u9z	28
cmfxj065a0005qyf4x5jq9u9z	29
cmfxj065a0005qyf4x5jq9u9z	30
cmfxj065a0005qyf4x5jq9u9z	31
cmfxj065a0005qyf4x5jq9u9z	32
cmfxj065a0005qyf4x5jq9u9z	33
cmfxj065a0005qyf4x5jq9u9z	34
cmfxj065a0005qyf4x5jq9u9z	35
cmfxj065a0005qyf4x5jq9u9z	36
cmfxj065a0005qyf4x5jq9u9z	37
cmfxj065a0005qyf4x5jq9u9z	38
cmfxj065j0006qyf4l0x3wtma	1
cmfxj065j0006qyf4l0x3wtma	2
cmfxj065j0006qyf4l0x3wtma	3
cmfxj065j0006qyf4l0x3wtma	4
cmfxj065j0006qyf4l0x3wtma	5
cmfxj065j0006qyf4l0x3wtma	6
cmfxj065j0006qyf4l0x3wtma	7
cmfxj065j0006qyf4l0x3wtma	8
cmfxj065j0006qyf4l0x3wtma	9
cmfxj065j0006qyf4l0x3wtma	10
cmfxj065j0006qyf4l0x3wtma	11
cmfxj065j0006qyf4l0x3wtma	12
cmfxj065j0006qyf4l0x3wtma	13
cmfxj065j0006qyf4l0x3wtma	14
cmfxj065j0006qyf4l0x3wtma	15
cmfxj065j0006qyf4l0x3wtma	16
cmfxj065j0006qyf4l0x3wtma	17
cmfxj065j0006qyf4l0x3wtma	18
cmfxj065j0006qyf4l0x3wtma	19
cmfxj065j0006qyf4l0x3wtma	20
cmfxj065j0006qyf4l0x3wtma	21
cmfxj065j0006qyf4l0x3wtma	22
cmfxj065j0006qyf4l0x3wtma	23
cmfxj065j0006qyf4l0x3wtma	24
cmfxj065j0006qyf4l0x3wtma	25
cmfxj065j0006qyf4l0x3wtma	26
cmfxj065j0006qyf4l0x3wtma	27
cmfxj065j0006qyf4l0x3wtma	28
cmfxj065j0006qyf4l0x3wtma	29
cmfxj065j0006qyf4l0x3wtma	30
cmfxj065j0006qyf4l0x3wtma	31
cmfxj065j0006qyf4l0x3wtma	32
cmfxj065j0006qyf4l0x3wtma	33
cmfxj065j0006qyf4l0x3wtma	34
cmfxj065j0006qyf4l0x3wtma	35
cmfxj065j0006qyf4l0x3wtma	36
cmfxj065j0006qyf4l0x3wtma	37
cmfxj065j0006qyf4l0x3wtma	38
cmfxj065u0007qyf4qx03pn4o	1
cmfxj065u0007qyf4qx03pn4o	2
cmfxj065u0007qyf4qx03pn4o	3
cmfxj065u0007qyf4qx03pn4o	4
cmfxj065u0007qyf4qx03pn4o	5
cmfxj065u0007qyf4qx03pn4o	6
cmfxj065u0007qyf4qx03pn4o	7
cmfxj065u0007qyf4qx03pn4o	8
cmfxj065u0007qyf4qx03pn4o	9
cmfxj065u0007qyf4qx03pn4o	10
cmfxj065u0007qyf4qx03pn4o	11
cmfxj065u0007qyf4qx03pn4o	12
cmfxj065u0007qyf4qx03pn4o	13
cmfxj065u0007qyf4qx03pn4o	14
cmfxj065u0007qyf4qx03pn4o	15
cmfxj065u0007qyf4qx03pn4o	16
cmfxj065u0007qyf4qx03pn4o	17
cmfxj065u0007qyf4qx03pn4o	18
cmfxj065u0007qyf4qx03pn4o	19
cmfxj065u0007qyf4qx03pn4o	20
cmfxj065u0007qyf4qx03pn4o	21
cmfxj065u0007qyf4qx03pn4o	22
cmfxj065u0007qyf4qx03pn4o	23
cmfxj065u0007qyf4qx03pn4o	24
cmfxj065u0007qyf4qx03pn4o	25
cmfxj065u0007qyf4qx03pn4o	26
cmfxj065u0007qyf4qx03pn4o	27
cmfxj065u0007qyf4qx03pn4o	28
cmfxj065u0007qyf4qx03pn4o	29
cmfxj065u0007qyf4qx03pn4o	30
cmfxj065u0007qyf4qx03pn4o	31
cmfxj065u0007qyf4qx03pn4o	32
cmfxj065u0007qyf4qx03pn4o	33
cmfxj065u0007qyf4qx03pn4o	34
cmfxj065u0007qyf4qx03pn4o	35
cmfxj065u0007qyf4qx03pn4o	36
cmfxj065u0007qyf4qx03pn4o	37
cmfxj065u0007qyf4qx03pn4o	38
cmfxj06630008qyf4t0tqg2xg	1
cmfxj06630008qyf4t0tqg2xg	2
cmfxj06630008qyf4t0tqg2xg	3
cmfxj06630008qyf4t0tqg2xg	4
cmfxj06630008qyf4t0tqg2xg	5
cmfxj06630008qyf4t0tqg2xg	6
cmfxj06630008qyf4t0tqg2xg	7
cmfxj06630008qyf4t0tqg2xg	8
cmfxj06630008qyf4t0tqg2xg	9
cmfxj06630008qyf4t0tqg2xg	10
cmfxj06630008qyf4t0tqg2xg	11
cmfxj06630008qyf4t0tqg2xg	12
cmfxj06630008qyf4t0tqg2xg	13
cmfxj06630008qyf4t0tqg2xg	14
cmfxj06630008qyf4t0tqg2xg	15
cmfxj06630008qyf4t0tqg2xg	16
cmfxj06630008qyf4t0tqg2xg	17
cmfxj06630008qyf4t0tqg2xg	18
cmfxj06630008qyf4t0tqg2xg	19
cmfxj06630008qyf4t0tqg2xg	20
cmfxj06630008qyf4t0tqg2xg	21
cmfxj06630008qyf4t0tqg2xg	22
cmfxj06630008qyf4t0tqg2xg	23
cmfxj06630008qyf4t0tqg2xg	24
cmfxj06630008qyf4t0tqg2xg	25
cmfxj06630008qyf4t0tqg2xg	26
cmfxj06630008qyf4t0tqg2xg	27
cmfxj06630008qyf4t0tqg2xg	28
cmfxj06630008qyf4t0tqg2xg	29
cmfxj06630008qyf4t0tqg2xg	30
cmfxj06630008qyf4t0tqg2xg	31
cmfxj06630008qyf4t0tqg2xg	32
cmfxj06630008qyf4t0tqg2xg	33
cmfxj06630008qyf4t0tqg2xg	34
cmfxj06630008qyf4t0tqg2xg	35
cmfxj06630008qyf4t0tqg2xg	36
cmfxj06630008qyf4t0tqg2xg	37
cmfxj06630008qyf4t0tqg2xg	38
cmfxj066l0009qyf4inp7dimr	1
cmfxj066l0009qyf4inp7dimr	2
cmfxj066l0009qyf4inp7dimr	3
cmfxj066l0009qyf4inp7dimr	4
cmfxj066l0009qyf4inp7dimr	5
cmfxj066l0009qyf4inp7dimr	6
cmfxj066l0009qyf4inp7dimr	7
cmfxj066l0009qyf4inp7dimr	8
cmfxj066l0009qyf4inp7dimr	9
cmfxj066l0009qyf4inp7dimr	10
cmfxj066l0009qyf4inp7dimr	11
cmfxj066l0009qyf4inp7dimr	12
cmfxj066l0009qyf4inp7dimr	13
cmfxj066l0009qyf4inp7dimr	14
cmfxj066l0009qyf4inp7dimr	15
cmfxj066l0009qyf4inp7dimr	16
cmfxj066l0009qyf4inp7dimr	17
cmfxj066l0009qyf4inp7dimr	18
cmfxj066l0009qyf4inp7dimr	19
cmfxj066l0009qyf4inp7dimr	20
cmfxj066l0009qyf4inp7dimr	21
cmfxj066l0009qyf4inp7dimr	22
cmfxj066l0009qyf4inp7dimr	23
cmfxj066l0009qyf4inp7dimr	24
cmfxj066l0009qyf4inp7dimr	25
cmfxj066l0009qyf4inp7dimr	26
cmfxj066l0009qyf4inp7dimr	27
cmfxj066l0009qyf4inp7dimr	28
cmfxj066l0009qyf4inp7dimr	29
cmfxj066l0009qyf4inp7dimr	30
cmfxj066l0009qyf4inp7dimr	31
cmfxj066l0009qyf4inp7dimr	32
cmfxj066l0009qyf4inp7dimr	33
cmfxj066l0009qyf4inp7dimr	34
cmfxj066l0009qyf4inp7dimr	35
cmfxj066l0009qyf4inp7dimr	36
cmfxj066l0009qyf4inp7dimr	37
cmfxj066l0009qyf4inp7dimr	38
cmfxj0671000aqyf4bjeyuyld	1
cmfxj0671000aqyf4bjeyuyld	2
cmfxj0671000aqyf4bjeyuyld	3
cmfxj0671000aqyf4bjeyuyld	4
cmfxj0671000aqyf4bjeyuyld	5
cmfxj0671000aqyf4bjeyuyld	6
cmfxj0671000aqyf4bjeyuyld	7
cmfxj0671000aqyf4bjeyuyld	8
cmfxj0671000aqyf4bjeyuyld	9
cmfxj0671000aqyf4bjeyuyld	10
cmfxj0671000aqyf4bjeyuyld	11
cmfxj0671000aqyf4bjeyuyld	12
cmfxj0671000aqyf4bjeyuyld	13
cmfxj0671000aqyf4bjeyuyld	14
cmfxj0671000aqyf4bjeyuyld	15
cmfxj0671000aqyf4bjeyuyld	16
cmfxj0671000aqyf4bjeyuyld	17
cmfxj0671000aqyf4bjeyuyld	18
cmfxj0671000aqyf4bjeyuyld	19
cmfxj0671000aqyf4bjeyuyld	20
cmfxj0671000aqyf4bjeyuyld	21
cmfxj0671000aqyf4bjeyuyld	22
cmfxj0671000aqyf4bjeyuyld	23
cmfxj0671000aqyf4bjeyuyld	24
cmfxj0671000aqyf4bjeyuyld	25
cmfxj0671000aqyf4bjeyuyld	26
cmfxj0671000aqyf4bjeyuyld	27
cmfxj0671000aqyf4bjeyuyld	28
cmfxj0671000aqyf4bjeyuyld	29
cmfxj0671000aqyf4bjeyuyld	30
cmfxj0671000aqyf4bjeyuyld	31
cmfxj0671000aqyf4bjeyuyld	32
cmfxj0671000aqyf4bjeyuyld	33
cmfxj0671000aqyf4bjeyuyld	34
cmfxj0671000aqyf4bjeyuyld	35
cmfxj0671000aqyf4bjeyuyld	36
cmfxj0671000aqyf4bjeyuyld	37
cmfxj0671000aqyf4bjeyuyld	38
cmfxj067e000bqyf43t016hyf	1
cmfxj067e000bqyf43t016hyf	2
cmfxj067e000bqyf43t016hyf	3
cmfxj067e000bqyf43t016hyf	4
cmfxj067e000bqyf43t016hyf	5
cmfxj067e000bqyf43t016hyf	6
cmfxj067e000bqyf43t016hyf	7
cmfxj067e000bqyf43t016hyf	8
cmfxj067e000bqyf43t016hyf	9
cmfxj067e000bqyf43t016hyf	10
cmfxj067e000bqyf43t016hyf	11
cmfxj067e000bqyf43t016hyf	12
cmfxj067e000bqyf43t016hyf	13
cmfxj067e000bqyf43t016hyf	14
cmfxj067e000bqyf43t016hyf	15
cmfxj067e000bqyf43t016hyf	16
cmfxj067e000bqyf43t016hyf	17
cmfxj067e000bqyf43t016hyf	18
cmfxj067e000bqyf43t016hyf	19
cmfxj067e000bqyf43t016hyf	20
cmfxj067e000bqyf43t016hyf	21
cmfxj067e000bqyf43t016hyf	22
cmfxj067e000bqyf43t016hyf	23
cmfxj067e000bqyf43t016hyf	24
cmfxj067e000bqyf43t016hyf	25
cmfxj067e000bqyf43t016hyf	26
cmfxj067e000bqyf43t016hyf	27
cmfxj067e000bqyf43t016hyf	28
cmfxj067e000bqyf43t016hyf	29
cmfxj067e000bqyf43t016hyf	30
cmfxj067e000bqyf43t016hyf	31
cmfxj067e000bqyf43t016hyf	32
cmfxj067e000bqyf43t016hyf	33
cmfxj067e000bqyf43t016hyf	34
cmfxj067e000bqyf43t016hyf	35
cmfxj067e000bqyf43t016hyf	36
cmfxj067e000bqyf43t016hyf	37
cmfxj067e000bqyf43t016hyf	38
cmfxj067s000cqyf49h06e1bz	1
cmfxj067s000cqyf49h06e1bz	2
cmfxj067s000cqyf49h06e1bz	3
cmfxj067s000cqyf49h06e1bz	4
cmfxj067s000cqyf49h06e1bz	5
cmfxj067s000cqyf49h06e1bz	6
cmfxj067s000cqyf49h06e1bz	7
cmfxj067s000cqyf49h06e1bz	8
cmfxj067s000cqyf49h06e1bz	9
cmfxj067s000cqyf49h06e1bz	10
cmfxj067s000cqyf49h06e1bz	11
cmfxj067s000cqyf49h06e1bz	12
cmfxj067s000cqyf49h06e1bz	13
cmfxj067s000cqyf49h06e1bz	14
cmfxj067s000cqyf49h06e1bz	15
cmfxj067s000cqyf49h06e1bz	16
cmfxj067s000cqyf49h06e1bz	17
cmfxj067s000cqyf49h06e1bz	18
cmfxj067s000cqyf49h06e1bz	19
cmfxj067s000cqyf49h06e1bz	20
cmfxj067s000cqyf49h06e1bz	21
cmfxj067s000cqyf49h06e1bz	22
cmfxj067s000cqyf49h06e1bz	23
cmfxj067s000cqyf49h06e1bz	24
cmfxj067s000cqyf49h06e1bz	25
cmfxj067s000cqyf49h06e1bz	26
cmfxj067s000cqyf49h06e1bz	27
cmfxj067s000cqyf49h06e1bz	28
cmfxj067s000cqyf49h06e1bz	29
cmfxj067s000cqyf49h06e1bz	30
cmfxj067s000cqyf49h06e1bz	31
cmfxj067s000cqyf49h06e1bz	32
cmfxj067s000cqyf49h06e1bz	33
cmfxj067s000cqyf49h06e1bz	34
cmfxj067s000cqyf49h06e1bz	35
cmfxj067s000cqyf49h06e1bz	36
cmfxj067s000cqyf49h06e1bz	37
cmfxj067s000cqyf49h06e1bz	38
cmfxj0687000dqyf40al7mmdm	1
cmfxj0687000dqyf40al7mmdm	2
cmfxj0687000dqyf40al7mmdm	3
cmfxj0687000dqyf40al7mmdm	4
cmfxj0687000dqyf40al7mmdm	5
cmfxj0687000dqyf40al7mmdm	6
cmfxj0687000dqyf40al7mmdm	7
cmfxj0687000dqyf40al7mmdm	8
cmfxj0687000dqyf40al7mmdm	9
cmfxj0687000dqyf40al7mmdm	10
cmfxj0687000dqyf40al7mmdm	11
cmfxj0687000dqyf40al7mmdm	12
cmfxj0687000dqyf40al7mmdm	13
cmfxj0687000dqyf40al7mmdm	14
cmfxj0687000dqyf40al7mmdm	15
cmfxj0687000dqyf40al7mmdm	16
cmfxj0687000dqyf40al7mmdm	17
cmfxj0687000dqyf40al7mmdm	18
cmfxj0687000dqyf40al7mmdm	19
cmfxj0687000dqyf40al7mmdm	20
cmfxj0687000dqyf40al7mmdm	21
cmfxj0687000dqyf40al7mmdm	22
cmfxj0687000dqyf40al7mmdm	23
cmfxj0687000dqyf40al7mmdm	24
cmfxj0687000dqyf40al7mmdm	25
cmfxj0687000dqyf40al7mmdm	26
cmfxj0687000dqyf40al7mmdm	27
cmfxj0687000dqyf40al7mmdm	28
cmfxj0687000dqyf40al7mmdm	29
cmfxj0687000dqyf40al7mmdm	30
cmfxj0687000dqyf40al7mmdm	31
cmfxj0687000dqyf40al7mmdm	32
cmfxj0687000dqyf40al7mmdm	33
cmfxj0687000dqyf40al7mmdm	34
cmfxj0687000dqyf40al7mmdm	35
cmfxj0687000dqyf40al7mmdm	36
cmfxj0687000dqyf40al7mmdm	37
cmfxj0687000dqyf40al7mmdm	38
cmfxj068l000eqyf4iv29u1kz	1
cmfxj068l000eqyf4iv29u1kz	2
cmfxj068l000eqyf4iv29u1kz	3
cmfxj068l000eqyf4iv29u1kz	4
cmfxj068l000eqyf4iv29u1kz	5
cmfxj068l000eqyf4iv29u1kz	6
cmfxj068l000eqyf4iv29u1kz	7
cmfxj068l000eqyf4iv29u1kz	8
cmfxj068l000eqyf4iv29u1kz	9
cmfxj068l000eqyf4iv29u1kz	10
cmfxj068l000eqyf4iv29u1kz	11
cmfxj068l000eqyf4iv29u1kz	12
cmfxj068l000eqyf4iv29u1kz	13
cmfxj068l000eqyf4iv29u1kz	14
cmfxj068l000eqyf4iv29u1kz	15
cmfxj068l000eqyf4iv29u1kz	16
cmfxj068l000eqyf4iv29u1kz	17
cmfxj068l000eqyf4iv29u1kz	18
cmfxj068l000eqyf4iv29u1kz	19
cmfxj068l000eqyf4iv29u1kz	20
cmfxj068l000eqyf4iv29u1kz	21
cmfxj068l000eqyf4iv29u1kz	22
cmfxj068l000eqyf4iv29u1kz	23
cmfxj068l000eqyf4iv29u1kz	24
cmfxj068l000eqyf4iv29u1kz	25
cmfxj068l000eqyf4iv29u1kz	26
cmfxj068l000eqyf4iv29u1kz	27
cmfxj068l000eqyf4iv29u1kz	28
cmfxj068l000eqyf4iv29u1kz	29
cmfxj068l000eqyf4iv29u1kz	30
cmfxj068l000eqyf4iv29u1kz	31
cmfxj068l000eqyf4iv29u1kz	32
cmfxj068l000eqyf4iv29u1kz	33
cmfxj068l000eqyf4iv29u1kz	34
cmfxj068l000eqyf4iv29u1kz	35
cmfxj068l000eqyf4iv29u1kz	36
cmfxj068l000eqyf4iv29u1kz	37
cmfxj068l000eqyf4iv29u1kz	38
cmfxj068z000fqyf4hfpn3hzr	1
cmfxj068z000fqyf4hfpn3hzr	2
cmfxj068z000fqyf4hfpn3hzr	3
cmfxj068z000fqyf4hfpn3hzr	4
cmfxj068z000fqyf4hfpn3hzr	5
cmfxj068z000fqyf4hfpn3hzr	6
cmfxj068z000fqyf4hfpn3hzr	7
cmfxj068z000fqyf4hfpn3hzr	8
cmfxj068z000fqyf4hfpn3hzr	9
cmfxj068z000fqyf4hfpn3hzr	10
cmfxj068z000fqyf4hfpn3hzr	11
cmfxj068z000fqyf4hfpn3hzr	12
cmfxj068z000fqyf4hfpn3hzr	13
cmfxj068z000fqyf4hfpn3hzr	14
cmfxj068z000fqyf4hfpn3hzr	15
cmfxj068z000fqyf4hfpn3hzr	16
cmfxj068z000fqyf4hfpn3hzr	17
cmfxj068z000fqyf4hfpn3hzr	18
cmfxj068z000fqyf4hfpn3hzr	19
cmfxj068z000fqyf4hfpn3hzr	20
cmfxj068z000fqyf4hfpn3hzr	21
cmfxj068z000fqyf4hfpn3hzr	22
cmfxj068z000fqyf4hfpn3hzr	23
cmfxj068z000fqyf4hfpn3hzr	24
cmfxj068z000fqyf4hfpn3hzr	25
cmfxj068z000fqyf4hfpn3hzr	26
cmfxj068z000fqyf4hfpn3hzr	27
cmfxj068z000fqyf4hfpn3hzr	28
cmfxj068z000fqyf4hfpn3hzr	29
cmfxj068z000fqyf4hfpn3hzr	30
cmfxj068z000fqyf4hfpn3hzr	31
cmfxj068z000fqyf4hfpn3hzr	32
cmfxj068z000fqyf4hfpn3hzr	33
cmfxj068z000fqyf4hfpn3hzr	34
cmfxj068z000fqyf4hfpn3hzr	35
cmfxj068z000fqyf4hfpn3hzr	36
cmfxj068z000fqyf4hfpn3hzr	37
cmfxj068z000fqyf4hfpn3hzr	38
cmfxj069c000gqyf4sx8m1y3o	1
cmfxj069c000gqyf4sx8m1y3o	2
cmfxj069c000gqyf4sx8m1y3o	3
cmfxj069c000gqyf4sx8m1y3o	4
cmfxj069c000gqyf4sx8m1y3o	5
cmfxj069c000gqyf4sx8m1y3o	6
cmfxj069c000gqyf4sx8m1y3o	7
cmfxj069c000gqyf4sx8m1y3o	8
cmfxj069c000gqyf4sx8m1y3o	9
cmfxj069c000gqyf4sx8m1y3o	10
cmfxj069c000gqyf4sx8m1y3o	11
cmfxj069c000gqyf4sx8m1y3o	12
cmfxj069c000gqyf4sx8m1y3o	13
cmfxj069c000gqyf4sx8m1y3o	14
cmfxj069c000gqyf4sx8m1y3o	15
cmfxj069c000gqyf4sx8m1y3o	16
cmfxj069c000gqyf4sx8m1y3o	17
cmfxj069c000gqyf4sx8m1y3o	18
cmfxj069c000gqyf4sx8m1y3o	19
cmfxj069c000gqyf4sx8m1y3o	20
cmfxj069c000gqyf4sx8m1y3o	21
cmfxj069c000gqyf4sx8m1y3o	22
cmfxj069c000gqyf4sx8m1y3o	23
cmfxj069c000gqyf4sx8m1y3o	24
cmfxj069c000gqyf4sx8m1y3o	25
cmfxj069c000gqyf4sx8m1y3o	26
cmfxj069c000gqyf4sx8m1y3o	27
cmfxj069c000gqyf4sx8m1y3o	28
cmfxj069c000gqyf4sx8m1y3o	29
cmfxj069c000gqyf4sx8m1y3o	30
cmfxj069c000gqyf4sx8m1y3o	31
cmfxj069c000gqyf4sx8m1y3o	32
cmfxj069c000gqyf4sx8m1y3o	33
cmfxj069c000gqyf4sx8m1y3o	34
cmfxj069c000gqyf4sx8m1y3o	35
cmfxj069c000gqyf4sx8m1y3o	36
cmfxj069c000gqyf4sx8m1y3o	37
cmfxj069c000gqyf4sx8m1y3o	38
cmfxj069n000hqyf4jqfecti9	1
cmfxj069n000hqyf4jqfecti9	2
cmfxj069n000hqyf4jqfecti9	3
cmfxj069n000hqyf4jqfecti9	4
cmfxj069n000hqyf4jqfecti9	5
cmfxj069n000hqyf4jqfecti9	6
cmfxj069n000hqyf4jqfecti9	7
cmfxj069n000hqyf4jqfecti9	8
cmfxj069n000hqyf4jqfecti9	9
cmfxj069n000hqyf4jqfecti9	10
cmfxj069n000hqyf4jqfecti9	11
cmfxj069n000hqyf4jqfecti9	12
cmfxj069n000hqyf4jqfecti9	13
cmfxj069n000hqyf4jqfecti9	14
cmfxj069n000hqyf4jqfecti9	15
cmfxj069n000hqyf4jqfecti9	16
cmfxj069n000hqyf4jqfecti9	17
cmfxj069n000hqyf4jqfecti9	18
cmfxj069n000hqyf4jqfecti9	19
cmfxj069n000hqyf4jqfecti9	20
cmfxj069n000hqyf4jqfecti9	21
cmfxj069n000hqyf4jqfecti9	22
cmfxj069n000hqyf4jqfecti9	23
cmfxj069n000hqyf4jqfecti9	24
cmfxj069n000hqyf4jqfecti9	25
cmfxj069n000hqyf4jqfecti9	26
cmfxj069n000hqyf4jqfecti9	27
cmfxj069n000hqyf4jqfecti9	28
cmfxj069n000hqyf4jqfecti9	29
cmfxj069n000hqyf4jqfecti9	30
cmfxj069n000hqyf4jqfecti9	31
cmfxj069n000hqyf4jqfecti9	32
cmfxj069n000hqyf4jqfecti9	33
cmfxj069n000hqyf4jqfecti9	34
cmfxj069n000hqyf4jqfecti9	35
cmfxj069n000hqyf4jqfecti9	36
cmfxj069n000hqyf4jqfecti9	37
cmfxj069n000hqyf4jqfecti9	38
cmfxj069y000iqyf49t2nne4b	1
cmfxj069y000iqyf49t2nne4b	2
cmfxj069y000iqyf49t2nne4b	3
cmfxj069y000iqyf49t2nne4b	4
cmfxj069y000iqyf49t2nne4b	5
cmfxj069y000iqyf49t2nne4b	6
cmfxj069y000iqyf49t2nne4b	7
cmfxj069y000iqyf49t2nne4b	8
cmfxj069y000iqyf49t2nne4b	9
cmfxj069y000iqyf49t2nne4b	10
cmfxj069y000iqyf49t2nne4b	11
cmfxj069y000iqyf49t2nne4b	12
cmfxj069y000iqyf49t2nne4b	13
cmfxj069y000iqyf49t2nne4b	14
cmfxj069y000iqyf49t2nne4b	15
cmfxj069y000iqyf49t2nne4b	16
cmfxj069y000iqyf49t2nne4b	17
cmfxj069y000iqyf49t2nne4b	18
cmfxj069y000iqyf49t2nne4b	19
cmfxj069y000iqyf49t2nne4b	20
cmfxj069y000iqyf49t2nne4b	21
cmfxj069y000iqyf49t2nne4b	22
cmfxj069y000iqyf49t2nne4b	23
cmfxj069y000iqyf49t2nne4b	24
cmfxj069y000iqyf49t2nne4b	25
cmfxj069y000iqyf49t2nne4b	26
cmfxj069y000iqyf49t2nne4b	27
cmfxj069y000iqyf49t2nne4b	28
cmfxj069y000iqyf49t2nne4b	29
cmfxj069y000iqyf49t2nne4b	30
cmfxj069y000iqyf49t2nne4b	31
cmfxj069y000iqyf49t2nne4b	32
cmfxj069y000iqyf49t2nne4b	33
cmfxj069y000iqyf49t2nne4b	34
cmfxj069y000iqyf49t2nne4b	35
cmfxj069y000iqyf49t2nne4b	36
cmfxj069y000iqyf49t2nne4b	37
cmfxj069y000iqyf49t2nne4b	38
cmfxj06aa000jqyf42i8gaapi	1
cmfxj06aa000jqyf42i8gaapi	2
cmfxj06aa000jqyf42i8gaapi	3
cmfxj06aa000jqyf42i8gaapi	4
cmfxj06aa000jqyf42i8gaapi	5
cmfxj06aa000jqyf42i8gaapi	6
cmfxj06aa000jqyf42i8gaapi	7
cmfxj06aa000jqyf42i8gaapi	8
cmfxj06aa000jqyf42i8gaapi	9
cmfxj06aa000jqyf42i8gaapi	10
cmfxj06aa000jqyf42i8gaapi	11
cmfxj06aa000jqyf42i8gaapi	12
cmfxj06aa000jqyf42i8gaapi	13
cmfxj06aa000jqyf42i8gaapi	14
cmfxj06aa000jqyf42i8gaapi	15
cmfxj06aa000jqyf42i8gaapi	16
cmfxj06aa000jqyf42i8gaapi	17
cmfxj06aa000jqyf42i8gaapi	18
cmfxj06aa000jqyf42i8gaapi	19
cmfxj06aa000jqyf42i8gaapi	20
cmfxj06aa000jqyf42i8gaapi	21
cmfxj06aa000jqyf42i8gaapi	22
cmfxj06aa000jqyf42i8gaapi	23
cmfxj06aa000jqyf42i8gaapi	24
cmfxj06aa000jqyf42i8gaapi	25
cmfxj06aa000jqyf42i8gaapi	26
cmfxj06aa000jqyf42i8gaapi	27
cmfxj06aa000jqyf42i8gaapi	28
cmfxj06aa000jqyf42i8gaapi	29
cmfxj06aa000jqyf42i8gaapi	30
cmfxj06aa000jqyf42i8gaapi	31
cmfxj06aa000jqyf42i8gaapi	32
cmfxj06aa000jqyf42i8gaapi	33
cmfxj06aa000jqyf42i8gaapi	34
cmfxj06aa000jqyf42i8gaapi	35
cmfxj06aa000jqyf42i8gaapi	36
cmfxj06aa000jqyf42i8gaapi	37
cmfxj06aa000jqyf42i8gaapi	38
cmfxj06am000kqyf4bexungaa	1
cmfxj06am000kqyf4bexungaa	2
cmfxj06am000kqyf4bexungaa	3
cmfxj06am000kqyf4bexungaa	4
cmfxj06am000kqyf4bexungaa	5
cmfxj06am000kqyf4bexungaa	6
cmfxj06am000kqyf4bexungaa	7
cmfxj06am000kqyf4bexungaa	8
cmfxj06am000kqyf4bexungaa	9
cmfxj06am000kqyf4bexungaa	10
cmfxj06am000kqyf4bexungaa	11
cmfxj06am000kqyf4bexungaa	12
cmfxj06am000kqyf4bexungaa	13
cmfxj06am000kqyf4bexungaa	14
cmfxj06am000kqyf4bexungaa	15
cmfxj06am000kqyf4bexungaa	16
cmfxj06am000kqyf4bexungaa	17
cmfxj06am000kqyf4bexungaa	18
cmfxj06am000kqyf4bexungaa	19
cmfxj06am000kqyf4bexungaa	20
cmfxj06am000kqyf4bexungaa	21
cmfxj06am000kqyf4bexungaa	22
cmfxj06am000kqyf4bexungaa	23
cmfxj06am000kqyf4bexungaa	24
cmfxj06am000kqyf4bexungaa	25
cmfxj06am000kqyf4bexungaa	26
cmfxj06am000kqyf4bexungaa	27
cmfxj06am000kqyf4bexungaa	28
cmfxj06am000kqyf4bexungaa	29
cmfxj06am000kqyf4bexungaa	30
cmfxj06am000kqyf4bexungaa	31
cmfxj06am000kqyf4bexungaa	32
cmfxj06am000kqyf4bexungaa	33
cmfxj06am000kqyf4bexungaa	34
cmfxj06am000kqyf4bexungaa	35
cmfxj06am000kqyf4bexungaa	36
cmfxj06am000kqyf4bexungaa	37
cmfxj06am000kqyf4bexungaa	38
cmfxj06b0000lqyf4wjs9zuxt	1
cmfxj06b0000lqyf4wjs9zuxt	2
cmfxj06b0000lqyf4wjs9zuxt	3
cmfxj06b0000lqyf4wjs9zuxt	4
cmfxj06b0000lqyf4wjs9zuxt	5
cmfxj06b0000lqyf4wjs9zuxt	6
cmfxj06b0000lqyf4wjs9zuxt	7
cmfxj06b0000lqyf4wjs9zuxt	8
cmfxj06b0000lqyf4wjs9zuxt	9
cmfxj06b0000lqyf4wjs9zuxt	10
cmfxj06b0000lqyf4wjs9zuxt	11
cmfxj06b0000lqyf4wjs9zuxt	12
cmfxj06b0000lqyf4wjs9zuxt	13
cmfxj06b0000lqyf4wjs9zuxt	14
cmfxj06b0000lqyf4wjs9zuxt	15
cmfxj06b0000lqyf4wjs9zuxt	16
cmfxj06b0000lqyf4wjs9zuxt	17
cmfxj06b0000lqyf4wjs9zuxt	18
cmfxj06b0000lqyf4wjs9zuxt	19
cmfxj06b0000lqyf4wjs9zuxt	20
cmfxj06b0000lqyf4wjs9zuxt	21
cmfxj06b0000lqyf4wjs9zuxt	22
cmfxj06b0000lqyf4wjs9zuxt	23
cmfxj06b0000lqyf4wjs9zuxt	24
cmfxj06b0000lqyf4wjs9zuxt	25
cmfxj06b0000lqyf4wjs9zuxt	26
cmfxj06b0000lqyf4wjs9zuxt	27
cmfxj06b0000lqyf4wjs9zuxt	28
cmfxj06b0000lqyf4wjs9zuxt	29
cmfxj06b0000lqyf4wjs9zuxt	30
cmfxj06b0000lqyf4wjs9zuxt	31
cmfxj06b0000lqyf4wjs9zuxt	32
cmfxj06b0000lqyf4wjs9zuxt	33
cmfxj06b0000lqyf4wjs9zuxt	34
cmfxj06b0000lqyf4wjs9zuxt	35
cmfxj06b0000lqyf4wjs9zuxt	36
cmfxj06b0000lqyf4wjs9zuxt	37
cmfxj06b0000lqyf4wjs9zuxt	38
cmfxj06bd000mqyf4clxt8rld	1
cmfxj06bd000mqyf4clxt8rld	2
cmfxj06bd000mqyf4clxt8rld	3
cmfxj06bd000mqyf4clxt8rld	4
cmfxj06bd000mqyf4clxt8rld	5
cmfxj06bd000mqyf4clxt8rld	6
cmfxj06bd000mqyf4clxt8rld	7
cmfxj06bd000mqyf4clxt8rld	8
cmfxj06bd000mqyf4clxt8rld	9
cmfxj06bd000mqyf4clxt8rld	10
cmfxj06bd000mqyf4clxt8rld	11
cmfxj06bd000mqyf4clxt8rld	12
cmfxj06bd000mqyf4clxt8rld	13
cmfxj06bd000mqyf4clxt8rld	14
cmfxj06bd000mqyf4clxt8rld	15
cmfxj06bd000mqyf4clxt8rld	16
cmfxj06bd000mqyf4clxt8rld	17
cmfxj06bd000mqyf4clxt8rld	18
cmfxj06bd000mqyf4clxt8rld	19
cmfxj06bd000mqyf4clxt8rld	20
cmfxj06bd000mqyf4clxt8rld	21
cmfxj06bd000mqyf4clxt8rld	22
cmfxj06bd000mqyf4clxt8rld	23
cmfxj06bd000mqyf4clxt8rld	24
cmfxj06bd000mqyf4clxt8rld	25
cmfxj06bd000mqyf4clxt8rld	26
cmfxj06bd000mqyf4clxt8rld	27
cmfxj06bd000mqyf4clxt8rld	28
cmfxj06bd000mqyf4clxt8rld	29
cmfxj06bd000mqyf4clxt8rld	30
cmfxj06bd000mqyf4clxt8rld	31
cmfxj06bd000mqyf4clxt8rld	32
cmfxj06bd000mqyf4clxt8rld	33
cmfxj06bd000mqyf4clxt8rld	34
cmfxj06bd000mqyf4clxt8rld	35
cmfxj06bd000mqyf4clxt8rld	36
cmfxj06bd000mqyf4clxt8rld	37
cmfxj06bd000mqyf4clxt8rld	38
cmfxj06bm000nqyf4506fh414	1
cmfxj06bm000nqyf4506fh414	2
cmfxj06bm000nqyf4506fh414	3
cmfxj06bm000nqyf4506fh414	4
cmfxj06bm000nqyf4506fh414	5
cmfxj06bm000nqyf4506fh414	6
cmfxj06bm000nqyf4506fh414	7
cmfxj06bm000nqyf4506fh414	8
cmfxj06bm000nqyf4506fh414	9
cmfxj06bm000nqyf4506fh414	10
cmfxj06bm000nqyf4506fh414	11
cmfxj06bm000nqyf4506fh414	12
cmfxj06bm000nqyf4506fh414	13
cmfxj06bm000nqyf4506fh414	14
cmfxj06bm000nqyf4506fh414	15
cmfxj06bm000nqyf4506fh414	16
cmfxj06bm000nqyf4506fh414	17
cmfxj06bm000nqyf4506fh414	18
cmfxj06bm000nqyf4506fh414	19
cmfxj06bm000nqyf4506fh414	20
cmfxj06bm000nqyf4506fh414	21
cmfxj06bm000nqyf4506fh414	22
cmfxj06bm000nqyf4506fh414	23
cmfxj06bm000nqyf4506fh414	24
cmfxj06bm000nqyf4506fh414	25
cmfxj06bm000nqyf4506fh414	26
cmfxj06bm000nqyf4506fh414	27
cmfxj06bm000nqyf4506fh414	28
cmfxj06bm000nqyf4506fh414	29
cmfxj06bm000nqyf4506fh414	30
cmfxj06bm000nqyf4506fh414	31
cmfxj06bm000nqyf4506fh414	32
cmfxj06bm000nqyf4506fh414	33
cmfxj06bm000nqyf4506fh414	34
cmfxj06bm000nqyf4506fh414	35
cmfxj06bm000nqyf4506fh414	36
cmfxj06bm000nqyf4506fh414	37
cmfxj06bm000nqyf4506fh414	38
cmfxj06bw000oqyf4g79dsqjz	1
cmfxj06bw000oqyf4g79dsqjz	2
cmfxj06bw000oqyf4g79dsqjz	3
cmfxj06bw000oqyf4g79dsqjz	4
cmfxj06bw000oqyf4g79dsqjz	5
cmfxj06bw000oqyf4g79dsqjz	6
cmfxj06bw000oqyf4g79dsqjz	7
cmfxj06bw000oqyf4g79dsqjz	8
cmfxj06bw000oqyf4g79dsqjz	9
cmfxj06bw000oqyf4g79dsqjz	10
cmfxj06bw000oqyf4g79dsqjz	11
cmfxj06bw000oqyf4g79dsqjz	12
cmfxj06bw000oqyf4g79dsqjz	13
cmfxj06bw000oqyf4g79dsqjz	14
cmfxj06bw000oqyf4g79dsqjz	15
cmfxj06bw000oqyf4g79dsqjz	16
cmfxj06bw000oqyf4g79dsqjz	17
cmfxj06bw000oqyf4g79dsqjz	18
cmfxj06bw000oqyf4g79dsqjz	19
cmfxj06bw000oqyf4g79dsqjz	20
cmfxj06bw000oqyf4g79dsqjz	21
cmfxj06bw000oqyf4g79dsqjz	22
cmfxj06bw000oqyf4g79dsqjz	23
cmfxj06bw000oqyf4g79dsqjz	24
cmfxj06bw000oqyf4g79dsqjz	25
cmfxj06bw000oqyf4g79dsqjz	26
cmfxj06bw000oqyf4g79dsqjz	27
cmfxj06bw000oqyf4g79dsqjz	28
cmfxj06bw000oqyf4g79dsqjz	29
cmfxj06bw000oqyf4g79dsqjz	30
cmfxj06bw000oqyf4g79dsqjz	31
cmfxj06bw000oqyf4g79dsqjz	32
cmfxj06bw000oqyf4g79dsqjz	33
cmfxj06bw000oqyf4g79dsqjz	34
cmfxj06bw000oqyf4g79dsqjz	35
cmfxj06bw000oqyf4g79dsqjz	36
cmfxj06bw000oqyf4g79dsqjz	37
cmfxj06bw000oqyf4g79dsqjz	38
cmfxj06c5000pqyf4d2aedc5w	1
cmfxj06c5000pqyf4d2aedc5w	2
cmfxj06c5000pqyf4d2aedc5w	3
cmfxj06c5000pqyf4d2aedc5w	4
cmfxj06c5000pqyf4d2aedc5w	5
cmfxj06c5000pqyf4d2aedc5w	6
cmfxj06c5000pqyf4d2aedc5w	7
cmfxj06c5000pqyf4d2aedc5w	8
cmfxj06c5000pqyf4d2aedc5w	9
cmfxj06c5000pqyf4d2aedc5w	10
cmfxj06c5000pqyf4d2aedc5w	11
cmfxj06c5000pqyf4d2aedc5w	12
cmfxj06c5000pqyf4d2aedc5w	13
cmfxj06c5000pqyf4d2aedc5w	14
cmfxj06c5000pqyf4d2aedc5w	15
cmfxj06c5000pqyf4d2aedc5w	16
cmfxj06c5000pqyf4d2aedc5w	17
cmfxj06c5000pqyf4d2aedc5w	18
cmfxj06c5000pqyf4d2aedc5w	19
cmfxj06c5000pqyf4d2aedc5w	20
cmfxj06c5000pqyf4d2aedc5w	21
cmfxj06c5000pqyf4d2aedc5w	22
cmfxj06c5000pqyf4d2aedc5w	23
cmfxj06c5000pqyf4d2aedc5w	24
cmfxj06c5000pqyf4d2aedc5w	25
cmfxj06c5000pqyf4d2aedc5w	26
cmfxj06c5000pqyf4d2aedc5w	27
cmfxj06c5000pqyf4d2aedc5w	28
cmfxj06c5000pqyf4d2aedc5w	29
cmfxj06c5000pqyf4d2aedc5w	30
cmfxj06c5000pqyf4d2aedc5w	31
cmfxj06c5000pqyf4d2aedc5w	32
cmfxj06c5000pqyf4d2aedc5w	33
cmfxj06c5000pqyf4d2aedc5w	34
cmfxj06c5000pqyf4d2aedc5w	35
cmfxj06c5000pqyf4d2aedc5w	36
cmfxj06c5000pqyf4d2aedc5w	37
cmfxj06c5000pqyf4d2aedc5w	38
cmfxj06ce000qqyf499mks1as	1
cmfxj06ce000qqyf499mks1as	2
cmfxj06ce000qqyf499mks1as	3
cmfxj06ce000qqyf499mks1as	4
cmfxj06ce000qqyf499mks1as	5
cmfxj06ce000qqyf499mks1as	6
cmfxj06ce000qqyf499mks1as	7
cmfxj06ce000qqyf499mks1as	8
cmfxj06ce000qqyf499mks1as	9
cmfxj06ce000qqyf499mks1as	10
cmfxj06ce000qqyf499mks1as	11
cmfxj06ce000qqyf499mks1as	12
cmfxj06ce000qqyf499mks1as	13
cmfxj06ce000qqyf499mks1as	14
cmfxj06ce000qqyf499mks1as	15
cmfxj06ce000qqyf499mks1as	16
cmfxj06ce000qqyf499mks1as	17
cmfxj06ce000qqyf499mks1as	18
cmfxj06ce000qqyf499mks1as	19
cmfxj06ce000qqyf499mks1as	20
cmfxj06ce000qqyf499mks1as	21
cmfxj06ce000qqyf499mks1as	22
cmfxj06ce000qqyf499mks1as	23
cmfxj06ce000qqyf499mks1as	24
cmfxj06ce000qqyf499mks1as	25
cmfxj06ce000qqyf499mks1as	26
cmfxj06ce000qqyf499mks1as	27
cmfxj06ce000qqyf499mks1as	28
cmfxj06ce000qqyf499mks1as	29
cmfxj06ce000qqyf499mks1as	30
cmfxj06ce000qqyf499mks1as	31
cmfxj06ce000qqyf499mks1as	32
cmfxj06ce000qqyf499mks1as	33
cmfxj06ce000qqyf499mks1as	34
cmfxj06ce000qqyf499mks1as	35
cmfxj06ce000qqyf499mks1as	36
cmfxj06ce000qqyf499mks1as	37
cmfxj06ce000qqyf499mks1as	38
cmfxj06cm000rqyf4vk6eiayv	1
cmfxj06cm000rqyf4vk6eiayv	2
cmfxj06cm000rqyf4vk6eiayv	3
cmfxj06cm000rqyf4vk6eiayv	4
cmfxj06cm000rqyf4vk6eiayv	5
cmfxj06cm000rqyf4vk6eiayv	6
cmfxj06cm000rqyf4vk6eiayv	7
cmfxj06cm000rqyf4vk6eiayv	8
cmfxj06cm000rqyf4vk6eiayv	9
cmfxj06cm000rqyf4vk6eiayv	10
cmfxj06cm000rqyf4vk6eiayv	11
cmfxj06cm000rqyf4vk6eiayv	12
cmfxj06cm000rqyf4vk6eiayv	13
cmfxj06cm000rqyf4vk6eiayv	14
cmfxj06cm000rqyf4vk6eiayv	15
cmfxj06cm000rqyf4vk6eiayv	16
cmfxj06cm000rqyf4vk6eiayv	17
cmfxj06cm000rqyf4vk6eiayv	18
cmfxj06cm000rqyf4vk6eiayv	19
cmfxj06cm000rqyf4vk6eiayv	20
cmfxj06cm000rqyf4vk6eiayv	21
cmfxj06cm000rqyf4vk6eiayv	22
cmfxj06cm000rqyf4vk6eiayv	23
cmfxj06cm000rqyf4vk6eiayv	24
cmfxj06cm000rqyf4vk6eiayv	25
cmfxj06cm000rqyf4vk6eiayv	26
cmfxj06cm000rqyf4vk6eiayv	27
cmfxj06cm000rqyf4vk6eiayv	28
cmfxj06cm000rqyf4vk6eiayv	29
cmfxj06cm000rqyf4vk6eiayv	30
cmfxj06cm000rqyf4vk6eiayv	31
cmfxj06cm000rqyf4vk6eiayv	32
cmfxj06cm000rqyf4vk6eiayv	33
cmfxj06cm000rqyf4vk6eiayv	34
cmfxj06cm000rqyf4vk6eiayv	35
cmfxj06cm000rqyf4vk6eiayv	36
cmfxj06cm000rqyf4vk6eiayv	37
cmfxj06cm000rqyf4vk6eiayv	38
cmfxj06cu000sqyf4hfkxu3cp	1
cmfxj06cu000sqyf4hfkxu3cp	2
cmfxj06cu000sqyf4hfkxu3cp	3
cmfxj06cu000sqyf4hfkxu3cp	4
cmfxj06cu000sqyf4hfkxu3cp	5
cmfxj06cu000sqyf4hfkxu3cp	6
cmfxj06cu000sqyf4hfkxu3cp	7
cmfxj06cu000sqyf4hfkxu3cp	8
cmfxj06cu000sqyf4hfkxu3cp	9
cmfxj06cu000sqyf4hfkxu3cp	10
cmfxj06cu000sqyf4hfkxu3cp	11
cmfxj06cu000sqyf4hfkxu3cp	12
cmfxj06cu000sqyf4hfkxu3cp	13
cmfxj06cu000sqyf4hfkxu3cp	14
cmfxj06cu000sqyf4hfkxu3cp	15
cmfxj06cu000sqyf4hfkxu3cp	16
cmfxj06cu000sqyf4hfkxu3cp	17
cmfxj06cu000sqyf4hfkxu3cp	18
cmfxj06cu000sqyf4hfkxu3cp	19
cmfxj06cu000sqyf4hfkxu3cp	20
cmfxj06cu000sqyf4hfkxu3cp	21
cmfxj06cu000sqyf4hfkxu3cp	22
cmfxj06cu000sqyf4hfkxu3cp	23
cmfxj06cu000sqyf4hfkxu3cp	24
cmfxj06cu000sqyf4hfkxu3cp	25
cmfxj06cu000sqyf4hfkxu3cp	26
cmfxj06cu000sqyf4hfkxu3cp	27
cmfxj06cu000sqyf4hfkxu3cp	28
cmfxj06cu000sqyf4hfkxu3cp	29
cmfxj06cu000sqyf4hfkxu3cp	30
cmfxj06cu000sqyf4hfkxu3cp	31
cmfxj06cu000sqyf4hfkxu3cp	32
cmfxj06cu000sqyf4hfkxu3cp	33
cmfxj06cu000sqyf4hfkxu3cp	34
cmfxj06cu000sqyf4hfkxu3cp	35
cmfxj06cu000sqyf4hfkxu3cp	36
cmfxj06cu000sqyf4hfkxu3cp	37
cmfxj06cu000sqyf4hfkxu3cp	38
cmfxj06d3000tqyf4e7ko0xld	1
cmfxj06d3000tqyf4e7ko0xld	2
cmfxj06d3000tqyf4e7ko0xld	3
cmfxj06d3000tqyf4e7ko0xld	4
cmfxj06d3000tqyf4e7ko0xld	5
cmfxj06d3000tqyf4e7ko0xld	6
cmfxj06d3000tqyf4e7ko0xld	7
cmfxj06d3000tqyf4e7ko0xld	8
cmfxj06d3000tqyf4e7ko0xld	9
cmfxj06d3000tqyf4e7ko0xld	10
cmfxj06d3000tqyf4e7ko0xld	11
cmfxj06d3000tqyf4e7ko0xld	12
cmfxj06d3000tqyf4e7ko0xld	13
cmfxj06d3000tqyf4e7ko0xld	14
cmfxj06d3000tqyf4e7ko0xld	15
cmfxj06d3000tqyf4e7ko0xld	16
cmfxj06d3000tqyf4e7ko0xld	17
cmfxj06d3000tqyf4e7ko0xld	18
cmfxj06d3000tqyf4e7ko0xld	19
cmfxj06d3000tqyf4e7ko0xld	20
cmfxj06d3000tqyf4e7ko0xld	21
cmfxj06d3000tqyf4e7ko0xld	22
cmfxj06d3000tqyf4e7ko0xld	23
cmfxj06d3000tqyf4e7ko0xld	24
cmfxj06d3000tqyf4e7ko0xld	25
cmfxj06d3000tqyf4e7ko0xld	26
cmfxj06d3000tqyf4e7ko0xld	27
cmfxj06d3000tqyf4e7ko0xld	28
cmfxj06d3000tqyf4e7ko0xld	29
cmfxj06d3000tqyf4e7ko0xld	30
cmfxj06d3000tqyf4e7ko0xld	31
cmfxj06d3000tqyf4e7ko0xld	32
cmfxj06d3000tqyf4e7ko0xld	33
cmfxj06d3000tqyf4e7ko0xld	34
cmfxj06d3000tqyf4e7ko0xld	35
cmfxj06d3000tqyf4e7ko0xld	36
cmfxj06d3000tqyf4e7ko0xld	37
cmfxj06d3000tqyf4e7ko0xld	38
cmfxj06dc000uqyf4h8b7oazg	1
cmfxj06dc000uqyf4h8b7oazg	2
cmfxj06dc000uqyf4h8b7oazg	3
cmfxj06dc000uqyf4h8b7oazg	4
cmfxj06dc000uqyf4h8b7oazg	5
cmfxj06dc000uqyf4h8b7oazg	6
cmfxj06dc000uqyf4h8b7oazg	7
cmfxj06dc000uqyf4h8b7oazg	8
cmfxj06dc000uqyf4h8b7oazg	9
cmfxj06dc000uqyf4h8b7oazg	10
cmfxj06dc000uqyf4h8b7oazg	11
cmfxj06dc000uqyf4h8b7oazg	12
cmfxj06dc000uqyf4h8b7oazg	13
cmfxj06dc000uqyf4h8b7oazg	14
cmfxj06dc000uqyf4h8b7oazg	15
cmfxj06dc000uqyf4h8b7oazg	16
cmfxj06dc000uqyf4h8b7oazg	17
cmfxj06dc000uqyf4h8b7oazg	18
cmfxj06dc000uqyf4h8b7oazg	19
cmfxj06dc000uqyf4h8b7oazg	20
cmfxj06dc000uqyf4h8b7oazg	21
cmfxj06dc000uqyf4h8b7oazg	22
cmfxj06dc000uqyf4h8b7oazg	23
cmfxj06dc000uqyf4h8b7oazg	24
cmfxj06dc000uqyf4h8b7oazg	25
cmfxj06dc000uqyf4h8b7oazg	26
cmfxj06dc000uqyf4h8b7oazg	27
cmfxj06dc000uqyf4h8b7oazg	28
cmfxj06dc000uqyf4h8b7oazg	29
cmfxj06dc000uqyf4h8b7oazg	30
cmfxj06dc000uqyf4h8b7oazg	31
cmfxj06dc000uqyf4h8b7oazg	32
cmfxj06dc000uqyf4h8b7oazg	33
cmfxj06dc000uqyf4h8b7oazg	34
cmfxj06dc000uqyf4h8b7oazg	35
cmfxj06dc000uqyf4h8b7oazg	36
cmfxj06dc000uqyf4h8b7oazg	37
cmfxj06dc000uqyf4h8b7oazg	38
cmfxj06dn000vqyf4o1qlkzz3	1
cmfxj06dn000vqyf4o1qlkzz3	2
cmfxj06dn000vqyf4o1qlkzz3	3
cmfxj06dn000vqyf4o1qlkzz3	4
cmfxj06dn000vqyf4o1qlkzz3	5
cmfxj06dn000vqyf4o1qlkzz3	6
cmfxj06dn000vqyf4o1qlkzz3	7
cmfxj06dn000vqyf4o1qlkzz3	8
cmfxj06dn000vqyf4o1qlkzz3	9
cmfxj06dn000vqyf4o1qlkzz3	10
cmfxj06dn000vqyf4o1qlkzz3	11
cmfxj06dn000vqyf4o1qlkzz3	12
cmfxj06dn000vqyf4o1qlkzz3	13
cmfxj06dn000vqyf4o1qlkzz3	14
cmfxj06dn000vqyf4o1qlkzz3	15
cmfxj06dn000vqyf4o1qlkzz3	16
cmfxj06dn000vqyf4o1qlkzz3	17
cmfxj06dn000vqyf4o1qlkzz3	18
cmfxj06dn000vqyf4o1qlkzz3	19
cmfxj06dn000vqyf4o1qlkzz3	20
cmfxj06dn000vqyf4o1qlkzz3	21
cmfxj06dn000vqyf4o1qlkzz3	22
cmfxj06dn000vqyf4o1qlkzz3	23
cmfxj06dn000vqyf4o1qlkzz3	24
cmfxj06dn000vqyf4o1qlkzz3	25
cmfxj06dn000vqyf4o1qlkzz3	26
cmfxj06dn000vqyf4o1qlkzz3	27
cmfxj06dn000vqyf4o1qlkzz3	28
cmfxj06dn000vqyf4o1qlkzz3	29
cmfxj06dn000vqyf4o1qlkzz3	30
cmfxj06dn000vqyf4o1qlkzz3	31
cmfxj06dn000vqyf4o1qlkzz3	32
cmfxj06dn000vqyf4o1qlkzz3	33
cmfxj06dn000vqyf4o1qlkzz3	34
cmfxj06dn000vqyf4o1qlkzz3	35
cmfxj06dn000vqyf4o1qlkzz3	36
cmfxj06dn000vqyf4o1qlkzz3	37
cmfxj06dn000vqyf4o1qlkzz3	38
\.


--
-- Data for Name: TemplateFinish; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TemplateFinish" ("templateId", finish) FROM stdin;
cmfxj06630008qyf4t0tqg2xg	MATTE
cmfxj06630008qyf4t0tqg2xg	GLOSS
cmfxj066l0009qyf4inp7dimr	MATTE
cmfxj066l0009qyf4inp7dimr	GLOSS
cmfxj0671000aqyf4bjeyuyld	MATTE
cmfxj0671000aqyf4bjeyuyld	GLOSS
cmfxj067e000bqyf43t016hyf	MATTE
cmfxj067e000bqyf43t016hyf	GLOSS
cmfxj067s000cqyf49h06e1bz	MATTE
cmfxj067s000cqyf49h06e1bz	GLOSS
cmfxj0687000dqyf40al7mmdm	MATTE
cmfxj0687000dqyf40al7mmdm	GLOSS
cmfxj068l000eqyf4iv29u1kz	MATTE
cmfxj068l000eqyf4iv29u1kz	GLOSS
cmfxj068z000fqyf4hfpn3hzr	MATTE
cmfxj068z000fqyf4hfpn3hzr	GLOSS
cmfxj069c000gqyf4sx8m1y3o	MATTE
cmfxj069c000gqyf4sx8m1y3o	GLOSS
cmfxj069n000hqyf4jqfecti9	MATTE
cmfxj069n000hqyf4jqfecti9	GLOSS
cmfxj069y000iqyf49t2nne4b	MATTE
cmfxj069y000iqyf49t2nne4b	GLOSS
cmfxj06aa000jqyf42i8gaapi	MATTE
cmfxj06aa000jqyf42i8gaapi	GLOSS
cmfxj06am000kqyf4bexungaa	MATTE
cmfxj06am000kqyf4bexungaa	GLOSS
cmfxj06b0000lqyf4wjs9zuxt	MATTE
cmfxj06b0000lqyf4wjs9zuxt	GLOSS
cmfxj06dw000wqyf4992rrgnl	MATTE
cmfxj06dw000wqyf4992rrgnl	GLOSS
cmfxj06e6000xqyf4hmhzd05x	MATTE
cmfxj06e6000xqyf4hmhzd05x	GLOSS
cmfxj06ef000yqyf4pp5gx5h1	GLOSS
cmfxj06ep000zqyf42im6zh2b	GLOSS
\.


--
-- Data for Name: TemplateFrame; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TemplateFrame" ("templateId", "frameId") FROM stdin;
cmfxj063i0000qyf4ptstwhkl	1
cmfxj063i0000qyf4ptstwhkl	2
cmfxj063i0000qyf4ptstwhkl	3
cmfxj063i0000qyf4ptstwhkl	4
cmfxj063i0000qyf4ptstwhkl	5
cmfxj063i0000qyf4ptstwhkl	6
cmfxj06440001qyf4tdpmqc9c	1
cmfxj06440001qyf4tdpmqc9c	2
cmfxj06440001qyf4tdpmqc9c	3
cmfxj06440001qyf4tdpmqc9c	4
cmfxj06440001qyf4tdpmqc9c	5
cmfxj06440001qyf4tdpmqc9c	6
cmfxj064g0002qyf4t8iakes9	1
cmfxj064g0002qyf4t8iakes9	2
cmfxj064g0002qyf4t8iakes9	3
cmfxj064g0002qyf4t8iakes9	4
cmfxj064g0002qyf4t8iakes9	5
cmfxj064g0002qyf4t8iakes9	6
cmfxj064q0003qyf4jp5of5ag	1
cmfxj064q0003qyf4jp5of5ag	2
cmfxj064q0003qyf4jp5of5ag	3
cmfxj064q0003qyf4jp5of5ag	4
cmfxj064q0003qyf4jp5of5ag	5
cmfxj064q0003qyf4jp5of5ag	6
cmfxj064y0004qyf473wtlu0v	1
cmfxj064y0004qyf473wtlu0v	2
cmfxj064y0004qyf473wtlu0v	3
cmfxj064y0004qyf473wtlu0v	4
cmfxj064y0004qyf473wtlu0v	5
cmfxj064y0004qyf473wtlu0v	6
cmfxj065a0005qyf4x5jq9u9z	1
cmfxj065a0005qyf4x5jq9u9z	2
cmfxj065a0005qyf4x5jq9u9z	3
cmfxj065a0005qyf4x5jq9u9z	4
cmfxj065a0005qyf4x5jq9u9z	5
cmfxj065a0005qyf4x5jq9u9z	6
cmfxj065j0006qyf4l0x3wtma	1
cmfxj065j0006qyf4l0x3wtma	2
cmfxj065j0006qyf4l0x3wtma	3
cmfxj065j0006qyf4l0x3wtma	4
cmfxj065j0006qyf4l0x3wtma	5
cmfxj065j0006qyf4l0x3wtma	6
cmfxj065u0007qyf4qx03pn4o	1
cmfxj065u0007qyf4qx03pn4o	2
cmfxj065u0007qyf4qx03pn4o	3
cmfxj065u0007qyf4qx03pn4o	4
cmfxj065u0007qyf4qx03pn4o	5
cmfxj065u0007qyf4qx03pn4o	6
\.


--
-- Data for Name: TemplateHole; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TemplateHole" ("templateId", pattern) FROM stdin;
cmfxj063i0000qyf4ptstwhkl	NONE
cmfxj063i0000qyf4ptstwhkl	TWO_VERTICAL
cmfxj063i0000qyf4ptstwhkl	FOUR_CORNERS
cmfxj06440001qyf4tdpmqc9c	NONE
cmfxj06440001qyf4tdpmqc9c	TWO_VERTICAL
cmfxj06440001qyf4tdpmqc9c	FOUR_CORNERS
cmfxj064g0002qyf4t8iakes9	NONE
cmfxj064g0002qyf4t8iakes9	TWO_HORIZONTAL
cmfxj064g0002qyf4t8iakes9	FOUR_CORNERS
cmfxj064q0003qyf4jp5of5ag	NONE
cmfxj064q0003qyf4jp5of5ag	TWO_HORIZONTAL
cmfxj064q0003qyf4jp5of5ag	FOUR_CORNERS
cmfxj064y0004qyf473wtlu0v	NONE
cmfxj064y0004qyf473wtlu0v	TWO_VERTICAL
cmfxj065a0005qyf4x5jq9u9z	NONE
cmfxj065a0005qyf4x5jq9u9z	TWO_VERTICAL
cmfxj065j0006qyf4l0x3wtma	NONE
cmfxj065j0006qyf4l0x3wtma	TWO_HORIZONTAL
cmfxj065u0007qyf4qx03pn4o	NONE
cmfxj065u0007qyf4qx03pn4o	TWO_HORIZONTAL
cmfxj06630008qyf4t0tqg2xg	NONE
cmfxj06630008qyf4t0tqg2xg	TWO_VERTICAL
cmfxj06630008qyf4t0tqg2xg	FOUR_CORNERS
cmfxj066l0009qyf4inp7dimr	NONE
cmfxj066l0009qyf4inp7dimr	TWO_VERTICAL
cmfxj066l0009qyf4inp7dimr	FOUR_CORNERS
cmfxj0671000aqyf4bjeyuyld	NONE
cmfxj0671000aqyf4bjeyuyld	TWO_HORIZONTAL
cmfxj0671000aqyf4bjeyuyld	FOUR_CORNERS
cmfxj067e000bqyf43t016hyf	NONE
cmfxj067e000bqyf43t016hyf	TWO_HORIZONTAL
cmfxj067e000bqyf43t016hyf	FOUR_CORNERS
cmfxj067s000cqyf49h06e1bz	NONE
cmfxj067s000cqyf49h06e1bz	TWO_VERTICAL
cmfxj067s000cqyf49h06e1bz	FOUR_CORNERS
cmfxj0687000dqyf40al7mmdm	NONE
cmfxj0687000dqyf40al7mmdm	TWO_VERTICAL
cmfxj0687000dqyf40al7mmdm	FOUR_CORNERS
cmfxj068l000eqyf4iv29u1kz	NONE
cmfxj068l000eqyf4iv29u1kz	TWO_HORIZONTAL
cmfxj068l000eqyf4iv29u1kz	FOUR_CORNERS
cmfxj068z000fqyf4hfpn3hzr	NONE
cmfxj068z000fqyf4hfpn3hzr	TWO_HORIZONTAL
cmfxj068z000fqyf4hfpn3hzr	FOUR_CORNERS
cmfxj069c000gqyf4sx8m1y3o	NONE
cmfxj069c000gqyf4sx8m1y3o	TWO_VERTICAL
cmfxj069n000hqyf4jqfecti9	NONE
cmfxj069n000hqyf4jqfecti9	TWO_VERTICAL
cmfxj069y000iqyf49t2nne4b	NONE
cmfxj069y000iqyf49t2nne4b	TWO_HORIZONTAL
cmfxj06aa000jqyf42i8gaapi	NONE
cmfxj06aa000jqyf42i8gaapi	TWO_HORIZONTAL
cmfxj06am000kqyf4bexungaa	NONE
cmfxj06am000kqyf4bexungaa	TWO_VERTICAL
cmfxj06am000kqyf4bexungaa	FOUR_CORNERS
cmfxj06b0000lqyf4wjs9zuxt	NONE
cmfxj06b0000lqyf4wjs9zuxt	TWO_VERTICAL
cmfxj06b0000lqyf4wjs9zuxt	FOUR_CORNERS
cmfxj06bd000mqyf4clxt8rld	NONE
cmfxj06bd000mqyf4clxt8rld	TWO_VERTICAL
cmfxj06bd000mqyf4clxt8rld	FOUR_CORNERS
cmfxj06bm000nqyf4506fh414	NONE
cmfxj06bm000nqyf4506fh414	TWO_VERTICAL
cmfxj06bm000nqyf4506fh414	FOUR_CORNERS
cmfxj06bw000oqyf4g79dsqjz	NONE
cmfxj06bw000oqyf4g79dsqjz	TWO_HORIZONTAL
cmfxj06bw000oqyf4g79dsqjz	FOUR_CORNERS
cmfxj06c5000pqyf4d2aedc5w	NONE
cmfxj06c5000pqyf4d2aedc5w	TWO_HORIZONTAL
cmfxj06c5000pqyf4d2aedc5w	FOUR_CORNERS
cmfxj06ce000qqyf499mks1as	NONE
cmfxj06ce000qqyf499mks1as	TWO_VERTICAL
cmfxj06cm000rqyf4vk6eiayv	NONE
cmfxj06cm000rqyf4vk6eiayv	TWO_VERTICAL
cmfxj06cu000sqyf4hfkxu3cp	NONE
cmfxj06cu000sqyf4hfkxu3cp	TWO_HORIZONTAL
cmfxj06d3000tqyf4e7ko0xld	NONE
cmfxj06d3000tqyf4e7ko0xld	TWO_HORIZONTAL
cmfxj06dc000uqyf4h8b7oazg	NONE
cmfxj06dc000uqyf4h8b7oazg	TWO_VERTICAL
cmfxj06dc000uqyf4h8b7oazg	FOUR_CORNERS
cmfxj06dn000vqyf4o1qlkzz3	NONE
cmfxj06dn000vqyf4o1qlkzz3	TWO_VERTICAL
cmfxj06dn000vqyf4o1qlkzz3	FOUR_CORNERS
cmfxj06dw000wqyf4992rrgnl	NONE
cmfxj06dw000wqyf4992rrgnl	TWO_VERTICAL
cmfxj06dw000wqyf4992rrgnl	FOUR_CORNERS
cmfxj06e6000xqyf4hmhzd05x	NONE
cmfxj06e6000xqyf4hmhzd05x	TWO_HORIZONTAL
cmfxj06e6000xqyf4hmhzd05x	FOUR_CORNERS
cmfxj06ef000yqyf4pp5gx5h1	NONE
cmfxj06ef000yqyf4pp5gx5h1	TWO_VERTICAL
cmfxj06ep000zqyf42im6zh2b	NONE
cmfxj06ep000zqyf42im6zh2b	TWO_HORIZONTAL
cmfxj06ew0010qyf46rabniha	NONE
cmfxj06ew0010qyf46rabniha	TWO_VERTICAL
cmfxj06ew0010qyf46rabniha	FOUR_CORNERS
cmfxj06f20011qyf456y34hfv	NONE
cmfxj06f20011qyf456y34hfv	TWO_HORIZONTAL
cmfxj06f20011qyf456y34hfv	FOUR_CORNERS
\.


--
-- Data for Name: TemplateSize; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TemplateSize" ("templateId", "sizeId") FROM stdin;
cmfxj063i0000qyf4ptstwhkl	5
cmfxj063i0000qyf4ptstwhkl	31
cmfxj06440001qyf4tdpmqc9c	5
cmfxj06440001qyf4tdpmqc9c	31
cmfxj064y0004qyf473wtlu0v	8
cmfxj064y0004qyf473wtlu0v	14
cmfxj064y0004qyf473wtlu0v	25
cmfxj064y0004qyf473wtlu0v	26
cmfxj064y0004qyf473wtlu0v	30
cmfxj064y0004qyf473wtlu0v	32
cmfxj065a0005qyf4x5jq9u9z	8
cmfxj065a0005qyf4x5jq9u9z	14
cmfxj065a0005qyf4x5jq9u9z	25
cmfxj065a0005qyf4x5jq9u9z	26
cmfxj065a0005qyf4x5jq9u9z	30
cmfxj065a0005qyf4x5jq9u9z	32
cmfxj065j0006qyf4l0x3wtma	4
cmfxj065j0006qyf4l0x3wtma	6
cmfxj065j0006qyf4l0x3wtma	15
cmfxj065j0006qyf4l0x3wtma	17
cmfxj065j0006qyf4l0x3wtma	23
cmfxj065j0006qyf4l0x3wtma	29
cmfxj065u0007qyf4qx03pn4o	4
cmfxj065u0007qyf4qx03pn4o	6
cmfxj065u0007qyf4qx03pn4o	15
cmfxj065u0007qyf4qx03pn4o	17
cmfxj065u0007qyf4qx03pn4o	23
cmfxj065u0007qyf4qx03pn4o	29
cmfxj06630008qyf4t0tqg2xg	1
cmfxj06630008qyf4t0tqg2xg	2
cmfxj06630008qyf4t0tqg2xg	3
cmfxj06630008qyf4t0tqg2xg	11
cmfxj06630008qyf4t0tqg2xg	13
cmfxj06630008qyf4t0tqg2xg	14
cmfxj06630008qyf4t0tqg2xg	25
cmfxj06630008qyf4t0tqg2xg	27
cmfxj06630008qyf4t0tqg2xg	28
cmfxj06630008qyf4t0tqg2xg	30
cmfxj066l0009qyf4inp7dimr	1
cmfxj066l0009qyf4inp7dimr	2
cmfxj066l0009qyf4inp7dimr	3
cmfxj066l0009qyf4inp7dimr	11
cmfxj066l0009qyf4inp7dimr	13
cmfxj066l0009qyf4inp7dimr	14
cmfxj066l0009qyf4inp7dimr	25
cmfxj066l0009qyf4inp7dimr	27
cmfxj066l0009qyf4inp7dimr	28
cmfxj066l0009qyf4inp7dimr	30
cmfxj0671000aqyf4bjeyuyld	4
cmfxj0671000aqyf4bjeyuyld	7
cmfxj0671000aqyf4bjeyuyld	9
cmfxj0671000aqyf4bjeyuyld	10
cmfxj0671000aqyf4bjeyuyld	15
cmfxj0671000aqyf4bjeyuyld	16
cmfxj0671000aqyf4bjeyuyld	18
cmfxj0671000aqyf4bjeyuyld	19
cmfxj0671000aqyf4bjeyuyld	21
cmfxj0671000aqyf4bjeyuyld	29
cmfxj067e000bqyf43t016hyf	4
cmfxj067e000bqyf43t016hyf	7
cmfxj067e000bqyf43t016hyf	9
cmfxj067e000bqyf43t016hyf	10
cmfxj067e000bqyf43t016hyf	15
cmfxj067e000bqyf43t016hyf	16
cmfxj067e000bqyf43t016hyf	18
cmfxj067e000bqyf43t016hyf	19
cmfxj067e000bqyf43t016hyf	21
cmfxj067e000bqyf43t016hyf	29
cmfxj067s000cqyf49h06e1bz	1
cmfxj067s000cqyf49h06e1bz	2
cmfxj067s000cqyf49h06e1bz	3
cmfxj067s000cqyf49h06e1bz	11
cmfxj067s000cqyf49h06e1bz	13
cmfxj067s000cqyf49h06e1bz	14
cmfxj067s000cqyf49h06e1bz	25
cmfxj067s000cqyf49h06e1bz	27
cmfxj067s000cqyf49h06e1bz	28
cmfxj067s000cqyf49h06e1bz	30
cmfxj0687000dqyf40al7mmdm	1
cmfxj0687000dqyf40al7mmdm	2
cmfxj0687000dqyf40al7mmdm	3
cmfxj0687000dqyf40al7mmdm	11
cmfxj0687000dqyf40al7mmdm	13
cmfxj0687000dqyf40al7mmdm	14
cmfxj0687000dqyf40al7mmdm	25
cmfxj0687000dqyf40al7mmdm	27
cmfxj0687000dqyf40al7mmdm	28
cmfxj0687000dqyf40al7mmdm	30
cmfxj068l000eqyf4iv29u1kz	4
cmfxj068l000eqyf4iv29u1kz	7
cmfxj068l000eqyf4iv29u1kz	9
cmfxj068l000eqyf4iv29u1kz	10
cmfxj068l000eqyf4iv29u1kz	15
cmfxj068l000eqyf4iv29u1kz	16
cmfxj068l000eqyf4iv29u1kz	18
cmfxj068l000eqyf4iv29u1kz	19
cmfxj068l000eqyf4iv29u1kz	21
cmfxj068l000eqyf4iv29u1kz	29
cmfxj068z000fqyf4hfpn3hzr	4
cmfxj068z000fqyf4hfpn3hzr	7
cmfxj068z000fqyf4hfpn3hzr	9
cmfxj068z000fqyf4hfpn3hzr	10
cmfxj068z000fqyf4hfpn3hzr	15
cmfxj068z000fqyf4hfpn3hzr	16
cmfxj068z000fqyf4hfpn3hzr	18
cmfxj068z000fqyf4hfpn3hzr	19
cmfxj068z000fqyf4hfpn3hzr	21
cmfxj068z000fqyf4hfpn3hzr	29
cmfxj069c000gqyf4sx8m1y3o	8
cmfxj069c000gqyf4sx8m1y3o	14
cmfxj069c000gqyf4sx8m1y3o	25
cmfxj069c000gqyf4sx8m1y3o	26
cmfxj069c000gqyf4sx8m1y3o	30
cmfxj069c000gqyf4sx8m1y3o	32
cmfxj069n000hqyf4jqfecti9	8
cmfxj069n000hqyf4jqfecti9	14
cmfxj069n000hqyf4jqfecti9	25
cmfxj069n000hqyf4jqfecti9	26
cmfxj069n000hqyf4jqfecti9	30
cmfxj069n000hqyf4jqfecti9	32
cmfxj069y000iqyf49t2nne4b	4
cmfxj069y000iqyf49t2nne4b	6
cmfxj069y000iqyf49t2nne4b	15
cmfxj069y000iqyf49t2nne4b	17
cmfxj069y000iqyf49t2nne4b	23
cmfxj069y000iqyf49t2nne4b	29
cmfxj06aa000jqyf42i8gaapi	4
cmfxj06aa000jqyf42i8gaapi	6
cmfxj06aa000jqyf42i8gaapi	15
cmfxj06aa000jqyf42i8gaapi	17
cmfxj06aa000jqyf42i8gaapi	23
cmfxj06aa000jqyf42i8gaapi	29
cmfxj06am000kqyf4bexungaa	1
cmfxj06am000kqyf4bexungaa	13
cmfxj06am000kqyf4bexungaa	14
cmfxj06am000kqyf4bexungaa	28
cmfxj06b0000lqyf4wjs9zuxt	1
cmfxj06b0000lqyf4wjs9zuxt	13
cmfxj06b0000lqyf4wjs9zuxt	14
cmfxj06b0000lqyf4wjs9zuxt	28
cmfxj06bd000mqyf4clxt8rld	1
cmfxj06bd000mqyf4clxt8rld	13
cmfxj06bd000mqyf4clxt8rld	14
cmfxj06bd000mqyf4clxt8rld	25
cmfxj06bd000mqyf4clxt8rld	28
cmfxj06bd000mqyf4clxt8rld	30
cmfxj06bm000nqyf4506fh414	1
cmfxj06bm000nqyf4506fh414	13
cmfxj06bm000nqyf4506fh414	14
cmfxj06bm000nqyf4506fh414	25
cmfxj06bm000nqyf4506fh414	28
cmfxj06bm000nqyf4506fh414	30
cmfxj06bw000oqyf4g79dsqjz	4
cmfxj06bw000oqyf4g79dsqjz	10
cmfxj06bw000oqyf4g79dsqjz	15
cmfxj06bw000oqyf4g79dsqjz	16
cmfxj06bw000oqyf4g79dsqjz	19
cmfxj06bw000oqyf4g79dsqjz	29
cmfxj06c5000pqyf4d2aedc5w	4
cmfxj06c5000pqyf4d2aedc5w	10
cmfxj06c5000pqyf4d2aedc5w	15
cmfxj06c5000pqyf4d2aedc5w	16
cmfxj06c5000pqyf4d2aedc5w	19
cmfxj06c5000pqyf4d2aedc5w	29
cmfxj06ce000qqyf499mks1as	8
cmfxj06ce000qqyf499mks1as	14
cmfxj06ce000qqyf499mks1as	25
cmfxj06ce000qqyf499mks1as	26
cmfxj06ce000qqyf499mks1as	30
cmfxj06ce000qqyf499mks1as	32
cmfxj06cm000rqyf4vk6eiayv	8
cmfxj06cm000rqyf4vk6eiayv	14
cmfxj06cm000rqyf4vk6eiayv	25
cmfxj06cm000rqyf4vk6eiayv	26
cmfxj06cm000rqyf4vk6eiayv	30
cmfxj06cm000rqyf4vk6eiayv	32
cmfxj06cu000sqyf4hfkxu3cp	4
cmfxj06cu000sqyf4hfkxu3cp	6
cmfxj06cu000sqyf4hfkxu3cp	15
cmfxj06cu000sqyf4hfkxu3cp	17
cmfxj06cu000sqyf4hfkxu3cp	23
cmfxj06cu000sqyf4hfkxu3cp	29
cmfxj06d3000tqyf4e7ko0xld	4
cmfxj06d3000tqyf4e7ko0xld	6
cmfxj06d3000tqyf4e7ko0xld	15
cmfxj06d3000tqyf4e7ko0xld	17
cmfxj06d3000tqyf4e7ko0xld	23
cmfxj06d3000tqyf4e7ko0xld	29
cmfxj06dc000uqyf4h8b7oazg	1
cmfxj06dc000uqyf4h8b7oazg	13
cmfxj06dc000uqyf4h8b7oazg	14
cmfxj06dc000uqyf4h8b7oazg	28
cmfxj06dn000vqyf4o1qlkzz3	1
cmfxj06dn000vqyf4o1qlkzz3	13
cmfxj06dn000vqyf4o1qlkzz3	14
cmfxj06dn000vqyf4o1qlkzz3	28
cmfxj06dw000wqyf4992rrgnl	1
cmfxj06dw000wqyf4992rrgnl	2
cmfxj06dw000wqyf4992rrgnl	3
cmfxj06dw000wqyf4992rrgnl	11
cmfxj06dw000wqyf4992rrgnl	13
cmfxj06dw000wqyf4992rrgnl	14
cmfxj06dw000wqyf4992rrgnl	25
cmfxj06dw000wqyf4992rrgnl	27
cmfxj06dw000wqyf4992rrgnl	28
cmfxj06dw000wqyf4992rrgnl	30
cmfxj06e6000xqyf4hmhzd05x	4
cmfxj06e6000xqyf4hmhzd05x	7
cmfxj06e6000xqyf4hmhzd05x	9
cmfxj06e6000xqyf4hmhzd05x	10
cmfxj06e6000xqyf4hmhzd05x	15
cmfxj06e6000xqyf4hmhzd05x	16
cmfxj06e6000xqyf4hmhzd05x	18
cmfxj06e6000xqyf4hmhzd05x	19
cmfxj06e6000xqyf4hmhzd05x	21
cmfxj06e6000xqyf4hmhzd05x	29
cmfxj06ef000yqyf4pp5gx5h1	2
cmfxj06ef000yqyf4pp5gx5h1	11
cmfxj06ef000yqyf4pp5gx5h1	12
cmfxj06ef000yqyf4pp5gx5h1	20
cmfxj06ef000yqyf4pp5gx5h1	22
cmfxj06ef000yqyf4pp5gx5h1	24
cmfxj06ef000yqyf4pp5gx5h1	27
cmfxj06ep000zqyf42im6zh2b	7
cmfxj06ep000zqyf42im6zh2b	9
cmfxj06ep000zqyf42im6zh2b	21
cmfxj06ew0010qyf46rabniha	1
cmfxj06ew0010qyf46rabniha	13
cmfxj06ew0010qyf46rabniha	14
cmfxj06ew0010qyf46rabniha	25
cmfxj06ew0010qyf46rabniha	28
cmfxj06ew0010qyf46rabniha	30
cmfxj06f20011qyf456y34hfv	4
cmfxj06f20011qyf456y34hfv	10
cmfxj06f20011qyf456y34hfv	15
cmfxj06f20011qyf456y34hfv	16
cmfxj06f20011qyf456y34hfv	19
cmfxj06f20011qyf456y34hfv	29
\.


--
-- Data for Name: TemplateVariant; Type: TABLE DATA; Schema: public; Owner: -
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
-- Data for Name: TemplateVariantFinish; Type: TABLE DATA; Schema: public; Owner: -
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
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
fce00bf2-9b4f-419c-8008-25064249c2fe	b36d0de2ea0ad1c8d3e2f7eb357b93be20bbb1dc4ef5d075883321210b23ed45	2025-09-24 04:56:33.890035+00	20250829043246_init_catalog	\N	\N	2025-09-24 04:56:33.813476+00	1
9c1c150c-a137-434f-b79a-ba2198e20b22	668a66939e4e470919c78327dd4d4b2e3e0b3e6ec7e396ce0c53a37b5e0a37c4	2025-09-24 04:56:33.896061+00	20250830053330_new1234	\N	\N	2025-09-24 04:56:33.890712+00	1
743951c5-681e-4207-ab1d-643a830a4f61	af355babcfeccbea0115aa5b01d23e8ea81eb6705b379ec8d76af6f0aedcf6a6	2025-09-24 04:56:33.910274+00	20250901044325_another	\N	\N	2025-09-24 04:56:33.896607+00	1
c3ca1b2d-461d-49ed-81ad-0d7229543d3b	3e1b4203164bee4e82684230fe333d324bf0e0d0d343ff0e2f78770a1d5d1c3a	2025-09-24 04:56:33.913057+00	20250911063507_update_order_status_field	\N	\N	2025-09-24 04:56:33.91066+00	1
3d8d701d-302c-4b6d-866d-e8b87069a78c	5fdf6d6d28a6c027e6e2809eba111f0351a80098a1a4dc255dda4775e4ad9645	2025-09-24 04:56:33.91601+00	20250911064157_update_order_number_status_field	\N	\N	2025-09-24 04:56:33.913474+00	1
d8549812-f3e1-4626-9f8a-491572aa6272	9bf5f11d2d643fe654b239fa9c44e1de828649ab587d7ee06371393b1cf83b9e	2025-09-24 04:56:33.918048+00	20250911064426_update_customer_email_field	\N	\N	2025-09-24 04:56:33.916366+00	1
a31607fa-89a2-4476-953f-b67daed6623f	2e84c1860f1b5293c5459e8e7668aa2a4c894ae24bdbefbf0ca8e30f13af9d3f	2025-09-24 04:56:33.920483+00	20250914082325_update_asset_model_fields	\N	\N	2025-09-24 04:56:33.918619+00	1
86428c48-3889-43f6-a138-8dbea2dfa013	07c771ea3331949e82f3b3704d4d9814c4a91139e3638b660e34119e5dcdb60c	2025-09-24 04:56:33.922697+00	20250914082500_update_asset_size_and_mime_fields	\N	\N	2025-09-24 04:56:33.920914+00	1
\.


--
-- Name: Background_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Background_id_seq"', 76, true);


--
-- Name: FinishVariant_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."FinishVariant_id_seq"', 4, true);


--
-- Name: Frame_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Frame_id_seq"', 12, true);


--
-- Name: Size_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Size_id_seq"', 64, true);


--
-- Name: Asset Asset_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Asset"
    ADD CONSTRAINT "Asset_pkey" PRIMARY KEY (id);


--
-- Name: Background Background_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Background"
    ADD CONSTRAINT "Background_pkey" PRIMARY KEY (id);


--
-- Name: FinishVariant FinishVariant_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FinishVariant"
    ADD CONSTRAINT "FinishVariant_pkey" PRIMARY KEY (id);


--
-- Name: Frame Frame_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Frame"
    ADD CONSTRAINT "Frame_pkey" PRIMARY KEY (id);


--
-- Name: OrderItemPerson OrderItemPerson_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItemPerson"
    ADD CONSTRAINT "OrderItemPerson_pkey" PRIMARY KEY (id);


--
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: Size Size_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Size"
    ADD CONSTRAINT "Size_pkey" PRIMARY KEY (id);


--
-- Name: TemplateBackground TemplateBackground_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TemplateBackground"
    ADD CONSTRAINT "TemplateBackground_pkey" PRIMARY KEY ("templateId", "backgroundId");


--
-- Name: TemplateFinish TemplateFinish_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TemplateFinish"
    ADD CONSTRAINT "TemplateFinish_pkey" PRIMARY KEY ("templateId", finish);


--
-- Name: TemplateFrame TemplateFrame_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TemplateFrame"
    ADD CONSTRAINT "TemplateFrame_pkey" PRIMARY KEY ("templateId", "frameId");


--
-- Name: TemplateHole TemplateHole_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TemplateHole"
    ADD CONSTRAINT "TemplateHole_pkey" PRIMARY KEY ("templateId", pattern);


--
-- Name: TemplateSize TemplateSize_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TemplateSize"
    ADD CONSTRAINT "TemplateSize_pkey" PRIMARY KEY ("templateId", "sizeId");


--
-- Name: TemplateVariantFinish TemplateVariantFinish_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TemplateVariantFinish"
    ADD CONSTRAINT "TemplateVariantFinish_pkey" PRIMARY KEY ("templateId", "holePattern", "finishId");


--
-- Name: TemplateVariant TemplateVariant_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TemplateVariant"
    ADD CONSTRAINT "TemplateVariant_pkey" PRIMARY KEY ("templateId", "holePattern");


--
-- Name: Template Template_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Template"
    ADD CONSTRAINT "Template_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Asset_itemId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Asset_itemId_idx" ON public."Asset" USING btree ("itemId");


--
-- Name: Background_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Background_code_key" ON public."Background" USING btree (code);


--
-- Name: FinishVariant_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "FinishVariant_code_key" ON public."FinishVariant" USING btree (code);


--
-- Name: Frame_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Frame_code_key" ON public."Frame" USING btree (code);


--
-- Name: OrderItemPerson_itemId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "OrderItemPerson_itemId_idx" ON public."OrderItemPerson" USING btree ("itemId");


--
-- Name: OrderItem_backgroundId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "OrderItem_backgroundId_idx" ON public."OrderItem" USING btree ("backgroundId");


--
-- Name: OrderItem_frameId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "OrderItem_frameId_idx" ON public."OrderItem" USING btree ("frameId");


--
-- Name: OrderItem_orderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "OrderItem_orderId_idx" ON public."OrderItem" USING btree ("orderId");


--
-- Name: OrderItem_sizeId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "OrderItem_sizeId_idx" ON public."OrderItem" USING btree ("sizeId");


--
-- Name: OrderItem_templateId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "OrderItem_templateId_idx" ON public."OrderItem" USING btree ("templateId");


--
-- Name: Order_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Order_number_key" ON public."Order" USING btree (number);


--
-- Name: Order_orderNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Order_orderNumber_key" ON public."Order" USING btree ("orderNumber");


--
-- Name: Size_heightCm_widthCm_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Size_heightCm_widthCm_idx" ON public."Size" USING btree ("heightCm", "widthCm");


--
-- Name: Size_widthCm_heightCm_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Size_widthCm_heightCm_key" ON public."Size" USING btree ("widthCm", "heightCm");


--
-- Name: Template_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Template_code_key" ON public."Template" USING btree (code);


--
-- Name: Template_colorMode_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Template_colorMode_idx" ON public."Template" USING btree ("colorMode");


--
-- Name: Template_material_shape_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Template_material_shape_idx" ON public."Template" USING btree (material, shape);


--
-- Name: Asset Asset_itemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Asset"
    ADD CONSTRAINT "Asset_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES public."OrderItem"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItemPerson OrderItemPerson_itemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItemPerson"
    ADD CONSTRAINT "OrderItemPerson_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES public."OrderItem"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItem OrderItem_backgroundId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_backgroundId_fkey" FOREIGN KEY ("backgroundId") REFERENCES public."Background"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_frameId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_frameId_fkey" FOREIGN KEY ("frameId") REFERENCES public."Frame"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItem OrderItem_sizeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES public."Size"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public."Template"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TemplateBackground TemplateBackground_backgroundId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TemplateBackground"
    ADD CONSTRAINT "TemplateBackground_backgroundId_fkey" FOREIGN KEY ("backgroundId") REFERENCES public."Background"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TemplateBackground TemplateBackground_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TemplateBackground"
    ADD CONSTRAINT "TemplateBackground_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public."Template"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TemplateFinish TemplateFinish_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TemplateFinish"
    ADD CONSTRAINT "TemplateFinish_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public."Template"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TemplateFrame TemplateFrame_frameId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TemplateFrame"
    ADD CONSTRAINT "TemplateFrame_frameId_fkey" FOREIGN KEY ("frameId") REFERENCES public."Frame"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TemplateFrame TemplateFrame_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TemplateFrame"
    ADD CONSTRAINT "TemplateFrame_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public."Template"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TemplateHole TemplateHole_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TemplateHole"
    ADD CONSTRAINT "TemplateHole_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public."Template"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TemplateSize TemplateSize_sizeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TemplateSize"
    ADD CONSTRAINT "TemplateSize_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES public."Size"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TemplateSize TemplateSize_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TemplateSize"
    ADD CONSTRAINT "TemplateSize_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public."Template"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TemplateVariantFinish TemplateVariantFinish_finishId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TemplateVariantFinish"
    ADD CONSTRAINT "TemplateVariantFinish_finishId_fkey" FOREIGN KEY ("finishId") REFERENCES public."FinishVariant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TemplateVariantFinish TemplateVariantFinish_templateId_holePattern_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TemplateVariantFinish"
    ADD CONSTRAINT "TemplateVariantFinish_templateId_holePattern_fkey" FOREIGN KEY ("templateId", "holePattern") REFERENCES public."TemplateVariant"("templateId", "holePattern") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TemplateVariant TemplateVariant_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TemplateVariant"
    ADD CONSTRAINT "TemplateVariant_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public."Template"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 8HEX67Hbh2b1rwONWeh11Egcnu89XbANobIuVMzOhia6n9mPRPftiMNKxklVDSb

