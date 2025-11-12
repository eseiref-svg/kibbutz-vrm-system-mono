--
-- PostgreSQL database dump
--

\restrict 2enrh2EZysdh5QqLYLeGlIJof6L15FZ34a0VPtPRYKSDSQSRDSRaHItdaPwtZDt

-- Dumped from database version 13.22
-- Dumped by pg_dump version 13.22

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

ALTER TABLE IF EXISTS ONLY public."user" DROP CONSTRAINT IF EXISTS user_permissions_id_foreign;
ALTER TABLE IF EXISTS ONLY public.transaction DROP CONSTRAINT IF EXISTS transaction_alert_id_foreign;
ALTER TABLE IF EXISTS ONLY public.supplier_requests DROP CONSTRAINT IF EXISTS supplier_requests_supplier_field_id_fkey;
ALTER TABLE IF EXISTS ONLY public.supplier_requests DROP CONSTRAINT IF EXISTS supplier_requests_requested_by_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.supplier_requests DROP CONSTRAINT IF EXISTS supplier_requests_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.supplier DROP CONSTRAINT IF EXISTS supplier_payment_terms_id_foreign;
ALTER TABLE IF EXISTS ONLY public.supplier DROP CONSTRAINT IF EXISTS supplier_field_id_foreign;
ALTER TABLE IF EXISTS ONLY public.supplier DROP CONSTRAINT IF EXISTS supplier_address_id_foreign;
ALTER TABLE IF EXISTS ONLY public.sale DROP CONSTRAINT IF EXISTS sale_transaction_id_foreign;
ALTER TABLE IF EXISTS ONLY public.sale DROP CONSTRAINT IF EXISTS sale_client_id_foreign;
ALTER TABLE IF EXISTS ONLY public.sale DROP CONSTRAINT IF EXISTS sale_branch_id_foreign;
ALTER TABLE IF EXISTS ONLY public.review DROP CONSTRAINT IF EXISTS review_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.review DROP CONSTRAINT IF EXISTS review_supplier_id_foreign;
ALTER TABLE IF EXISTS ONLY public.payment_req DROP CONSTRAINT IF EXISTS payment_req_transaction_id_foreign;
ALTER TABLE IF EXISTS ONLY public.payment_req DROP CONSTRAINT IF EXISTS payment_req_supplier_id_foreign;
ALTER TABLE IF EXISTS ONLY public.payment_req DROP CONSTRAINT IF EXISTS payment_req_branch_id_foreign;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.client_request DROP CONSTRAINT IF EXISTS client_request_reviewed_by_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.client_request DROP CONSTRAINT IF EXISTS client_request_requested_by_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.client_request DROP CONSTRAINT IF EXISTS client_request_client_id_foreign;
ALTER TABLE IF EXISTS ONLY public.client_request DROP CONSTRAINT IF EXISTS client_request_branch_id_foreign;
ALTER TABLE IF EXISTS ONLY public.client_request DROP CONSTRAINT IF EXISTS client_request_approved_sale_id_foreign;
ALTER TABLE IF EXISTS ONLY public.client_request DROP CONSTRAINT IF EXISTS client_request_approved_client_id_foreign;
ALTER TABLE IF EXISTS ONLY public.client DROP CONSTRAINT IF EXISTS client_address_id_foreign;
ALTER TABLE IF EXISTS ONLY public.branch DROP CONSTRAINT IF EXISTS branch_manager_foreign;
ALTER TABLE IF EXISTS ONLY public.branch DROP CONSTRAINT IF EXISTS branch_balance_id_foreign;
ALTER TABLE IF EXISTS ONLY public.alert DROP CONSTRAINT IF EXISTS alert_transaction_id_foreign;
DROP INDEX IF EXISTS public.idx_transaction_status;
DROP INDEX IF EXISTS public.idx_transaction_due_date;
DROP INDEX IF EXISTS public.idx_transaction_alert_id;
DROP INDEX IF EXISTS public.idx_notifications_user_unread;
DROP INDEX IF EXISTS public.idx_client_request_status;
DROP INDEX IF EXISTS public.idx_client_request_client_id;
DROP INDEX IF EXISTS public.idx_client_request_branch_id;
DROP INDEX IF EXISTS public.idx_alert_transaction_id;
DROP INDEX IF EXISTS public.idx_alert_severity;
ALTER TABLE IF EXISTS ONLY public."user" DROP CONSTRAINT IF EXISTS user_pkey;
ALTER TABLE IF EXISTS ONLY public."user" DROP CONSTRAINT IF EXISTS user_email_key;
ALTER TABLE IF EXISTS ONLY public.transaction DROP CONSTRAINT IF EXISTS transaction_pkey;
ALTER TABLE IF EXISTS ONLY public.supplier_requests DROP CONSTRAINT IF EXISTS supplier_requests_pkey;
ALTER TABLE IF EXISTS ONLY public.supplier DROP CONSTRAINT IF EXISTS supplier_pkey;
ALTER TABLE IF EXISTS ONLY public.supplier_field DROP CONSTRAINT IF EXISTS supplier_field_pkey;
ALTER TABLE IF EXISTS ONLY public.sale DROP CONSTRAINT IF EXISTS sale_pkey;
ALTER TABLE IF EXISTS ONLY public.review DROP CONSTRAINT IF EXISTS review_pkey;
ALTER TABLE IF EXISTS ONLY public.permission DROP CONSTRAINT IF EXISTS permission_pkey;
ALTER TABLE IF EXISTS ONLY public.payment_terms DROP CONSTRAINT IF EXISTS payment_terms_pkey;
ALTER TABLE IF EXISTS ONLY public.payment_req DROP CONSTRAINT IF EXISTS payment_req_pkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.client_request DROP CONSTRAINT IF EXISTS client_request_pkey;
ALTER TABLE IF EXISTS ONLY public.client DROP CONSTRAINT IF EXISTS client_pkey;
ALTER TABLE IF EXISTS ONLY public.client DROP CONSTRAINT IF EXISTS client_client_number_key;
ALTER TABLE IF EXISTS ONLY public.branch DROP CONSTRAINT IF EXISTS branch_pkey;
ALTER TABLE IF EXISTS ONLY public.balance DROP CONSTRAINT IF EXISTS balance_pkey;
ALTER TABLE IF EXISTS ONLY public.alert DROP CONSTRAINT IF EXISTS alert_pkey;
ALTER TABLE IF EXISTS ONLY public.address DROP CONSTRAINT IF EXISTS address_pkey;
ALTER TABLE IF EXISTS public."user" ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.transaction ALTER COLUMN transaction_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.supplier_requests ALTER COLUMN request_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.supplier_field ALTER COLUMN supplier_field_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.sale ALTER COLUMN sale_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.review ALTER COLUMN review_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.permission ALTER COLUMN permissions_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.payment_terms ALTER COLUMN payment_terms_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.payment_req ALTER COLUMN payment_req_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.notifications ALTER COLUMN notification_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.client_request ALTER COLUMN request_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.client ALTER COLUMN client_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.balance ALTER COLUMN balance_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.alert ALTER COLUMN alert_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.address ALTER COLUMN address_id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.user_user_id_seq;
DROP TABLE IF EXISTS public."user";
DROP SEQUENCE IF EXISTS public.transaction_transaction_id_seq;
DROP TABLE IF EXISTS public.transaction;
DROP SEQUENCE IF EXISTS public.supplier_requests_request_id_seq;
DROP TABLE IF EXISTS public.supplier_requests;
DROP SEQUENCE IF EXISTS public.supplier_field_supplier_field_id_seq;
DROP TABLE IF EXISTS public.supplier_field;
DROP TABLE IF EXISTS public.supplier;
DROP SEQUENCE IF EXISTS public.supplier_supplier_id_seq;
DROP SEQUENCE IF EXISTS public.sale_sale_id_seq;
DROP TABLE IF EXISTS public.sale;
DROP SEQUENCE IF EXISTS public.review_review_id_seq;
DROP TABLE IF EXISTS public.review;
DROP SEQUENCE IF EXISTS public.permission_permissions_id_seq;
DROP TABLE IF EXISTS public.permission;
DROP SEQUENCE IF EXISTS public.payment_terms_payment_terms_id_seq;
DROP TABLE IF EXISTS public.payment_terms;
DROP SEQUENCE IF EXISTS public.payment_req_payment_req_id_seq;
DROP TABLE IF EXISTS public.payment_req;
DROP SEQUENCE IF EXISTS public.notifications_notification_id_seq;
DROP TABLE IF EXISTS public.notifications;
DROP SEQUENCE IF EXISTS public.client_request_request_id_seq;
DROP TABLE IF EXISTS public.client_request;
DROP SEQUENCE IF EXISTS public.client_client_id_seq;
DROP TABLE IF EXISTS public.client;
DROP TABLE IF EXISTS public.branch;
DROP SEQUENCE IF EXISTS public.balance_balance_id_seq;
DROP TABLE IF EXISTS public.balance;
DROP SEQUENCE IF EXISTS public.alert_alert_id_seq;
DROP TABLE IF EXISTS public.alert;
DROP SEQUENCE IF EXISTS public.address_address_id_seq;
DROP TABLE IF EXISTS public.address;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: address; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.address (
    address_id integer NOT NULL,
    street_name character varying(150) NOT NULL,
    house_no character varying(50) NOT NULL,
    additional character varying(150),
    city character varying(150) NOT NULL,
    zip_code character varying(50) NOT NULL,
    phone_no character varying(50) NOT NULL
);


--
-- Name: address_address_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.address_address_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: address_address_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.address_address_id_seq OWNED BY public.address.address_id;


--
-- Name: alert; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.alert (
    alert_id integer NOT NULL,
    transaction_id integer NOT NULL,
    alert_type character varying(50),
    severity character varying(20),
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT alert_severity_check CHECK (((severity)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying])::text[])))
);


--
-- Name: TABLE alert; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.alert IS 'התראות על אי-עמידה בתנאי תשלום';


--
-- Name: COLUMN alert.alert_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.alert.alert_type IS 'סוג ההתראה: upcoming_payment, payment_due_today, payment_overdue';


--
-- Name: COLUMN alert.severity; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.alert.severity IS 'חומרת ההתראה: low, medium, high, critical';


--
-- Name: alert_alert_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.alert_alert_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: alert_alert_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.alert_alert_id_seq OWNED BY public.alert.alert_id;


--
-- Name: balance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.balance (
    balance_id integer NOT NULL,
    debit numeric(10,2) DEFAULT 0.00 NOT NULL,
    credit numeric(10,2) DEFAULT 0.00 NOT NULL
);


--
-- Name: balance_balance_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.balance_balance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: balance_balance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.balance_balance_id_seq OWNED BY public.balance.balance_id;


--
-- Name: branch; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.branch (
    branch_id integer NOT NULL,
    business boolean NOT NULL,
    name character varying(150) NOT NULL,
    description text,
    manager_id integer NOT NULL,
    balance_id integer NOT NULL
);


--
-- Name: client; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client (
    client_id integer NOT NULL,
    name character varying(150) NOT NULL,
    address_id integer NOT NULL,
    poc_name character varying(150) NOT NULL,
    poc_phone character varying(20) NOT NULL,
    poc_email character varying(150),
    client_number character varying(50),
    default_payment_terms character varying(50) DEFAULT 'current_50'::character varying
);


--
-- Name: client_client_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.client_client_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: client_client_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.client_client_id_seq OWNED BY public.client.client_id;


--
-- Name: client_request; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_request (
    request_id integer NOT NULL,
    branch_id integer NOT NULL,
    requested_by_user_id integer NOT NULL,
    client_name character varying(150) NOT NULL,
    poc_name character varying(150) NOT NULL,
    poc_phone character varying(20) NOT NULL,
    poc_email character varying(150),
    city character varying(100),
    street_name character varying(150),
    house_no character varying(20),
    zip_code character varying(20),
    quote_value numeric(10,2),
    payment_terms character varying(20),
    quote_description text,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    reviewed_by_user_id integer,
    review_notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    reviewed_at timestamp without time zone,
    approved_client_id integer,
    approved_sale_id integer,
    client_id integer,
    CONSTRAINT client_request_payment_terms_check CHECK (((payment_terms)::text = ANY ((ARRAY['immediate'::character varying, 'plus_30'::character varying, 'plus_60'::character varying, 'plus_90'::character varying])::text[]))),
    CONSTRAINT client_request_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[])))
);


--
-- Name: TABLE client_request; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.client_request IS 'בקשות מנהלי ענפים לרישום לקוח חדש';


--
-- Name: COLUMN client_request.payment_terms; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.client_request.payment_terms IS 'תנאי תשלום: immediate=מיידי, plus_30=+30 ימים, plus_60=+60 ימים, plus_90=+90 ימים';


--
-- Name: client_request_request_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.client_request_request_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: client_request_request_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.client_request_request_id_seq OWNED BY public.client_request.request_id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    notification_id integer NOT NULL,
    user_id integer NOT NULL,
    message text NOT NULL,
    type character varying(50) NOT NULL,
    related_id integer,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: TABLE notifications; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.notifications IS 'טבלת התראות למשתמשים במערכת';


--
-- Name: COLUMN notifications.type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.notifications.type IS 'סוג ההתראה - supplier_approved, supplier_rejected, וכו';


--
-- Name: COLUMN notifications.related_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.notifications.related_id IS 'מזהה הישות הקשורה להתראה';


--
-- Name: notifications_notification_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notifications_notification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notifications_notification_id_seq OWNED BY public.notifications.notification_id;


--
-- Name: payment_req; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_req (
    payment_req_id integer NOT NULL,
    payment_req_no integer NOT NULL,
    supplier_id integer NOT NULL,
    branch_id integer NOT NULL,
    transaction_id integer NOT NULL,
    payment_terms_id integer
);


--
-- Name: payment_req_payment_req_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payment_req_payment_req_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payment_req_payment_req_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payment_req_payment_req_id_seq OWNED BY public.payment_req.payment_req_id;


--
-- Name: payment_terms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_terms (
    payment_terms_id integer NOT NULL,
    eom integer NOT NULL,
    description character varying(150)
);


--
-- Name: payment_terms_payment_terms_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payment_terms_payment_terms_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payment_terms_payment_terms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payment_terms_payment_terms_id_seq OWNED BY public.payment_terms.payment_terms_id;


--
-- Name: permission; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permission (
    permissions_id integer NOT NULL,
    role_type character varying(20) NOT NULL
);


--
-- Name: permission_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.permission_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: permission_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.permission_permissions_id_seq OWNED BY public.permission.permissions_id;


--
-- Name: review; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.review (
    review_id integer NOT NULL,
    supplier_id integer NOT NULL,
    user_id integer NOT NULL,
    comment text,
    rate integer NOT NULL,
    date date DEFAULT CURRENT_DATE NOT NULL,
    CONSTRAINT review_rate_check CHECK (((rate >= 1) AND (rate <= 5)))
);


--
-- Name: review_review_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.review_review_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: review_review_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.review_review_id_seq OWNED BY public.review.review_id;


--
-- Name: sale; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sale (
    sale_id integer NOT NULL,
    invoice integer,
    client_id integer NOT NULL,
    transaction_id integer NOT NULL,
    branch_id integer NOT NULL,
    invoice_number character varying(100),
    payment_terms character varying(50)
);


--
-- Name: sale_sale_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sale_sale_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sale_sale_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sale_sale_id_seq OWNED BY public.sale.sale_id;


--
-- Name: supplier_supplier_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.supplier_supplier_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: supplier; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.supplier (
    supplier_id integer DEFAULT nextval('public.supplier_supplier_id_seq'::regclass) NOT NULL,
    name character varying(150) NOT NULL,
    address_id integer NOT NULL,
    poc_name character varying(150) NOT NULL,
    poc_phone character varying(50) NOT NULL,
    poc_email character varying(150) NOT NULL,
    supplier_field_id integer NOT NULL,
    payment_terms_id integer NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    registry_date date DEFAULT CURRENT_DATE NOT NULL,
    CONSTRAINT supplier_status_check CHECK (((status)::text = ANY ((ARRAY['rejected'::character varying, 'approved'::character varying, 'pending'::character varying, 'deleted'::character varying])::text[])))
);


--
-- Name: supplier_field; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.supplier_field (
    supplier_field_id integer NOT NULL,
    field character varying(150) NOT NULL,
    tags text[]
);


--
-- Name: supplier_field_supplier_field_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.supplier_field_supplier_field_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: supplier_field_supplier_field_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.supplier_field_supplier_field_id_seq OWNED BY public.supplier_field.supplier_field_id;


--
-- Name: supplier_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.supplier_requests (
    request_id integer NOT NULL,
    requested_by_user_id integer,
    branch_id integer,
    supplier_name character varying(255) NOT NULL,
    poc_name character varying(150),
    poc_email character varying(150),
    poc_phone character varying(50),
    status character varying(20) DEFAULT 'pending'::character varying,
    created_at date DEFAULT CURRENT_DATE,
    supplier_field_id integer,
    new_supplier_field character varying(150),
    requested_supplier_id integer
);


--
-- Name: supplier_requests_request_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.supplier_requests_request_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: supplier_requests_request_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.supplier_requests_request_id_seq OWNED BY public.supplier_requests.request_id;


--
-- Name: transaction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transaction (
    transaction_id integer NOT NULL,
    value numeric(10,2) NOT NULL,
    due_date date NOT NULL,
    actual_date date,
    status character varying(20) DEFAULT 'open'::character varying NOT NULL,
    alert_id integer,
    description text,
    CONSTRAINT transaction_status_check CHECK (((status)::text = ANY (ARRAY[('open'::character varying)::text, ('frozen'::character varying)::text, ('deleted'::character varying)::text, ('paid'::character varying)::text, ('pending_approval'::character varying)::text])))
);


--
-- Name: transaction_transaction_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.transaction_transaction_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: transaction_transaction_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.transaction_transaction_id_seq OWNED BY public.transaction.transaction_id;


--
-- Name: user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."user" (
    user_id integer NOT NULL,
    permissions_id integer NOT NULL,
    first_name character varying(150) NOT NULL,
    surname character varying(150) NOT NULL,
    email character varying(150) NOT NULL,
    phone_no character varying(50) NOT NULL,
    password character varying(255) NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    reset_token character varying(255),
    reset_token_expires timestamp with time zone,
    CONSTRAINT user_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying])::text[])))
);


--
-- Name: user_user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_user_id_seq OWNED BY public."user".user_id;


--
-- Name: address address_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.address ALTER COLUMN address_id SET DEFAULT nextval('public.address_address_id_seq'::regclass);


--
-- Name: alert alert_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alert ALTER COLUMN alert_id SET DEFAULT nextval('public.alert_alert_id_seq'::regclass);


--
-- Name: balance balance_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.balance ALTER COLUMN balance_id SET DEFAULT nextval('public.balance_balance_id_seq'::regclass);


--
-- Name: client client_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client ALTER COLUMN client_id SET DEFAULT nextval('public.client_client_id_seq'::regclass);


--
-- Name: client_request request_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_request ALTER COLUMN request_id SET DEFAULT nextval('public.client_request_request_id_seq'::regclass);


--
-- Name: notifications notification_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN notification_id SET DEFAULT nextval('public.notifications_notification_id_seq'::regclass);


--
-- Name: payment_req payment_req_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_req ALTER COLUMN payment_req_id SET DEFAULT nextval('public.payment_req_payment_req_id_seq'::regclass);


--
-- Name: payment_terms payment_terms_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_terms ALTER COLUMN payment_terms_id SET DEFAULT nextval('public.payment_terms_payment_terms_id_seq'::regclass);


--
-- Name: permission permissions_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permission ALTER COLUMN permissions_id SET DEFAULT nextval('public.permission_permissions_id_seq'::regclass);


--
-- Name: review review_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review ALTER COLUMN review_id SET DEFAULT nextval('public.review_review_id_seq'::regclass);


--
-- Name: sale sale_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale ALTER COLUMN sale_id SET DEFAULT nextval('public.sale_sale_id_seq'::regclass);


--
-- Name: supplier_field supplier_field_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier_field ALTER COLUMN supplier_field_id SET DEFAULT nextval('public.supplier_field_supplier_field_id_seq'::regclass);


--
-- Name: supplier_requests request_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier_requests ALTER COLUMN request_id SET DEFAULT nextval('public.supplier_requests_request_id_seq'::regclass);


--
-- Name: transaction transaction_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction ALTER COLUMN transaction_id SET DEFAULT nextval('public.transaction_transaction_id_seq'::regclass);


--
-- Name: user user_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user" ALTER COLUMN user_id SET DEFAULT nextval('public.user_user_id_seq'::regclass);


--
-- Data for Name: address; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.address (address_id, street_name, house_no, additional, city, zip_code, phone_no) VALUES (1, 'street 1', 'house 1', '1', 'city 1', 'zip code 1', 'phone 1');
INSERT INTO public.address (address_id, street_name, house_no, additional, city, zip_code, phone_no) VALUES (2, 'street 2', 'house 2', '2', 'city 2', 'zip code 2', 'phone 2');
INSERT INTO public.address (address_id, street_name, house_no, additional, city, zip_code, phone_no) VALUES (3, 'street 3', 'house 3', '3', 'city 3', 'zip code 3', 'phone 3');
INSERT INTO public.address (address_id, street_name, house_no, additional, city, zip_code, phone_no) VALUES (4, 'street 4', 'house 4', '4', 'city 4', 'zip code 4', 'phone 4');
INSERT INTO public.address (address_id, street_name, house_no, additional, city, zip_code, phone_no) VALUES (5, 'street 5', 'house 5', '5', 'city 5', 'zip code 5', 'phone 5');
INSERT INTO public.address (address_id, street_name, house_no, additional, city, zip_code, phone_no) VALUES (6, 'street 6', 'house 6', '6', 'city 6', 'zip code 6', 'phone 6');
INSERT INTO public.address (address_id, street_name, house_no, additional, city, zip_code, phone_no) VALUES (7, 'street 7', 'house 7', '7', 'city 7', 'zip code 7', 'phone 7');
INSERT INTO public.address (address_id, street_name, house_no, additional, city, zip_code, phone_no) VALUES (8, 'street 8', 'house 8', '8', 'city 8', 'zip code 8', 'phone 8');
INSERT INTO public.address (address_id, street_name, house_no, additional, city, zip_code, phone_no) VALUES (9, 'street 9', 'house 9', '9', 'city 9', 'zip code 9', 'phone 9');
INSERT INTO public.address (address_id, street_name, house_no, additional, city, zip_code, phone_no) VALUES (10, 'street 10', 'house 10', '10', 'city 10', 'zip code 10', 'phone 10');
INSERT INTO public.address (address_id, street_name, house_no, additional, city, zip_code, phone_no) VALUES (11, 'street 11', 'house 11', '11', 'city 11', 'zip code 11', 'phone 11');
INSERT INTO public.address (address_id, street_name, house_no, additional, city, zip_code, phone_no) VALUES (12, 'street 12', 'house 12', '12', 'city 12', 'zip code 12', 'phone 12');
INSERT INTO public.address (address_id, street_name, house_no, additional, city, zip_code, phone_no) VALUES (13, 'street 13', 'house 13', '13', 'city 13', 'zip code 13', 'phone 13');
INSERT INTO public.address (address_id, street_name, house_no, additional, city, zip_code, phone_no) VALUES (14, 'street 14', 'house 14', '14', 'city 14', 'zip code 14', 'phone 14');
INSERT INTO public.address (address_id, street_name, house_no, additional, city, zip_code, phone_no) VALUES (15, 'street 15', 'house 15', '15', 'city 15', 'zip code 15', 'phone 15');
INSERT INTO public.address (address_id, street_name, house_no, additional, city, zip_code, phone_no) VALUES (16, 'street 16', 'house 16', '16', 'city 16', 'zip code 16', 'phone 16');
INSERT INTO public.address (address_id, street_name, house_no, additional, city, zip_code, phone_no) VALUES (17, 'street 17', 'house 17', '17', 'city 17', 'zip code 17', 'phone 17');
INSERT INTO public.address (address_id, street_name, house_no, additional, city, zip_code, phone_no) VALUES (18, 'street 18', 'house 18', '18', 'city 18', 'zip code 18', 'phone 18');
INSERT INTO public.address (address_id, street_name, house_no, additional, city, zip_code, phone_no) VALUES (19, 'street 19', 'house 19', '19', 'city 19', 'zip code 19', 'phone 19');
INSERT INTO public.address (address_id, street_name, house_no, additional, city, zip_code, phone_no) VALUES (20, 'street 20', 'house 20', '20', 'city 20', 'zip code 20', 'phone 20');
INSERT INTO public.address (address_id, street_name, house_no, additional, city, zip_code, phone_no) VALUES (27, 'רוטשילד', '10', '', 'תל אביב', '6578100', '03-1234567');
INSERT INTO public.address (address_id, street_name, house_no, additional, city, zip_code, phone_no) VALUES (28, 'בן יהודה', '25', '', 'ירושלים', '9100001', '02-7654321');
INSERT INTO public.address (address_id, street_name, house_no, additional, city, zip_code, phone_no) VALUES (29, 'הרצל', '50', '', 'חיפה', '3100001', '04-9876543');
INSERT INTO public.address (address_id, street_name, house_no, additional, city, zip_code, phone_no) VALUES (30, 'לא צוין', 'לא צוין', '', 'לא צוין', '0000000', '023');
INSERT INTO public.address (address_id, street_name, house_no, additional, city, zip_code, phone_no) VALUES (31, 'treet 11', '11', '', '1', 'zip ode 11', '0123886789');
INSERT INTO public.address (address_id, street_name, house_no, additional, city, zip_code, phone_no) VALUES (32, 'treet 11', '11', '', '1', 'zip ode 11', '0123886789');
INSERT INTO public.address (address_id, street_name, house_no, additional, city, zip_code, phone_no) VALUES (33, 'treet 11', '11', '', '1', 'zip ode 11', '0123886789');
INSERT INTO public.address (address_id, street_name, house_no, additional, city, zip_code, phone_no) VALUES (34, 'treet 11', '11', '', '1', 'zip ode 11', '0123886789');
INSERT INTO public.address (address_id, street_name, house_no, additional, city, zip_code, phone_no) VALUES (35, 'רוטשילד', '10', '', 'תל אביב', '6578100', '050-1234567');
INSERT INTO public.address (address_id, street_name, house_no, additional, city, zip_code, phone_no) VALUES (36, 'רוטשילד', '10', '', 'תל אביב', '6578100', '050-1234567');
INSERT INTO public.address (address_id, street_name, house_no, additional, city, zip_code, phone_no) VALUES (37, 'דיזנגוף', '100', '', 'תל אביב', '6473921', '050-1234567');
INSERT INTO public.address (address_id, street_name, house_no, additional, city, zip_code, phone_no) VALUES (38, 'דיזנגוף', '100', '', 'תל אביב', '6473921', '050-1234567');
INSERT INTO public.address (address_id, street_name, house_no, additional, city, zip_code, phone_no) VALUES (40, 'לא צוין', 'לא צוין', '', 'לא צוין', '0000000', '909090909');
INSERT INTO public.address (address_id, street_name, house_no, additional, city, zip_code, phone_no) VALUES (41, 'לא צוין', 'לא צוין', '', 'רמלה', '0000000', '90909009');
INSERT INTO public.address (address_id, street_name, house_no, additional, city, zip_code, phone_no) VALUES (42, 'לא צוין', 'לא צוין', '', 'רמלה', '0000000', '9090969049');


--
-- Data for Name: alert; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.alert (alert_id, transaction_id, alert_type, severity, created_at) VALUES (1, 4, 'other', 'low', '2025-10-26 12:47:02.514211');
INSERT INTO public.alert (alert_id, transaction_id, alert_type, severity, created_at) VALUES (2, 7, 'other', 'low', '2025-10-26 12:47:02.514211');
INSERT INTO public.alert (alert_id, transaction_id, alert_type, severity, created_at) VALUES (3, 9, 'other', 'low', '2025-10-26 12:47:02.514211');
INSERT INTO public.alert (alert_id, transaction_id, alert_type, severity, created_at) VALUES (4, 14, 'other', 'low', '2025-10-26 12:47:02.514211');
INSERT INTO public.alert (alert_id, transaction_id, alert_type, severity, created_at) VALUES (5, 17, 'other', 'low', '2025-10-26 12:47:02.514211');
INSERT INTO public.alert (alert_id, transaction_id, alert_type, severity, created_at) VALUES (6, 19, 'other', 'low', '2025-10-26 12:47:02.514211');
INSERT INTO public.alert (alert_id, transaction_id, alert_type, severity, created_at) VALUES (7, 4, 'payment_overdue', 'critical', '2025-11-11 02:00:00.430099');
INSERT INTO public.alert (alert_id, transaction_id, alert_type, severity, created_at) VALUES (8, 9, 'payment_overdue', 'critical', '2025-11-11 02:00:00.521864');
INSERT INTO public.alert (alert_id, transaction_id, alert_type, severity, created_at) VALUES (9, 14, 'payment_overdue', 'critical', '2025-11-11 02:00:00.595816');
INSERT INTO public.alert (alert_id, transaction_id, alert_type, severity, created_at) VALUES (10, 19, 'payment_overdue', 'critical', '2025-11-11 02:00:00.808765');
INSERT INTO public.alert (alert_id, transaction_id, alert_type, severity, created_at) VALUES (11, 36, 'payment_overdue', 'critical', '2025-11-11 02:00:00.869742');
INSERT INTO public.alert (alert_id, transaction_id, alert_type, severity, created_at) VALUES (12, 34, 'payment_overdue', 'critical', '2025-11-11 02:00:00.925074');
INSERT INTO public.alert (alert_id, transaction_id, alert_type, severity, created_at) VALUES (14, 37, 'payment_overdue', 'high', '2025-11-11 02:00:00.985881');
INSERT INTO public.alert (alert_id, transaction_id, alert_type, severity, created_at) VALUES (15, 38, 'payment_overdue', 'high', '2025-11-11 02:00:01.041962');
INSERT INTO public.alert (alert_id, transaction_id, alert_type, severity, created_at) VALUES (16, 39, 'payment_overdue', 'high', '2025-11-11 02:00:01.0935');
INSERT INTO public.alert (alert_id, transaction_id, alert_type, severity, created_at) VALUES (13, 35, 'payment_overdue', 'high', '2025-10-26 13:17:28.965721');
INSERT INTO public.alert (alert_id, transaction_id, alert_type, severity, created_at) VALUES (17, 40, 'payment_overdue', 'high', '2025-11-11 02:00:01.145272');
INSERT INTO public.alert (alert_id, transaction_id, alert_type, severity, created_at) VALUES (18, 41, 'payment_overdue', 'high', '2025-11-11 02:00:01.196145');
INSERT INTO public.alert (alert_id, transaction_id, alert_type, severity, created_at) VALUES (19, 42, 'payment_overdue', 'high', '2025-11-11 02:00:01.247241');
INSERT INTO public.alert (alert_id, transaction_id, alert_type, severity, created_at) VALUES (21, 50, 'payment_overdue', 'medium', '2025-11-11 02:00:01.310602');
INSERT INTO public.alert (alert_id, transaction_id, alert_type, severity, created_at) VALUES (20, 43, 'payment_overdue', 'medium', '2025-11-11 02:00:01.36229');


--
-- Data for Name: balance; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.balance (balance_id, debit, credit) VALUES (1, 1234.00, 2345.00);
INSERT INTO public.balance (balance_id, debit, credit) VALUES (2, 3456.00, 6532.00);
INSERT INTO public.balance (balance_id, debit, credit) VALUES (3, 2765.00, 1234.00);
INSERT INTO public.balance (balance_id, debit, credit) VALUES (4, 4016.00, 2259.33);
INSERT INTO public.balance (balance_id, debit, credit) VALUES (5, 4781.50, 1703.83);
INSERT INTO public.balance (balance_id, debit, credit) VALUES (6, 5547.00, 1148.33);
INSERT INTO public.balance (balance_id, debit, credit) VALUES (7, 6312.50, 592.83);
INSERT INTO public.balance (balance_id, debit, credit) VALUES (8, 7078.00, 37.33);
INSERT INTO public.balance (balance_id, debit, credit) VALUES (9, 7843.50, 518.16);
INSERT INTO public.balance (balance_id, debit, credit) VALUES (10, 8609.00, 1073.66);


--
-- Data for Name: branch; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.branch (branch_id, business, name, description, manager_id, balance_id) VALUES (15401, true, 'השכרות עסק', 'description_2', 2, 2);
INSERT INTO public.branch (branch_id, business, name, description, manager_id, balance_id) VALUES (21000, false, 'ענף המזון', 'description_3', 3, 3);
INSERT INTO public.branch (branch_id, business, name, description, manager_id, balance_id) VALUES (36000, true, 'מים יצרני', 'description_4', 4, 4);
INSERT INTO public.branch (branch_id, business, name, description, manager_id, balance_id) VALUES (15604, true, 'מוזה', 'description_5', 5, 5);
INSERT INTO public.branch (branch_id, business, name, description, manager_id, balance_id) VALUES (15605, false, 'כנסים', 'description_6', 6, 6);
INSERT INTO public.branch (branch_id, business, name, description, manager_id, balance_id) VALUES (38525, false, 'מבנה הנהלה', 'description_7', 7, 7);
INSERT INTO public.branch (branch_id, business, name, description, manager_id, balance_id) VALUES (26080, false, 'מנהלת שיוןך', 'description_8', 8, 8);
INSERT INTO public.branch (branch_id, business, name, description, manager_id, balance_id) VALUES (26050, false, 'אחזקת חצר', 'description_9', 9, 9);
INSERT INTO public.branch (branch_id, business, name, description, manager_id, balance_id) VALUES (26020, false, 'משק חום', 'description_10', 10, 10);
INSERT INTO public.branch (branch_id, business, name, description, manager_id, balance_id) VALUES (32010, false, 'חשמליה', 'description_11', 11, 1);
INSERT INTO public.branch (branch_id, business, name, description, manager_id, balance_id) VALUES (26291, false, 'נוי', 'description_12', 12, 2);
INSERT INTO public.branch (branch_id, business, name, description, manager_id, balance_id) VALUES (26030, false, 'אחזקת דירות', 'description_13', 13, 3);
INSERT INTO public.branch (branch_id, business, name, description, manager_id, balance_id) VALUES (26290, false, 'תקשורת', 'description_14', 14, 4);
INSERT INTO public.branch (branch_id, business, name, description, manager_id, balance_id) VALUES (24201, false, 'בריאות וסיעוד - ניהול', 'description_15', 15, 5);
INSERT INTO public.branch (branch_id, business, name, description, manager_id, balance_id) VALUES (24202, false, 'סיעוד בבית חבר', 'description_16', 16, 6);
INSERT INTO public.branch (branch_id, business, name, description, manager_id, balance_id) VALUES (24710, false, 'בית הדרים', 'description_17', 17, 7);
INSERT INTO public.branch (branch_id, business, name, description, manager_id, balance_id) VALUES (24100, false, 'בריאות ומרפאה', 'description_18', 18, 8);
INSERT INTO public.branch (branch_id, business, name, description, manager_id, balance_id) VALUES (24400, false, 'מרפאת שיניים', 'description_19', 19, 9);
INSERT INTO public.branch (branch_id, business, name, description, manager_id, balance_id) VALUES (27210, false, 'צרכים מיוחדים', 'description_20', 20, 10);
INSERT INTO public.branch (branch_id, business, name, description, manager_id, balance_id) VALUES (15608, true, 'אורווה', 'description_1', 31, 1);
INSERT INTO public.branch (branch_id, business, name, description, manager_id, balance_id) VALUES (99999, true, 'ענף בדיקות', 'ענף לבדיקות QA', 39, 1);


--
-- Data for Name: client; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.client (client_id, name, address_id, poc_name, poc_phone, poc_email, client_number, default_payment_terms) VALUES (1, 'client_name_1', 11, 'poc_name_1', 'poc_phone_1', 'poc_email_1', NULL, 'current_50');
INSERT INTO public.client (client_id, name, address_id, poc_name, poc_phone, poc_email, client_number, default_payment_terms) VALUES (2, 'client_name_2', 12, 'poc_name_2', 'poc_phone_2', 'poc_email_2', NULL, 'current_50');
INSERT INTO public.client (client_id, name, address_id, poc_name, poc_phone, poc_email, client_number, default_payment_terms) VALUES (3, 'client_name_3', 13, 'poc_name_3', 'poc_phone_3', 'poc_email_3', NULL, 'current_50');
INSERT INTO public.client (client_id, name, address_id, poc_name, poc_phone, poc_email, client_number, default_payment_terms) VALUES (4, 'client_name_4', 14, 'poc_name_4', 'poc_phone_4', 'poc_email_4', NULL, 'current_50');
INSERT INTO public.client (client_id, name, address_id, poc_name, poc_phone, poc_email, client_number, default_payment_terms) VALUES (5, 'client_name_5', 15, 'poc_name_5', 'poc_phone_5', 'poc_email_5', NULL, 'current_50');
INSERT INTO public.client (client_id, name, address_id, poc_name, poc_phone, poc_email, client_number, default_payment_terms) VALUES (6, 'client_name_6', 16, 'poc_name_6', 'poc_phone_6', 'poc_email_6', NULL, 'current_50');
INSERT INTO public.client (client_id, name, address_id, poc_name, poc_phone, poc_email, client_number, default_payment_terms) VALUES (7, 'client_name_7', 17, 'poc_name_7', 'poc_phone_7', 'poc_email_7', NULL, 'current_50');
INSERT INTO public.client (client_id, name, address_id, poc_name, poc_phone, poc_email, client_number, default_payment_terms) VALUES (8, 'client_name_8', 18, 'poc_name_8', 'poc_phone_8', 'poc_email_8', NULL, 'current_50');
INSERT INTO public.client (client_id, name, address_id, poc_name, poc_phone, poc_email, client_number, default_payment_terms) VALUES (9, 'client_name_9', 19, 'poc_name_9', 'poc_phone_9', 'poc_email_9', NULL, 'current_50');
INSERT INTO public.client (client_id, name, address_id, poc_name, poc_phone, poc_email, client_number, default_payment_terms) VALUES (10, 'client_name_10', 20, 'poc_name_10', 'poc_phone_10', 'poc_email_10', NULL, 'current_50');
INSERT INTO public.client (client_id, name, address_id, poc_name, poc_phone, poc_email, client_number, default_payment_terms) VALUES (17, 'חברת בדיקה א', 27, 'דני כהן', '050-1234567', 'danny@test.com', NULL, 'current_50');
INSERT INTO public.client (client_id, name, address_id, poc_name, poc_phone, poc_email, client_number, default_payment_terms) VALUES (18, 'חברת בדיקה ב - שם ארוך מאוד', 28, 'שרה לוי', '052-7654321', 'sara@test.com', NULL, 'current_50');
INSERT INTO public.client (client_id, name, address_id, poc_name, poc_phone, poc_email, client_number, default_payment_terms) VALUES (19, 'לקוח-עם-מקפים_ותווים', 29, 'משה דוד', '054-9876543', NULL, NULL, 'current_50');
INSERT INTO public.client (client_id, name, address_id, poc_name, poc_phone, poc_email, client_number, default_payment_terms) VALUES (20, 'רייצ''ל משימות בע"מ (הלקוח)', 30, 'רייצ''ל', '023', 'er@naan.com', NULL, 'current_50');
INSERT INTO public.client (client_id, name, address_id, poc_name, poc_phone, poc_email, client_number, default_payment_terms) VALUES (24, 'רייצ''ל צרכנות וכיף תמיד', 34, '_nme_1', '0123886789', 'poc@email.nl', NULL, 'current_50');
INSERT INTO public.client (client_id, name, address_id, poc_name, poc_phone, poc_email, client_number, default_payment_terms) VALUES (27, 'לקוח בדיקה DB', 37, 'יוסי כהן', '050-1234567', 'yossi@test.com', NULL, 'current_50');
INSERT INTO public.client (client_id, name, address_id, poc_name, poc_phone, poc_email, client_number, default_payment_terms) VALUES (28, 'לקוח בדיקה DB', 38, 'יוסי כהן', '050-1234567', 'yossi@test.com', NULL, 'current_50');
INSERT INTO public.client (client_id, name, address_id, poc_name, poc_phone, poc_email, client_number, default_payment_terms) VALUES (30, 'בני סימון', 40, 'בני', '909090909', 'gmail@gmil.com', NULL, 'current_50');
INSERT INTO public.client (client_id, name, address_id, poc_name, poc_phone, poc_email, client_number, default_payment_terms) VALUES (31, 'בני סימון ובניו', 41, 'סימון', '90909009', 'gmail@gmil.com', NULL, 'current_50');
INSERT INTO public.client (client_id, name, address_id, poc_name, poc_phone, poc_email, client_number, default_payment_terms) VALUES (32, 'בני סימון ובניו', 42, 'סימון', '9090969049', 'gmail@gmil.com', NULL, 'current_50');


--
-- Data for Name: client_request; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.client_request (request_id, branch_id, requested_by_user_id, client_name, poc_name, poc_phone, poc_email, city, street_name, house_no, zip_code, quote_value, payment_terms, quote_description, status, reviewed_by_user_id, review_notes, created_at, reviewed_at, approved_client_id, approved_sale_id, client_id) VALUES (1, 15608, 31, 'רייצ''ל צרכנות וכיף', 'הע', '09', 'df@naan.com', 'city 11', 'street 11', 'house 11', 'zip code 11', 15000.00, 'plus_60', 'סוכריות קופצות', 'pending', NULL, NULL, '2025-11-07 14:02:21.13437', NULL, NULL, NULL, NULL);
INSERT INTO public.client_request (request_id, branch_id, requested_by_user_id, client_name, poc_name, poc_phone, poc_email, city, street_name, house_no, zip_code, quote_value, payment_terms, quote_description, status, reviewed_by_user_id, review_notes, created_at, reviewed_at, approved_client_id, approved_sale_id, client_id) VALUES (2, 15608, 31, 'רייצ''ל צרכנות וכיף', 'הע', '909090909', 'df@naan.com', 'city 11', 'street 11', 'house 11', 'zip code 11', 15000.00, 'plus_60', 'סוכריות קופצות', 'pending', NULL, NULL, '2025-11-07 14:02:27.535329', NULL, NULL, NULL, NULL);
INSERT INTO public.client_request (request_id, branch_id, requested_by_user_id, client_name, poc_name, poc_phone, poc_email, city, street_name, house_no, zip_code, quote_value, payment_terms, quote_description, status, reviewed_by_user_id, review_notes, created_at, reviewed_at, approved_client_id, approved_sale_id, client_id) VALUES (3, 15608, 31, 'רייצ''ל צרכנות וכיף', 'poc_name_1', '089442525', 'poc@email.nl', 'city 11', 'street 11', 'house 11', 'zip code 11', 12222.00, 'immediate', NULL, 'pending', NULL, NULL, '2025-11-07 14:10:56.274069', NULL, NULL, NULL, NULL);
INSERT INTO public.client_request (request_id, branch_id, requested_by_user_id, client_name, poc_name, poc_phone, poc_email, city, street_name, house_no, zip_code, quote_value, payment_terms, quote_description, status, reviewed_by_user_id, review_notes, created_at, reviewed_at, approved_client_id, approved_sale_id, client_id) VALUES (4, 15608, 31, 'רייצ''ל צרכנות וכיף', 'poc_name_1', '089442525', 'poc@email.nl', 'city 11', 'street 11', 'house 11', 'zip code 11', 12222.00, 'immediate', NULL, 'pending', NULL, NULL, '2025-11-07 14:11:16.266948', NULL, NULL, NULL, NULL);
INSERT INTO public.client_request (request_id, branch_id, requested_by_user_id, client_name, poc_name, poc_phone, poc_email, city, street_name, house_no, zip_code, quote_value, payment_terms, quote_description, status, reviewed_by_user_id, review_notes, created_at, reviewed_at, approved_client_id, approved_sale_id, client_id) VALUES (13, 99999, 39, 'רייצ''ל צרכנות וכיף תמיד', '_nme_1', '0123886789', 'poc@email.nl', '1', 'treet 11', '11', 'zip ode 11', 122228.00, 'immediate', NULL, 'rejected', 37, 'כי ככה', '2025-11-08 12:10:49.581009', '2025-11-08 18:43:22.4884', NULL, NULL, NULL);
INSERT INTO public.client_request (request_id, branch_id, requested_by_user_id, client_name, poc_name, poc_phone, poc_email, city, street_name, house_no, zip_code, quote_value, payment_terms, quote_description, status, reviewed_by_user_id, review_notes, created_at, reviewed_at, approved_client_id, approved_sale_id, client_id) VALUES (12, 99999, 39, 'רייצ''ל צרכנות וכיף תמיד', '_nme_1', '0123886789', 'poc@email.nl', '1', 'treet 11', '11', 'zip ode 11', 122228.00, 'plus_30', NULL, 'rejected', 37, 'כי ככה 2', '2025-11-08 12:03:53.484418', '2025-11-08 18:43:31.950374', NULL, NULL, NULL);
INSERT INTO public.client_request (request_id, branch_id, requested_by_user_id, client_name, poc_name, poc_phone, poc_email, city, street_name, house_no, zip_code, quote_value, payment_terms, quote_description, status, reviewed_by_user_id, review_notes, created_at, reviewed_at, approved_client_id, approved_sale_id, client_id) VALUES (7, 15608, 31, 'רייצ''ל צרכנות וכיף מאוד', 'poc_name_1', '999999', 'poc@email.nl', 'city 11', 'street 11', 'house 11', 'zip code 11', 12222.00, 'plus_30', NULL, 'rejected', 37, 'כפילות', '2025-11-08 11:06:59.683788', '2025-11-08 19:17:06.648372', NULL, NULL, NULL);
INSERT INTO public.client_request (request_id, branch_id, requested_by_user_id, client_name, poc_name, poc_phone, poc_email, city, street_name, house_no, zip_code, quote_value, payment_terms, quote_description, status, reviewed_by_user_id, review_notes, created_at, reviewed_at, approved_client_id, approved_sale_id, client_id) VALUES (11, 99999, 39, 'רייצ''ל צרכנות וכיף', 'poc_name_1', '0123456789', 'poc@email.nl', 'city 11', 'street 11', 'house 11', 'zip code 11', 12222.00, 'immediate', NULL, 'rejected', 37, 'בדיקה', '2025-11-08 11:53:36.353854', '2025-11-08 19:33:05.640332', NULL, NULL, NULL);
INSERT INTO public.client_request (request_id, branch_id, requested_by_user_id, client_name, poc_name, poc_phone, poc_email, city, street_name, house_no, zip_code, quote_value, payment_terms, quote_description, status, reviewed_by_user_id, review_notes, created_at, reviewed_at, approved_client_id, approved_sale_id, client_id) VALUES (18, 99999, 39, 'רייצ''ל צרכנות וכיף תמיד', '_nme_1', '0123886789', 'poc@email.nl', '1', 'treet 11', '11', 'zip ode 11', 321.00, 'plus_60', NULL, 'approved', 37, NULL, '2025-11-10 15:37:29.957244', '2025-11-10 15:37:43.378804', 24, 16, 24);
INSERT INTO public.client_request (request_id, branch_id, requested_by_user_id, client_name, poc_name, poc_phone, poc_email, city, street_name, house_no, zip_code, quote_value, payment_terms, quote_description, status, reviewed_by_user_id, review_notes, created_at, reviewed_at, approved_client_id, approved_sale_id, client_id) VALUES (15, 99999, 39, 'רייצ''ל צרכנות וכיף תמיד', '_nme_1', '0123886789', 'poc@email.nl', '1', 'treet 11', '11', 'zip ode 11', 122228.00, 'immediate', NULL, 'approved', 37, NULL, '2025-11-08 12:39:56.825954', '2025-11-08 18:30:28.406045', 24, 13, 24);
INSERT INTO public.client_request (request_id, branch_id, requested_by_user_id, client_name, poc_name, poc_phone, poc_email, city, street_name, house_no, zip_code, quote_value, payment_terms, quote_description, status, reviewed_by_user_id, review_notes, created_at, reviewed_at, approved_client_id, approved_sale_id, client_id) VALUES (21, 15401, 1, 'לקוח בדיקה DB', 'יוסי כהן', '050-1234567', 'yossi@test.com', 'תל אביב', 'דיזנגוף', '100', '6473921', NULL, NULL, NULL, 'approved', 2, NULL, '2025-11-12 00:16:30.602995', '2025-11-12 00:16:30.648725', 27, NULL, 27);
INSERT INTO public.client_request (request_id, branch_id, requested_by_user_id, client_name, poc_name, poc_phone, poc_email, city, street_name, house_no, zip_code, quote_value, payment_terms, quote_description, status, reviewed_by_user_id, review_notes, created_at, reviewed_at, approved_client_id, approved_sale_id, client_id) VALUES (22, 15401, 1, 'לקוח בדיקה DB', 'יוסי כהן', '050-1234567', 'yossi@test.com', 'תל אביב', 'דיזנגוף', '100', '6473921', NULL, NULL, NULL, 'approved', 2, NULL, '2025-11-12 00:17:06.606473', '2025-11-12 00:17:06.632313', 28, NULL, 28);
INSERT INTO public.client_request (request_id, branch_id, requested_by_user_id, client_name, poc_name, poc_phone, poc_email, city, street_name, house_no, zip_code, quote_value, payment_terms, quote_description, status, reviewed_by_user_id, review_notes, created_at, reviewed_at, approved_client_id, approved_sale_id, client_id) VALUES (24, 99999, 39, 'בני סימון', 'בני', '909090909', 'gmail@gmil.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'approved', 37, NULL, '2025-11-12 06:41:16.23519', '2025-11-12 06:41:44.561862', 30, NULL, 30);
INSERT INTO public.client_request (request_id, branch_id, requested_by_user_id, client_name, poc_name, poc_phone, poc_email, city, street_name, house_no, zip_code, quote_value, payment_terms, quote_description, status, reviewed_by_user_id, review_notes, created_at, reviewed_at, approved_client_id, approved_sale_id, client_id) VALUES (25, 99999, 39, 'בני סימון ובניו', 'סימון', '90909009', 'gmail@gmil.com', 'רמלה', NULL, NULL, NULL, NULL, NULL, NULL, 'approved', 37, NULL, '2025-11-12 06:46:21.952998', '2025-11-12 07:08:41.772412', 31, NULL, 31);
INSERT INTO public.client_request (request_id, branch_id, requested_by_user_id, client_name, poc_name, poc_phone, poc_email, city, street_name, house_no, zip_code, quote_value, payment_terms, quote_description, status, reviewed_by_user_id, review_notes, created_at, reviewed_at, approved_client_id, approved_sale_id, client_id) VALUES (26, 99999, 39, 'בני סימון ובניו', 'סימון', '9090969049', 'gmail@gmil.com', 'רמלה', NULL, NULL, NULL, NULL, NULL, NULL, 'approved', 37, NULL, '2025-11-12 07:18:49.20758', '2025-11-12 07:20:35.843824', 32, NULL, 32);
INSERT INTO public.client_request (request_id, branch_id, requested_by_user_id, client_name, poc_name, poc_phone, poc_email, city, street_name, house_no, zip_code, quote_value, payment_terms, quote_description, status, reviewed_by_user_id, review_notes, created_at, reviewed_at, approved_client_id, approved_sale_id, client_id) VALUES (27, 99999, 39, 'בני סימון ובניו 2', 'סימון', '9099034349', 'gmail@gfmil.com', 'רמלה', NULL, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, NULL, '2025-11-12 07:35:07.349334', NULL, NULL, NULL, NULL);


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (7, 2, 'בקשה חדשה לרישום לקוח: רייצ''ל צרכנות וכיף תמיד', 'info', NULL, false, '2025-11-08 12:39:56.881288');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (8, 1, 'בקשה חדשה לרישום לקוח: רייצ''ל צרכנות וכיף תמיד', 'info', NULL, false, '2025-11-08 12:39:56.881288');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (9, 32, 'בקשה חדשה לרישום לקוח: רייצ''ל צרכנות וכיף תמיד', 'info', NULL, false, '2025-11-08 12:39:56.881288');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (10, 29, 'בקשה חדשה לרישום לקוח: רייצ''ל צרכנות וכיף תמיד', 'info', NULL, false, '2025-11-08 12:39:56.881288');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (11, 36, 'בקשה חדשה לרישום לקוח: רייצ''ל צרכנות וכיף תמיד', 'info', NULL, false, '2025-11-08 12:39:56.881288');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (12, 37, 'בקשה חדשה לרישום לקוח: רייצ''ל צרכנות וכיף תמיד', 'info', NULL, false, '2025-11-08 12:39:56.881288');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (13, 2, 'בקשה חדשה לרישום לקוח: חברת בדיקה א', 'info', NULL, false, '2025-11-08 17:39:16.914437');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (14, 1, 'בקשה חדשה לרישום לקוח: חברת בדיקה א', 'info', NULL, false, '2025-11-08 17:39:16.914437');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (15, 32, 'בקשה חדשה לרישום לקוח: חברת בדיקה א', 'info', NULL, false, '2025-11-08 17:39:16.914437');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (16, 29, 'בקשה חדשה לרישום לקוח: חברת בדיקה א', 'info', NULL, false, '2025-11-08 17:39:16.914437');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (17, 36, 'בקשה חדשה לרישום לקוח: חברת בדיקה א', 'info', NULL, false, '2025-11-08 17:39:16.914437');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (18, 37, 'בקשה חדשה לרישום לקוח: חברת בדיקה א', 'info', NULL, false, '2025-11-08 17:39:16.914437');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (20, 39, 'הבקשה לרישום לקוח "חברת בדיקה א" אושרה', 'success', NULL, true, '2025-11-08 18:31:07.264966');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (19, 39, 'הבקשה לרישום לקוח "רייצ''ל צרכנות וכיף תמיד" אושרה', 'success', NULL, true, '2025-11-08 18:30:28.419853');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (22, 39, 'הבקשה לרישום לקוח "רייצ''ל צרכנות וכיף תמיד" נדחתה: כי ככה 2', 'error', NULL, true, '2025-11-08 18:43:31.952729');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (23, 31, 'הבקשה לרישום לקוח "רייצ''ל צרכנות וכיף מאוד" נדחתה: כפילות', 'error', NULL, false, '2025-11-08 19:17:06.683457');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (25, 2, 'בקשה חדשה לרישום לקוח: חברת בדיקה א', 'info', NULL, false, '2025-11-08 20:24:38.16773');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (26, 1, 'בקשה חדשה לרישום לקוח: חברת בדיקה א', 'info', NULL, false, '2025-11-08 20:24:38.16773');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (27, 32, 'בקשה חדשה לרישום לקוח: חברת בדיקה א', 'info', NULL, false, '2025-11-08 20:24:38.16773');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (28, 29, 'בקשה חדשה לרישום לקוח: חברת בדיקה א', 'info', NULL, false, '2025-11-08 20:24:38.16773');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (29, 36, 'בקשה חדשה לרישום לקוח: חברת בדיקה א', 'info', NULL, false, '2025-11-08 20:24:38.16773');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (30, 37, 'בקשה חדשה לרישום לקוח: חברת בדיקה א', 'info', NULL, false, '2025-11-08 20:24:38.16773');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (32, 2, 'בקשה חדשה לרישום לקוח: רייצ''ל צרכנות וכיף תמיד', 'info', NULL, false, '2025-11-10 15:37:29.98405');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (33, 1, 'בקשה חדשה לרישום לקוח: רייצ''ל צרכנות וכיף תמיד', 'info', NULL, false, '2025-11-10 15:37:29.98405');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (34, 32, 'בקשה חדשה לרישום לקוח: רייצ''ל צרכנות וכיף תמיד', 'info', NULL, false, '2025-11-10 15:37:29.98405');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (35, 29, 'בקשה חדשה לרישום לקוח: רייצ''ל צרכנות וכיף תמיד', 'info', NULL, false, '2025-11-10 15:37:29.98405');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (36, 36, 'בקשה חדשה לרישום לקוח: רייצ''ל צרכנות וכיף תמיד', 'info', NULL, false, '2025-11-10 15:37:29.98405');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (37, 37, 'בקשה חדשה לרישום לקוח: רייצ''ל צרכנות וכיף תמיד', 'info', NULL, false, '2025-11-10 15:37:29.98405');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (38, 39, 'הבקשה לרישום לקוח "רייצ''ל צרכנות וכיף תמיד" אושרה', 'success', NULL, true, '2025-11-10 15:37:43.386364');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (31, 39, 'הבקשה לרישום לקוח "חברת בדיקה א" אושרה', 'success', NULL, true, '2025-11-08 20:25:51.127573');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (24, 39, 'הבקשה לרישום לקוח "רייצ''ל צרכנות וכיף" נדחתה: בדיקה', 'error', NULL, true, '2025-11-08 19:33:05.669827');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (21, 39, 'הבקשה לרישום לקוח "רייצ''ל צרכנות וכיף תמיד" נדחתה: כי ככה', 'error', NULL, true, '2025-11-08 18:43:22.601115');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (39, 2, 'בקשה חדשה לרישום לקוח: בני סימון', 'info', NULL, false, '2025-11-12 06:41:16.261562');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (40, 1, 'בקשה חדשה לרישום לקוח: בני סימון', 'info', NULL, false, '2025-11-12 06:41:16.261562');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (41, 32, 'בקשה חדשה לרישום לקוח: בני סימון', 'info', NULL, false, '2025-11-12 06:41:16.261562');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (42, 29, 'בקשה חדשה לרישום לקוח: בני סימון', 'info', NULL, false, '2025-11-12 06:41:16.261562');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (43, 36, 'בקשה חדשה לרישום לקוח: בני סימון', 'info', NULL, false, '2025-11-12 06:41:16.261562');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (44, 37, 'בקשה חדשה לרישום לקוח: בני סימון', 'info', NULL, false, '2025-11-12 06:41:16.261562');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (45, 39, 'הבקשה לרישום לקוח "בני סימון" אושרה - הלקוח זמין כעת ליצירת דרישות תשלום', 'success', NULL, false, '2025-11-12 06:41:44.574388');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (46, 2, 'בקשה חדשה לרישום לקוח: בני סימון ובניו', 'info', NULL, false, '2025-11-12 06:46:21.988159');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (47, 1, 'בקשה חדשה לרישום לקוח: בני סימון ובניו', 'info', NULL, false, '2025-11-12 06:46:21.988159');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (48, 32, 'בקשה חדשה לרישום לקוח: בני סימון ובניו', 'info', NULL, false, '2025-11-12 06:46:21.988159');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (49, 29, 'בקשה חדשה לרישום לקוח: בני סימון ובניו', 'info', NULL, false, '2025-11-12 06:46:21.988159');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (50, 36, 'בקשה חדשה לרישום לקוח: בני סימון ובניו', 'info', NULL, false, '2025-11-12 06:46:21.988159');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (51, 37, 'בקשה חדשה לרישום לקוח: בני סימון ובניו', 'info', NULL, false, '2025-11-12 06:46:21.988159');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (52, 39, 'הבקשה לרישום לקוח "בני סימון ובניו" אושרה - הלקוח זמין כעת ליצירת דרישות תשלום', 'success', NULL, false, '2025-11-12 07:08:41.785392');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (53, 2, 'בקשה חדשה לרישום לקוח: בני סימון ובניו', 'info', NULL, false, '2025-11-12 07:18:49.23245');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (54, 1, 'בקשה חדשה לרישום לקוח: בני סימון ובניו', 'info', NULL, false, '2025-11-12 07:18:49.23245');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (55, 32, 'בקשה חדשה לרישום לקוח: בני סימון ובניו', 'info', NULL, false, '2025-11-12 07:18:49.23245');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (56, 29, 'בקשה חדשה לרישום לקוח: בני סימון ובניו', 'info', NULL, false, '2025-11-12 07:18:49.23245');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (57, 36, 'בקשה חדשה לרישום לקוח: בני סימון ובניו', 'info', NULL, false, '2025-11-12 07:18:49.23245');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (58, 37, 'בקשה חדשה לרישום לקוח: בני סימון ובניו', 'info', NULL, false, '2025-11-12 07:18:49.23245');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (59, 39, 'הבקשה לרישום לקוח "בני סימון ובניו" אושרה - הלקוח זמין כעת ליצירת דרישות תשלום', 'success', NULL, false, '2025-11-12 07:20:35.857468');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (60, 2, 'בקשה חדשה לרישום לקוח: בני סימון ובניו 2', 'info', NULL, false, '2025-11-12 07:35:07.384465');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (61, 1, 'בקשה חדשה לרישום לקוח: בני סימון ובניו 2', 'info', NULL, false, '2025-11-12 07:35:07.384465');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (62, 32, 'בקשה חדשה לרישום לקוח: בני סימון ובניו 2', 'info', NULL, false, '2025-11-12 07:35:07.384465');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (63, 29, 'בקשה חדשה לרישום לקוח: בני סימון ובניו 2', 'info', NULL, false, '2025-11-12 07:35:07.384465');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (64, 36, 'בקשה חדשה לרישום לקוח: בני סימון ובניו 2', 'info', NULL, false, '2025-11-12 07:35:07.384465');
INSERT INTO public.notifications (notification_id, user_id, message, type, related_id, is_read, created_at) VALUES (65, 37, 'בקשה חדשה לרישום לקוח: בני סימון ובניו 2', 'info', NULL, false, '2025-11-12 07:35:07.384465');


--
-- Data for Name: payment_req; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.payment_req (payment_req_id, payment_req_no, supplier_id, branch_id, transaction_id, payment_terms_id) VALUES (1, 700200, 75, 15608, 1, NULL);
INSERT INTO public.payment_req (payment_req_id, payment_req_no, supplier_id, branch_id, transaction_id, payment_terms_id) VALUES (2, 700201, 751, 15401, 2, NULL);
INSERT INTO public.payment_req (payment_req_id, payment_req_no, supplier_id, branch_id, transaction_id, payment_terms_id) VALUES (3, 700202, 7112, 21000, 3, NULL);
INSERT INTO public.payment_req (payment_req_id, payment_req_no, supplier_id, branch_id, transaction_id, payment_terms_id) VALUES (4, 700203, 7608, 36000, 4, NULL);
INSERT INTO public.payment_req (payment_req_id, payment_req_no, supplier_id, branch_id, transaction_id, payment_terms_id) VALUES (5, 700204, 7609, 15604, 5, NULL);
INSERT INTO public.payment_req (payment_req_id, payment_req_no, supplier_id, branch_id, transaction_id, payment_terms_id) VALUES (6, 700205, 70157, 15605, 6, NULL);
INSERT INTO public.payment_req (payment_req_id, payment_req_no, supplier_id, branch_id, transaction_id, payment_terms_id) VALUES (7, 700206, 70158, 38525, 7, NULL);
INSERT INTO public.payment_req (payment_req_id, payment_req_no, supplier_id, branch_id, transaction_id, payment_terms_id) VALUES (8, 700207, 70159, 26080, 8, NULL);
INSERT INTO public.payment_req (payment_req_id, payment_req_no, supplier_id, branch_id, transaction_id, payment_terms_id) VALUES (9, 700208, 70186, 26050, 9, NULL);
INSERT INTO public.payment_req (payment_req_id, payment_req_no, supplier_id, branch_id, transaction_id, payment_terms_id) VALUES (10, 700209, 70815, 26020, 10, NULL);
INSERT INTO public.payment_req (payment_req_id, payment_req_no, supplier_id, branch_id, transaction_id, payment_terms_id) VALUES (12, 2000, 75, 15401, 34, NULL);
INSERT INTO public.payment_req (payment_req_id, payment_req_no, supplier_id, branch_id, transaction_id, payment_terms_id) VALUES (13, 2001, 751, 21000, 35, NULL);
INSERT INTO public.payment_req (payment_req_id, payment_req_no, supplier_id, branch_id, transaction_id, payment_terms_id) VALUES (14, 2002, 7112, 36000, 36, NULL);
INSERT INTO public.payment_req (payment_req_id, payment_req_no, supplier_id, branch_id, transaction_id, payment_terms_id) VALUES (15, 2003, 7608, 15401, 37, NULL);
INSERT INTO public.payment_req (payment_req_id, payment_req_no, supplier_id, branch_id, transaction_id, payment_terms_id) VALUES (16, 2004, 7609, 21000, 38, NULL);
INSERT INTO public.payment_req (payment_req_id, payment_req_no, supplier_id, branch_id, transaction_id, payment_terms_id) VALUES (17, 2005, 75, 36000, 39, NULL);
INSERT INTO public.payment_req (payment_req_id, payment_req_no, supplier_id, branch_id, transaction_id, payment_terms_id) VALUES (18, 2006, 751, 15401, 40, NULL);
INSERT INTO public.payment_req (payment_req_id, payment_req_no, supplier_id, branch_id, transaction_id, payment_terms_id) VALUES (19, 2007, 7112, 21000, 41, NULL);
INSERT INTO public.payment_req (payment_req_id, payment_req_no, supplier_id, branch_id, transaction_id, payment_terms_id) VALUES (20, 2008, 7608, 36000, 42, NULL);
INSERT INTO public.payment_req (payment_req_id, payment_req_no, supplier_id, branch_id, transaction_id, payment_terms_id) VALUES (21, 2009, 7609, 15401, 43, NULL);
INSERT INTO public.payment_req (payment_req_id, payment_req_no, supplier_id, branch_id, transaction_id, payment_terms_id) VALUES (22, 2010, 75, 21000, 44, NULL);


--
-- Data for Name: payment_terms; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.payment_terms (payment_terms_id, eom, description) VALUES (1, 0, 'pay right away');
INSERT INTO public.payment_terms (payment_terms_id, eom, description) VALUES (2, 30, 'normal payment term');
INSERT INTO public.payment_terms (payment_terms_id, eom, description) VALUES (3, 60, 'good payment term');
INSERT INTO public.payment_terms (payment_terms_id, eom, description) VALUES (4, 90, 'great payment term');


--
-- Data for Name: permission; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.permission (permissions_id, role_type) VALUES (1, 'admin');
INSERT INTO public.permission (permissions_id, role_type) VALUES (2, 'gizbar');
INSERT INTO public.permission (permissions_id, role_type) VALUES (3, 'm_hshbonot');
INSERT INTO public.permission (permissions_id, role_type) VALUES (4, 'm_anaf');
INSERT INTO public.permission (permissions_id, role_type) VALUES (5, 'derictrion');


--
-- Data for Name: review; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.review (review_id, supplier_id, user_id, comment, rate, date) VALUES (1, 75, 1, 'comment_1', 1, '2024-12-25');
INSERT INTO public.review (review_id, supplier_id, user_id, comment, rate, date) VALUES (2, 751, 2, 'comment_2', 5, '2024-12-26');
INSERT INTO public.review (review_id, supplier_id, user_id, comment, rate, date) VALUES (3, 7112, 3, 'comment_3', 4, '2024-12-27');
INSERT INTO public.review (review_id, supplier_id, user_id, comment, rate, date) VALUES (4, 7608, 4, NULL, 3, '2024-12-28');
INSERT INTO public.review (review_id, supplier_id, user_id, comment, rate, date) VALUES (5, 7609, 5, NULL, 2, '2024-12-29');
INSERT INTO public.review (review_id, supplier_id, user_id, comment, rate, date) VALUES (6, 70157, 1, 'comment_6', 1, '2024-12-30');
INSERT INTO public.review (review_id, supplier_id, user_id, comment, rate, date) VALUES (7, 70158, 2, NULL, 5, '2024-12-31');
INSERT INTO public.review (review_id, supplier_id, user_id, comment, rate, date) VALUES (8, 70159, 3, 'comment_8', 3, '2025-01-01');
INSERT INTO public.review (review_id, supplier_id, user_id, comment, rate, date) VALUES (9, 70186, 4, NULL, 1, '2025-01-02');
INSERT INTO public.review (review_id, supplier_id, user_id, comment, rate, date) VALUES (10, 70815, 5, 'comment_10', 5, '2025-01-03');
INSERT INTO public.review (review_id, supplier_id, user_id, comment, rate, date) VALUES (11, 70101113, 29, 'ספק סבבה', 4, '2025-10-20');


--
-- Data for Name: sale; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.sale (sale_id, invoice, client_id, transaction_id, branch_id, invoice_number, payment_terms) VALUES (1, 600861, 1, 11, 15608, NULL, NULL);
INSERT INTO public.sale (sale_id, invoice, client_id, transaction_id, branch_id, invoice_number, payment_terms) VALUES (2, 600862, 2, 12, 15401, NULL, NULL);
INSERT INTO public.sale (sale_id, invoice, client_id, transaction_id, branch_id, invoice_number, payment_terms) VALUES (3, 600863, 3, 13, 36000, NULL, NULL);
INSERT INTO public.sale (sale_id, invoice, client_id, transaction_id, branch_id, invoice_number, payment_terms) VALUES (4, 600864, 4, 14, 15604, NULL, NULL);
INSERT INTO public.sale (sale_id, invoice, client_id, transaction_id, branch_id, invoice_number, payment_terms) VALUES (5, 600865, 5, 15, 15608, NULL, NULL);
INSERT INTO public.sale (sale_id, invoice, client_id, transaction_id, branch_id, invoice_number, payment_terms) VALUES (6, 600866, 6, 16, 15401, NULL, NULL);
INSERT INTO public.sale (sale_id, invoice, client_id, transaction_id, branch_id, invoice_number, payment_terms) VALUES (7, 600867, 7, 17, 36000, NULL, NULL);
INSERT INTO public.sale (sale_id, invoice, client_id, transaction_id, branch_id, invoice_number, payment_terms) VALUES (8, 600868, 8, 18, 15604, NULL, NULL);
INSERT INTO public.sale (sale_id, invoice, client_id, transaction_id, branch_id, invoice_number, payment_terms) VALUES (9, 600869, 9, 19, 36000, NULL, NULL);
INSERT INTO public.sale (sale_id, invoice, client_id, transaction_id, branch_id, invoice_number, payment_terms) VALUES (10, 600870, 10, 20, 15604, NULL, NULL);
INSERT INTO public.sale (sale_id, invoice, client_id, transaction_id, branch_id, invoice_number, payment_terms) VALUES (11, 109743, 17, 45, 15401, NULL, NULL);
INSERT INTO public.sale (sale_id, invoice, client_id, transaction_id, branch_id, invoice_number, payment_terms) VALUES (12, 823334, 17, 49, 99999, NULL, NULL);
INSERT INTO public.sale (sale_id, invoice, client_id, transaction_id, branch_id, invoice_number, payment_terms) VALUES (13, 337304, 24, 50, 99999, NULL, NULL);
INSERT INTO public.sale (sale_id, invoice, client_id, transaction_id, branch_id, invoice_number, payment_terms) VALUES (16, 569285, 24, 53, 99999, NULL, NULL);


--
-- Data for Name: supplier; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.supplier (supplier_id, name, address_id, poc_name, poc_phone, poc_email, supplier_field_id, payment_terms_id, status, registry_date) VALUES (75, 'משקי הדרום כללי', 1, 'name_1', 'phone_1', 'poc_email_1', 1, 1, 'approved', '2020-12-14');
INSERT INTO public.supplier (supplier_id, name, address_id, poc_name, poc_phone, poc_email, supplier_field_id, payment_terms_id, status, registry_date) VALUES (751, 'משקי הדרום אשראי ורכש', 2, 'name_2', 'phone_2', 'poc_email_2', 2, 2, 'approved', '2020-12-15');
INSERT INTO public.supplier (supplier_id, name, address_id, poc_name, poc_phone, poc_email, supplier_field_id, payment_terms_id, status, registry_date) VALUES (7112, 'מע"מ  חן מעבר', 3, 'name_3', 'phone_3', 'poc_email_3', 3, 3, 'approved', '2020-12-16');
INSERT INTO public.supplier (supplier_id, name, address_id, poc_name, poc_phone, poc_email, supplier_field_id, payment_terms_id, status, registry_date) VALUES (7608, 'מ תקמ בטוח חקלאי', 4, 'name_4', 'phone_4', 'poc_email_4', 4, 4, 'approved', '2020-12-17');
INSERT INTO public.supplier (supplier_id, name, address_id, poc_name, poc_phone, poc_email, supplier_field_id, payment_terms_id, status, registry_date) VALUES (7609, 'מ.תקם בטוח - דחויים', 5, 'name_5', 'phone_5', 'poc_email_5', 5, 1, 'pending', '2020-12-18');
INSERT INTO public.supplier (supplier_id, name, address_id, poc_name, poc_phone, poc_email, supplier_field_id, payment_terms_id, status, registry_date) VALUES (70157, 'חו"ז כרטיסי אשראי חוות נען/זולה', 6, 'name_6', 'phone_6', 'poc_email_6', 1, 2, 'pending', '2020-12-19');
INSERT INTO public.supplier (supplier_id, name, address_id, poc_name, poc_phone, poc_email, supplier_field_id, payment_terms_id, status, registry_date) VALUES (70158, 'חו"ז כרטיסי אשראי מרכול', 7, 'name_7', 'phone_7', 'poc_email_7', 2, 3, 'pending', '2020-12-20');
INSERT INTO public.supplier (supplier_id, name, address_id, poc_name, poc_phone, poc_email, supplier_field_id, payment_terms_id, status, registry_date) VALUES (70159, 'חו"ז כרטיסי אשראי  פאב תק"מ 11', 8, 'name_8', 'phone_8', 'poc_email_8', 3, 4, 'rejected', '2020-12-21');
INSERT INTO public.supplier (supplier_id, name, address_id, poc_name, poc_phone, poc_email, supplier_field_id, payment_terms_id, status, registry_date) VALUES (70186, 'הפרשה לחומ"ס כללי', 9, 'name_9', 'phone_9', 'poc_email_9', 4, 1, 'deleted', '2020-12-22');
INSERT INTO public.supplier (supplier_id, name, address_id, poc_name, poc_phone, poc_email, supplier_field_id, payment_terms_id, status, registry_date) VALUES (70815, 'נתא"מ כרטיס קשר מעבר', 10, 'name_10', 'phone_10', 'poc_email_10', 5, 2, 'deleted', '2020-12-23');
INSERT INTO public.supplier (supplier_id, name, address_id, poc_name, poc_phone, poc_email, supplier_field_id, payment_terms_id, status, registry_date) VALUES (70820, 'כרטיס מעבר מועצה (וועד מקומי)', 11, 'name_11', 'phone_11', 'poc_email_11', 1, 3, 'approved', '2020-12-24');
INSERT INTO public.supplier (supplier_id, name, address_id, poc_name, poc_phone, poc_email, supplier_field_id, payment_terms_id, status, registry_date) VALUES (76091, 'מ.תקם בטוח - דחויים 2023', 12, 'name_12', 'phone_12', 'poc_email_12', 2, 4, 'approved', '2020-12-25');
INSERT INTO public.supplier (supplier_id, name, address_id, poc_name, poc_phone, poc_email, supplier_field_id, payment_terms_id, status, registry_date) VALUES (701555, 'חשמל נען בע"מ', 13, 'name_13', 'phone_13', 'poc_email_13', 3, 1, 'approved', '2020-12-26');
INSERT INTO public.supplier (supplier_id, name, address_id, poc_name, poc_phone, poc_email, supplier_field_id, payment_terms_id, status, registry_date) VALUES (708801, 'נען-דן ג`יין השקייה בע"מ - ספק מפעל 918', 14, 'name_14', 'phone_14', 'poc_email_14', 4, 2, 'approved', '2020-12-27');
INSERT INTO public.supplier (supplier_id, name, address_id, poc_name, poc_phone, poc_email, supplier_field_id, payment_terms_id, status, registry_date) VALUES (7010125, 'אדיב חולצות מודפסות בע"מ', 15, 'name_15', 'phone_15', 'poc_email_15', 5, 3, 'approved', '2020-12-28');
INSERT INTO public.supplier (supplier_id, name, address_id, poc_name, poc_phone, poc_email, supplier_field_id, payment_terms_id, status, registry_date) VALUES (7010206, 'קובי בלין', 16, 'name_16', 'phone_16', 'poc_email_16', 1, 4, 'approved', '2020-12-29');
INSERT INTO public.supplier (supplier_id, name, address_id, poc_name, poc_phone, poc_email, supplier_field_id, payment_terms_id, status, registry_date) VALUES (7010401, 'דגנית עין בר', 17, 'name_17', 'phone_17', 'poc_email_17', 2, 1, 'pending', '2020-12-30');
INSERT INTO public.supplier (supplier_id, name, address_id, poc_name, poc_phone, poc_email, supplier_field_id, payment_terms_id, status, registry_date) VALUES (7010506, 'הילתי (ישראל) בע"מ', 18, 'name_18', 'phone_18', 'poc_email_18', 3, 2, 'approved', '2020-12-31');
INSERT INTO public.supplier (supplier_id, name, address_id, poc_name, poc_phone, poc_email, supplier_field_id, payment_terms_id, status, registry_date) VALUES (7011003, 'יפת אביזרי גז בע"מ', 19, 'name_19', 'phone_19', 'poc_email_19', 4, 3, 'approved', '2021-01-01');
INSERT INTO public.supplier (supplier_id, name, address_id, poc_name, poc_phone, poc_email, supplier_field_id, payment_terms_id, status, registry_date) VALUES (7011139, 'כל מתכת מדן בע"מ', 20, 'name_20', 'phone_20', 'poc_email_20', 5, 4, 'approved', '2021-01-02');
INSERT INTO public.supplier (supplier_id, name, address_id, poc_name, poc_phone, poc_email, supplier_field_id, payment_terms_id, status, registry_date) VALUES (70101035, 'אורנית צעצועים בע"מ', 1, 'name_21', 'phone_21', 'poc_email_21', 1, 1, 'approved', '2021-01-03');
INSERT INTO public.supplier (supplier_id, name, address_id, poc_name, poc_phone, poc_email, supplier_field_id, payment_terms_id, status, registry_date) VALUES (70101058, 'אשל ב.מ. חמרי בנין (1999) בע"מ', 2, 'name_22', 'phone_22', 'poc_email_22', 2, 2, 'pending', '2021-01-04');
INSERT INTO public.supplier (supplier_id, name, address_id, poc_name, poc_phone, poc_email, supplier_field_id, payment_terms_id, status, registry_date) VALUES (70101063, 'אורתוליין בע"מ מעבדה אורטודנטית', 3, 'name_23', 'phone_23', 'poc_email_23', 3, 3, 'pending', '2021-01-05');
INSERT INTO public.supplier (supplier_id, name, address_id, poc_name, poc_phone, poc_email, supplier_field_id, payment_terms_id, status, registry_date) VALUES (70101079, 'איתן ספקים לבתי מרקחת בע"מ', 4, 'name_24', 'phone_24', 'poc_email_24', 4, 4, 'pending', '2021-01-06');
INSERT INTO public.supplier (supplier_id, name, address_id, poc_name, poc_phone, poc_email, supplier_field_id, payment_terms_id, status, registry_date) VALUES (70101113, 'א.ב.שווק אברהם', 5, 'name_25', 'phone_25', 'poc_email_25', 5, 1, 'rejected', '2021-01-07');
INSERT INTO public.supplier (supplier_id, name, address_id, poc_name, poc_phone, poc_email, supplier_field_id, payment_terms_id, status, registry_date) VALUES (70101114, 'ארטל שיווק ציוד וריהוט משרדי בע"מ', 6, 'name_26', 'phone_26', 'poc_email_26', 1, 2, 'deleted', '2021-01-08');
INSERT INTO public.supplier (supplier_id, name, address_id, poc_name, poc_phone, poc_email, supplier_field_id, payment_terms_id, status, registry_date) VALUES (70101126, 'ארכה בע"מ', 7, 'name_27', 'phone_27', 'poc_email_27', 2, 3, 'deleted', '2021-01-09');
INSERT INTO public.supplier (supplier_id, name, address_id, poc_name, poc_phone, poc_email, supplier_field_id, payment_terms_id, status, registry_date) VALUES (70101176, 'אקו"ם בע"מ', 8, 'name_28', 'phone_28', 'poc_email_28', 3, 4, 'approved', '2021-01-10');
INSERT INTO public.supplier (supplier_id, name, address_id, poc_name, poc_phone, poc_email, supplier_field_id, payment_terms_id, status, registry_date) VALUES (70101249, 'אפקון התקנות ושרותים בע"מ', 9, 'name_29', 'phone_29', 'poc_email_29', 4, 1, 'approved', '2021-01-11');
INSERT INTO public.supplier (supplier_id, name, address_id, poc_name, poc_phone, poc_email, supplier_field_id, payment_terms_id, status, registry_date) VALUES (999003, 'ספק בדיקה', 1, 'איש קשר בדיקה', '999999', 'gmail@gmail.com', 1, 1, 'deleted', '2025-08-23');
INSERT INTO public.supplier (supplier_id, name, address_id, poc_name, poc_phone, poc_email, supplier_field_id, payment_terms_id, status, registry_date) VALUES (70101254, 'Test Supplier pending', 1, 'Test Contact', '050-0000000', 'testpending@test.com', 1, 1, 'pending', '2025-10-26');


--
-- Data for Name: supplier_field; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.supplier_field (supplier_field_id, field, tags) VALUES (1, 'transit', '{car,bus,travel}');
INSERT INTO public.supplier_field (supplier_field_id, field, tags) VALUES (2, 'catering', '{food,drinks,beer}');
INSERT INTO public.supplier_field (supplier_field_id, field, tags) VALUES (3, 'construction', '{house,sand,tracktor}');
INSERT INTO public.supplier_field (supplier_field_id, field, tags) VALUES (4, 'gifts', '{gifts,bsllond,butterfly}');
INSERT INTO public.supplier_field (supplier_field_id, field, tags) VALUES (5, 'attractions', '{fun,games,ball,bowling}');
INSERT INTO public.supplier_field (supplier_field_id, field, tags) VALUES (6, 'כיף שיגועים', NULL);


--
-- Data for Name: supplier_requests; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.supplier_requests (request_id, requested_by_user_id, branch_id, supplier_name, poc_name, poc_email, poc_phone, status, created_at, supplier_field_id, new_supplier_field, requested_supplier_id) VALUES (1, 31, 15401, 'רייצ''ל בישולים', 'רובין', 'robin@metuka.com', '0909090909', 'approved', '2025-10-12', NULL, NULL, NULL);
INSERT INTO public.supplier_requests (request_id, requested_by_user_id, branch_id, supplier_name, poc_name, poc_email, poc_phone, status, created_at, supplier_field_id, new_supplier_field, requested_supplier_id) VALUES (2, 31, 15608, 'רייצ''ל הפתעות ושיגועים', '', '', '9999990009', 'approved', '2025-10-24', NULL, 'כיף שיגועים', NULL);
INSERT INTO public.supplier_requests (request_id, requested_by_user_id, branch_id, supplier_name, poc_name, poc_email, poc_phone, status, created_at, supplier_field_id, new_supplier_field, requested_supplier_id) VALUES (3, 31, 15608, 'רייצ''ל משימות בע"מ', '', '', '', 'approved', '2025-10-24', 6, NULL, NULL);
INSERT INTO public.supplier_requests (request_id, requested_by_user_id, branch_id, supplier_name, poc_name, poc_email, poc_phone, status, created_at, supplier_field_id, new_supplier_field, requested_supplier_id) VALUES (4, 31, 15608, 'רייצ''ל משימות בע"מ', '', '', '', 'approved', '2025-10-24', 6, NULL, NULL);
INSERT INTO public.supplier_requests (request_id, requested_by_user_id, branch_id, supplier_name, poc_name, poc_email, poc_phone, status, created_at, supplier_field_id, new_supplier_field, requested_supplier_id) VALUES (5, 31, 15608, 'רייצ''ל משימות בע"מ', '', '', '', 'approved', '2025-10-24', 6, NULL, NULL);
INSERT INTO public.supplier_requests (request_id, requested_by_user_id, branch_id, supplier_name, poc_name, poc_email, poc_phone, status, created_at, supplier_field_id, new_supplier_field, requested_supplier_id) VALUES (6, 31, 15608, 'רייצ''ל משימות בע"מ', '', '', '', 'approved', '2025-10-24', 6, NULL, NULL);
INSERT INTO public.supplier_requests (request_id, requested_by_user_id, branch_id, supplier_name, poc_name, poc_email, poc_phone, status, created_at, supplier_field_id, new_supplier_field, requested_supplier_id) VALUES (7, 31, 15608, 'רייצ''ל משימות בע"מ', '', '', '', 'pending', '2025-10-24', 6, NULL, 999001);


--
-- Data for Name: transaction; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.transaction (transaction_id, value, due_date, actual_date, status, alert_id, description) VALUES (2, 8289.77, '2023-03-14', '2023-03-15', 'paid', NULL, NULL);
INSERT INTO public.transaction (transaction_id, value, due_date, actual_date, status, alert_id, description) VALUES (3, 5641.29, '2023-04-10', '2023-04-19', 'paid', NULL, NULL);
INSERT INTO public.transaction (transaction_id, value, due_date, actual_date, status, alert_id, description) VALUES (5, 344.33, '2023-06-03', '2023-06-01', 'paid', NULL, NULL);
INSERT INTO public.transaction (transaction_id, value, due_date, actual_date, status, alert_id, description) VALUES (6, 2304.15, '2023-06-30', '2023-08-02', 'paid', NULL, NULL);
INSERT INTO public.transaction (transaction_id, value, due_date, actual_date, status, alert_id, description) VALUES (7, 4952.63, '2023-07-27', NULL, 'frozen', NULL, NULL);
INSERT INTO public.transaction (transaction_id, value, due_date, actual_date, status, alert_id, description) VALUES (8, 7601.11, '2023-08-23', '2023-02-08', 'paid', NULL, NULL);
INSERT INTO public.transaction (transaction_id, value, due_date, actual_date, status, alert_id, description) VALUES (10, 12898.07, '2023-10-16', '2023-04-19', 'paid', NULL, NULL);
INSERT INTO public.transaction (transaction_id, value, due_date, actual_date, status, alert_id, description) VALUES (11, 15546.55, '2023-11-12', '2023-02-08', 'paid', NULL, NULL);
INSERT INTO public.transaction (transaction_id, value, due_date, actual_date, status, alert_id, description) VALUES (12, 18195.03, '2023-12-09', '2023-03-15', 'paid', NULL, NULL);
INSERT INTO public.transaction (transaction_id, value, due_date, actual_date, status, alert_id, description) VALUES (13, 20843.51, '2024-01-05', '2023-04-19', 'paid', NULL, NULL);
INSERT INTO public.transaction (transaction_id, value, due_date, actual_date, status, alert_id, description) VALUES (15, 26140.47, '2024-02-28', '2023-06-01', 'paid', NULL, NULL);
INSERT INTO public.transaction (transaction_id, value, due_date, actual_date, status, alert_id, description) VALUES (16, 28788.95, '2024-03-26', '2023-08-02', 'paid', NULL, NULL);
INSERT INTO public.transaction (transaction_id, value, due_date, actual_date, status, alert_id, description) VALUES (17, 31437.43, '2024-04-22', NULL, 'frozen', NULL, NULL);
INSERT INTO public.transaction (transaction_id, value, due_date, actual_date, status, alert_id, description) VALUES (18, 34085.91, '2024-05-19', '2023-02-08', 'paid', NULL, NULL);
INSERT INTO public.transaction (transaction_id, value, due_date, actual_date, status, alert_id, description) VALUES (20, 39382.87, '2024-07-12', '2023-04-19', 'paid', NULL, NULL);
INSERT INTO public.transaction (transaction_id, value, due_date, actual_date, status, alert_id, description) VALUES (22, 15000.00, '2024-08-10', NULL, 'paid', NULL, NULL);
INSERT INTO public.transaction (transaction_id, value, due_date, actual_date, status, alert_id, description) VALUES (44, -3800.00, '2025-11-20', NULL, 'open', NULL, NULL);
INSERT INTO public.transaction (transaction_id, value, due_date, actual_date, status, alert_id, description) VALUES (4, 2992.81, '2023-05-07', NULL, 'open', 7, NULL);
INSERT INTO public.transaction (transaction_id, value, due_date, actual_date, status, alert_id, description) VALUES (9, 10249.59, '2023-09-19', NULL, 'open', 8, NULL);
INSERT INTO public.transaction (transaction_id, value, due_date, actual_date, status, alert_id, description) VALUES (14, 23491.99, '2024-02-01', NULL, 'open', 9, NULL);
INSERT INTO public.transaction (transaction_id, value, due_date, actual_date, status, alert_id, description) VALUES (19, 36734.39, '2024-06-15', NULL, 'open', 10, NULL);
INSERT INTO public.transaction (transaction_id, value, due_date, actual_date, status, alert_id, description) VALUES (36, -7500.00, '2025-09-21', NULL, 'open', 11, NULL);
INSERT INTO public.transaction (transaction_id, value, due_date, actual_date, status, alert_id, description) VALUES (34, -5000.00, '2025-10-11', NULL, 'open', 12, NULL);
INSERT INTO public.transaction (transaction_id, value, due_date, actual_date, status, alert_id, description) VALUES (37, -2100.00, '2025-10-23', NULL, 'open', 14, NULL);
INSERT INTO public.transaction (transaction_id, value, due_date, actual_date, status, alert_id, description) VALUES (38, -4500.00, '2025-10-26', NULL, 'open', 15, NULL);
INSERT INTO public.transaction (transaction_id, value, due_date, actual_date, status, alert_id, description) VALUES (39, -2800.00, '2025-10-26', NULL, 'open', 16, NULL);
INSERT INTO public.transaction (transaction_id, value, due_date, actual_date, status, alert_id, description) VALUES (35, -3200.00, '2025-10-18', '2025-10-26', 'paid', 13, NULL);
INSERT INTO public.transaction (transaction_id, value, due_date, actual_date, status, alert_id, description) VALUES (1, 10938.25, '2023-02-15', '2025-10-26', 'paid', NULL, NULL);
INSERT INTO public.transaction (transaction_id, value, due_date, actual_date, status, alert_id, description) VALUES (45, 10000.50, '2025-12-01', NULL, 'open', NULL, NULL);
INSERT INTO public.transaction (transaction_id, value, due_date, actual_date, status, alert_id, description) VALUES (40, -3600.00, '2025-10-28', NULL, 'open', 17, NULL);
INSERT INTO public.transaction (transaction_id, value, due_date, actual_date, status, alert_id, description) VALUES (41, -4200.00, '2025-10-31', NULL, 'open', 18, NULL);
INSERT INTO public.transaction (transaction_id, value, due_date, actual_date, status, alert_id, description) VALUES (42, -1900.00, '2025-11-02', NULL, 'open', 19, NULL);
INSERT INTO public.transaction (transaction_id, value, due_date, actual_date, status, alert_id, description) VALUES (43, -5500.00, '2025-11-10', NULL, 'open', 20, NULL);
INSERT INTO public.transaction (transaction_id, value, due_date, actual_date, status, alert_id, description) VALUES (47, 10000.50, '2025-12-08', NULL, 'open', NULL, NULL);
INSERT INTO public.transaction (transaction_id, value, due_date, actual_date, status, alert_id, description) VALUES (48, 10000.50, '2025-12-08', NULL, 'open', NULL, NULL);
INSERT INTO public.transaction (transaction_id, value, due_date, actual_date, status, alert_id, description) VALUES (49, 10000.50, '2025-12-08', NULL, 'open', NULL, NULL);
INSERT INTO public.transaction (transaction_id, value, due_date, actual_date, status, alert_id, description) VALUES (51, 5000.00, '2025-12-08', NULL, 'open', NULL, NULL);
INSERT INTO public.transaction (transaction_id, value, due_date, actual_date, status, alert_id, description) VALUES (52, 123456.00, '2026-02-06', NULL, 'open', NULL, NULL);
INSERT INTO public.transaction (transaction_id, value, due_date, actual_date, status, alert_id, description) VALUES (50, 122228.00, '2025-11-08', NULL, 'open', 21, NULL);
INSERT INTO public.transaction (transaction_id, value, due_date, actual_date, status, alert_id, description) VALUES (53, 321.00, '2026-01-09', NULL, 'open', NULL, NULL);
INSERT INTO public.transaction (transaction_id, value, due_date, actual_date, status, alert_id, description) VALUES (57, 15000.00, '2025-11-12', NULL, 'pending_approval', NULL, 'עסקה בדיקה DB');


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."user" (user_id, permissions_id, first_name, surname, email, phone_no, password, status, reset_token, reset_token_expires) VALUES (2, 2, 'first_name_2', 'surname_2', 'email_gmail_2', 'phone_2', 'password_2', 'active', NULL, NULL);
INSERT INTO public."user" (user_id, permissions_id, first_name, surname, email, phone_no, password, status, reset_token, reset_token_expires) VALUES (3, 3, 'first_name_3', 'surname_3', 'email_gmail_3', 'phone_3', 'password_3', 'active', NULL, NULL);
INSERT INTO public."user" (user_id, permissions_id, first_name, surname, email, phone_no, password, status, reset_token, reset_token_expires) VALUES (4, 3, 'first_name_4', 'surname_4', 'email_gmail_4', 'phone_4', 'password_4', 'active', NULL, NULL);
INSERT INTO public."user" (user_id, permissions_id, first_name, surname, email, phone_no, password, status, reset_token, reset_token_expires) VALUES (5, 5, 'first_name_5', 'surname_5', 'email_gmail_5', 'phone_5', 'password_5', 'active', NULL, NULL);
INSERT INTO public."user" (user_id, permissions_id, first_name, surname, email, phone_no, password, status, reset_token, reset_token_expires) VALUES (6, 4, 'first_name_6', 'surname_6', 'email_gmail_6', 'phone_6', 'password_6', 'active', NULL, NULL);
INSERT INTO public."user" (user_id, permissions_id, first_name, surname, email, phone_no, password, status, reset_token, reset_token_expires) VALUES (7, 4, 'first_name_7', 'surname_7', 'email_gmail_7', 'phone_7', 'password_7', 'active', NULL, NULL);
INSERT INTO public."user" (user_id, permissions_id, first_name, surname, email, phone_no, password, status, reset_token, reset_token_expires) VALUES (8, 4, 'first_name_8', 'surname_8', 'email_gmail_8', 'phone_8', 'password_8', 'active', NULL, NULL);
INSERT INTO public."user" (user_id, permissions_id, first_name, surname, email, phone_no, password, status, reset_token, reset_token_expires) VALUES (10, 4, 'first_name_10', 'surname_10', 'email_gmail_10', 'phone_10', 'password_10', 'active', NULL, NULL);
INSERT INTO public."user" (user_id, permissions_id, first_name, surname, email, phone_no, password, status, reset_token, reset_token_expires) VALUES (11, 4, 'first_name_11', 'surname_11', 'email_gmail_11', 'phone_11', 'password_11', 'active', NULL, NULL);
INSERT INTO public."user" (user_id, permissions_id, first_name, surname, email, phone_no, password, status, reset_token, reset_token_expires) VALUES (12, 4, 'first_name_12', 'surname_12', 'email_gmail_12', 'phone_12', 'password_12', 'active', NULL, NULL);
INSERT INTO public."user" (user_id, permissions_id, first_name, surname, email, phone_no, password, status, reset_token, reset_token_expires) VALUES (13, 4, 'first_name_13', 'surname_13', 'email_gmail_13', 'phone_13', 'password_13', 'active', NULL, NULL);
INSERT INTO public."user" (user_id, permissions_id, first_name, surname, email, phone_no, password, status, reset_token, reset_token_expires) VALUES (14, 4, 'first_name_14', 'surname_14', 'email_gmail_14', 'phone_14', 'password_14', 'active', NULL, NULL);
INSERT INTO public."user" (user_id, permissions_id, first_name, surname, email, phone_no, password, status, reset_token, reset_token_expires) VALUES (15, 4, 'first_name_15', 'surname_15', 'email_gmail_15', 'phone_15', 'password_15', 'active', NULL, NULL);
INSERT INTO public."user" (user_id, permissions_id, first_name, surname, email, phone_no, password, status, reset_token, reset_token_expires) VALUES (16, 4, 'first_name_16', 'surname_16', 'email_gmail_16', 'phone_16', 'password_16', 'active', NULL, NULL);
INSERT INTO public."user" (user_id, permissions_id, first_name, surname, email, phone_no, password, status, reset_token, reset_token_expires) VALUES (17, 4, 'first_name_17', 'surname_17', 'email_gmail_17', 'phone_17', 'password_17', 'active', NULL, NULL);
INSERT INTO public."user" (user_id, permissions_id, first_name, surname, email, phone_no, password, status, reset_token, reset_token_expires) VALUES (18, 4, 'first_name_18', 'surname_18', 'email_gmail_18', 'phone_18', 'password_18', 'active', NULL, NULL);
INSERT INTO public."user" (user_id, permissions_id, first_name, surname, email, phone_no, password, status, reset_token, reset_token_expires) VALUES (19, 4, 'first_name_19', 'surname_19', 'email_gmail_19', 'phone_19', 'password_19', 'active', NULL, NULL);
INSERT INTO public."user" (user_id, permissions_id, first_name, surname, email, phone_no, password, status, reset_token, reset_token_expires) VALUES (20, 4, 'first_name_20', 'surname_20', 'email_gmail_20', 'phone_20', 'password_20', 'active', NULL, NULL);
INSERT INTO public."user" (user_id, permissions_id, first_name, surname, email, phone_no, password, status, reset_token, reset_token_expires) VALUES (21, 4, 'first_name_21', 'surname_21', 'email_gmail_21', 'phone_21', 'password_21', 'active', NULL, NULL);
INSERT INTO public."user" (user_id, permissions_id, first_name, surname, email, phone_no, password, status, reset_token, reset_token_expires) VALUES (22, 4, 'first_name_22', 'surname_22', 'email_gmail_22', 'phone_22', 'password_22', 'active', NULL, NULL);
INSERT INTO public."user" (user_id, permissions_id, first_name, surname, email, phone_no, password, status, reset_token, reset_token_expires) VALUES (23, 4, 'first_name_23', 'surname_23', 'email_gmail_23', 'phone_23', 'password_23', 'active', NULL, NULL);
INSERT INTO public."user" (user_id, permissions_id, first_name, surname, email, phone_no, password, status, reset_token, reset_token_expires) VALUES (24, 4, 'first_name_24', 'surname_24', 'email_gmail_24', 'phone_24', 'password_24', 'active', NULL, NULL);
INSERT INTO public."user" (user_id, permissions_id, first_name, surname, email, phone_no, password, status, reset_token, reset_token_expires) VALUES (25, 4, 'first_name_25', 'surname_25', 'email_gmail_25', 'phone_25', 'password_25', 'active', NULL, NULL);
INSERT INTO public."user" (user_id, permissions_id, first_name, surname, email, phone_no, password, status, reset_token, reset_token_expires) VALUES (26, 4, 'first_name_26', 'surname_26', 'email_gmail_26', 'phone_26', 'password_26', 'active', NULL, NULL);
INSERT INTO public."user" (user_id, permissions_id, first_name, surname, email, phone_no, password, status, reset_token, reset_token_expires) VALUES (27, 4, 'first_name_27', 'surname_27', 'email_gmail_27', 'phone_27', 'password_27', 'active', NULL, NULL);
INSERT INTO public."user" (user_id, permissions_id, first_name, surname, email, phone_no, password, status, reset_token, reset_token_expires) VALUES (9, 4, 'first_name_9', 'surname_9', 'email_gmail_9', 'phone_9', 'password_9', 'inactive', NULL, NULL);
INSERT INTO public."user" (user_id, permissions_id, first_name, surname, email, phone_no, password, status, reset_token, reset_token_expires) VALUES (1, 1, 'first_name_1', 'surname_1', 'email_gmail_1', 'phone_1', 'password_1', 'active', '07ea6c99164a0da358cee7fbc52c62d3556093ef3947dd46ec8b00262f83f464', '2025-10-13 19:47:55.928+03');
INSERT INTO public."user" (user_id, permissions_id, first_name, surname, email, phone_no, password, status, reset_token, reset_token_expires) VALUES (32, 2, 'בודק', 'בדיקות', 'eseiref@gmail.com', '05282582265', '$2b$10$3KlF.4bCkdHX5hie1kARIuNSs68VaH4N4UbcxBaw/2HiS2xZM.XgS', 'active', 'bc21ecec3f5d1347da02671fc7ac9b926a86f8997c3ff4f415bfb84bc04b80db', '2025-10-22 10:46:09.108+03');
INSERT INTO public."user" (user_id, permissions_id, first_name, surname, email, phone_no, password, status, reset_token, reset_token_expires) VALUES (33, 4, 'r', 'moshe@example.com', 'gmail@gmail.com', 'aaaaaa', '$2b$10$VQZmtdP0h8q.CmzoKbjovOWPtm9MS6Xk02y9oqIz49AVLRlMIoBRK', 'active', NULL, NULL);
INSERT INTO public."user" (user_id, permissions_id, first_name, surname, email, phone_no, password, status, reset_token, reset_token_expires) VALUES (31, 4, 'נועם', 'רביב', 'noam@example.com', '052-1133322', '$2b$10$2luP2rMJj2d3gqDM84mLa.JqYpAElzWTvsX8A2QVeBm6AyYV3QFQW', 'active', NULL, NULL);
INSERT INTO public."user" (user_id, permissions_id, first_name, surname, email, phone_no, password, status, reset_token, reset_token_expires) VALUES (35, 3, 'אלה', 'מה קורה לה', 'ella@gmail.com', '09090990', '$2b$10$.175Rqy/HupdMWGhZ1Cxs.w5gl1C9/C9FbnOM/POfTIGxPWPwmAju', 'active', NULL, NULL);
INSERT INTO public."user" (user_id, permissions_id, first_name, surname, email, phone_no, password, status, reset_token, reset_token_expires) VALUES (29, 2, 'משה', 'כהן', 'moshe@gmail.com', '052-1112222', '$2b$10$e5Xj1lR1T3VJL1VZZI4Z9OxpTXjKDD0CPX10ypqqjDfsmi/0spw.u', 'active', NULL, NULL);
INSERT INTO public."user" (user_id, permissions_id, first_name, surname, email, phone_no, password, status, reset_token, reset_token_expires) VALUES (36, 2, 'תום', 'הגזבר', 'tom@example.com', '0521234567', '$2b$10$eDDvwIsJL3t6bv6wjEFHsOD5Ncfn6eVF2/27acYwExdaJUAyypxTG', 'active', NULL, NULL);
INSERT INTO public."user" (user_id, permissions_id, first_name, surname, email, phone_no, password, status, reset_token, reset_token_expires) VALUES (37, 1, 'Admin', 'System', 'admin@naan.com', '050-0000000', '$2b$10$z.sG2ElVdKAGAV21lH.KEuvb5HS4xJbKfftZjr2an0mdp0dbBPz2K', 'active', NULL, NULL);
INSERT INTO public."user" (user_id, permissions_id, first_name, surname, email, phone_no, password, status, reset_token, reset_token_expires) VALUES (39, 3, 'מנהל', 'בדיקות', 'manager@test.com', '0500000000', '$2b$10$30ZRBhpLXSIeIOgOT9i2z.18wdi3e.ztQhOuLQvSrPKQoG6V3TeMS', 'active', NULL, NULL);


--
-- Name: address_address_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.address_address_id_seq', 42, true);


--
-- Name: alert_alert_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.alert_alert_id_seq', 21, true);


--
-- Name: balance_balance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.balance_balance_id_seq', 10, true);


--
-- Name: client_client_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.client_client_id_seq', 32, true);


--
-- Name: client_request_request_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.client_request_request_id_seq', 27, true);


--
-- Name: notifications_notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notifications_notification_id_seq', 65, true);


--
-- Name: payment_req_payment_req_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.payment_req_payment_req_id_seq', 22, true);


--
-- Name: payment_terms_payment_terms_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.payment_terms_payment_terms_id_seq', 4, true);


--
-- Name: permission_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.permission_permissions_id_seq', 5, true);


--
-- Name: review_review_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.review_review_id_seq', 11, true);


--
-- Name: sale_sale_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sale_sale_id_seq', 19, true);


--
-- Name: supplier_field_supplier_field_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.supplier_field_supplier_field_id_seq', 6, true);


--
-- Name: supplier_requests_request_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.supplier_requests_request_id_seq', 7, true);


--
-- Name: supplier_supplier_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.supplier_supplier_id_seq', 70101256, true);


--
-- Name: transaction_transaction_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.transaction_transaction_id_seq', 59, true);


--
-- Name: user_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_user_id_seq', 39, true);


--
-- Name: address address_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.address
    ADD CONSTRAINT address_pkey PRIMARY KEY (address_id);


--
-- Name: alert alert_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alert
    ADD CONSTRAINT alert_pkey PRIMARY KEY (alert_id);


--
-- Name: balance balance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.balance
    ADD CONSTRAINT balance_pkey PRIMARY KEY (balance_id);


--
-- Name: branch branch_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branch
    ADD CONSTRAINT branch_pkey PRIMARY KEY (branch_id);


--
-- Name: client client_client_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client
    ADD CONSTRAINT client_client_number_key UNIQUE (client_number);


--
-- Name: client client_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client
    ADD CONSTRAINT client_pkey PRIMARY KEY (client_id);


--
-- Name: client_request client_request_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_request
    ADD CONSTRAINT client_request_pkey PRIMARY KEY (request_id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (notification_id);


--
-- Name: payment_req payment_req_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_req
    ADD CONSTRAINT payment_req_pkey PRIMARY KEY (payment_req_id);


--
-- Name: payment_terms payment_terms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_terms
    ADD CONSTRAINT payment_terms_pkey PRIMARY KEY (payment_terms_id);


--
-- Name: permission permission_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permission
    ADD CONSTRAINT permission_pkey PRIMARY KEY (permissions_id);


--
-- Name: review review_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review
    ADD CONSTRAINT review_pkey PRIMARY KEY (review_id);


--
-- Name: sale sale_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale
    ADD CONSTRAINT sale_pkey PRIMARY KEY (sale_id);


--
-- Name: supplier_field supplier_field_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier_field
    ADD CONSTRAINT supplier_field_pkey PRIMARY KEY (supplier_field_id);


--
-- Name: supplier supplier_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier
    ADD CONSTRAINT supplier_pkey PRIMARY KEY (supplier_id);


--
-- Name: supplier_requests supplier_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier_requests
    ADD CONSTRAINT supplier_requests_pkey PRIMARY KEY (request_id);


--
-- Name: transaction transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction
    ADD CONSTRAINT transaction_pkey PRIMARY KEY (transaction_id);


--
-- Name: user user_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_email_key UNIQUE (email);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (user_id);


--
-- Name: idx_alert_severity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_alert_severity ON public.alert USING btree (severity);


--
-- Name: idx_alert_transaction_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_alert_transaction_id ON public.alert USING btree (transaction_id);


--
-- Name: idx_client_request_branch_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_client_request_branch_id ON public.client_request USING btree (branch_id);


--
-- Name: idx_client_request_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_client_request_client_id ON public.client_request USING btree (client_id);


--
-- Name: idx_client_request_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_client_request_status ON public.client_request USING btree (status);


--
-- Name: idx_notifications_user_unread; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user_unread ON public.notifications USING btree (user_id, is_read, created_at DESC);


--
-- Name: idx_transaction_alert_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transaction_alert_id ON public.transaction USING btree (alert_id);


--
-- Name: idx_transaction_due_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transaction_due_date ON public.transaction USING btree (due_date);


--
-- Name: idx_transaction_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transaction_status ON public.transaction USING btree (status);


--
-- Name: alert alert_transaction_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alert
    ADD CONSTRAINT alert_transaction_id_foreign FOREIGN KEY (transaction_id) REFERENCES public.transaction(transaction_id);


--
-- Name: branch branch_balance_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branch
    ADD CONSTRAINT branch_balance_id_foreign FOREIGN KEY (balance_id) REFERENCES public.balance(balance_id);


--
-- Name: branch branch_manager_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branch
    ADD CONSTRAINT branch_manager_foreign FOREIGN KEY (manager_id) REFERENCES public."user"(user_id);


--
-- Name: client client_address_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client
    ADD CONSTRAINT client_address_id_foreign FOREIGN KEY (address_id) REFERENCES public.address(address_id);


--
-- Name: client_request client_request_approved_client_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_request
    ADD CONSTRAINT client_request_approved_client_id_foreign FOREIGN KEY (approved_client_id) REFERENCES public.client(client_id);


--
-- Name: client_request client_request_approved_sale_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_request
    ADD CONSTRAINT client_request_approved_sale_id_foreign FOREIGN KEY (approved_sale_id) REFERENCES public.sale(sale_id);


--
-- Name: client_request client_request_branch_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_request
    ADD CONSTRAINT client_request_branch_id_foreign FOREIGN KEY (branch_id) REFERENCES public.branch(branch_id);


--
-- Name: client_request client_request_client_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_request
    ADD CONSTRAINT client_request_client_id_foreign FOREIGN KEY (client_id) REFERENCES public.client(client_id);


--
-- Name: client_request client_request_requested_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_request
    ADD CONSTRAINT client_request_requested_by_user_id_foreign FOREIGN KEY (requested_by_user_id) REFERENCES public."user"(user_id);


--
-- Name: client_request client_request_reviewed_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_request
    ADD CONSTRAINT client_request_reviewed_by_user_id_foreign FOREIGN KEY (reviewed_by_user_id) REFERENCES public."user"(user_id);


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(user_id);


--
-- Name: payment_req payment_req_branch_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_req
    ADD CONSTRAINT payment_req_branch_id_foreign FOREIGN KEY (branch_id) REFERENCES public.branch(branch_id);


--
-- Name: payment_req payment_req_supplier_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_req
    ADD CONSTRAINT payment_req_supplier_id_foreign FOREIGN KEY (supplier_id) REFERENCES public.supplier(supplier_id);


--
-- Name: payment_req payment_req_transaction_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_req
    ADD CONSTRAINT payment_req_transaction_id_foreign FOREIGN KEY (transaction_id) REFERENCES public.transaction(transaction_id);


--
-- Name: review review_supplier_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review
    ADD CONSTRAINT review_supplier_id_foreign FOREIGN KEY (supplier_id) REFERENCES public.supplier(supplier_id);


--
-- Name: review review_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review
    ADD CONSTRAINT review_user_id_foreign FOREIGN KEY (user_id) REFERENCES public."user"(user_id);


--
-- Name: sale sale_branch_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale
    ADD CONSTRAINT sale_branch_id_foreign FOREIGN KEY (branch_id) REFERENCES public.branch(branch_id);


--
-- Name: sale sale_client_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale
    ADD CONSTRAINT sale_client_id_foreign FOREIGN KEY (client_id) REFERENCES public.client(client_id);


--
-- Name: sale sale_transaction_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale
    ADD CONSTRAINT sale_transaction_id_foreign FOREIGN KEY (transaction_id) REFERENCES public.transaction(transaction_id);


--
-- Name: supplier supplier_address_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier
    ADD CONSTRAINT supplier_address_id_foreign FOREIGN KEY (address_id) REFERENCES public.address(address_id);


--
-- Name: supplier supplier_field_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier
    ADD CONSTRAINT supplier_field_id_foreign FOREIGN KEY (supplier_field_id) REFERENCES public.supplier_field(supplier_field_id);


--
-- Name: supplier supplier_payment_terms_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier
    ADD CONSTRAINT supplier_payment_terms_id_foreign FOREIGN KEY (payment_terms_id) REFERENCES public.payment_terms(payment_terms_id);


--
-- Name: supplier_requests supplier_requests_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier_requests
    ADD CONSTRAINT supplier_requests_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branch(branch_id);


--
-- Name: supplier_requests supplier_requests_requested_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier_requests
    ADD CONSTRAINT supplier_requests_requested_by_user_id_fkey FOREIGN KEY (requested_by_user_id) REFERENCES public."user"(user_id);


--
-- Name: supplier_requests supplier_requests_supplier_field_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier_requests
    ADD CONSTRAINT supplier_requests_supplier_field_id_fkey FOREIGN KEY (supplier_field_id) REFERENCES public.supplier_field(supplier_field_id);


--
-- Name: transaction transaction_alert_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction
    ADD CONSTRAINT transaction_alert_id_foreign FOREIGN KEY (alert_id) REFERENCES public.alert(alert_id);


--
-- Name: user user_permissions_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_permissions_id_foreign FOREIGN KEY (permissions_id) REFERENCES public.permission(permissions_id);


--
-- PostgreSQL database dump complete
--

\unrestrict 2enrh2EZysdh5QqLYLeGlIJof6L15FZ34a0VPtPRYKSDSQSRDSRaHItdaPwtZDt

