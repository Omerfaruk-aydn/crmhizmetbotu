-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. BUSINESSES
create table if not exists public.businesses (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null unique,
    sector text,
    phone text,
    whatsapp_number text,
    instagram_handle text,
    website text,
    address text,
    location_url text,
    timezone text not null default 'Europe/Istanbul',
    brand_tone text not null default 'Professional',
    primary_color text not null default '#4f46e5',
    status text not null default 'active',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz
);

-- 2. PROFILES (extends Supabase Auth Users)
create table if not exists public.profiles (
    id uuid primary key references auth.users on delete cascade,
    full_name text,
    email text not null,
    avatar_url text,
    created_at timestamptz not null default now()
);

-- 3. BUSINESS_USERS (Role Based Access Control)
create table if not exists public.business_users (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null references public.businesses(id) on delete cascade,
    user_id uuid not null references public.profiles(id) on delete cascade,
    role text not null check (role in ('super_admin', 'business_owner', 'manager', 'agent', 'viewer')),
    created_at timestamptz not null default now(),
    unique(business_id, user_id)
);

-- 4. CUSTOMERS
create table if not exists public.customers (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null references public.businesses(id) on delete cascade,
    name text,
    phone text,
    email text,
    instagram_id text,
    external_id text,
    source_channel text not null default 'web', -- web, whatsapp, instagram
    status text not null default 'lead', -- lead, contact, customer, inactive
    lead_score integer not null default 0,
    language text not null default 'tr',
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz
);

-- 5. CONVERSATIONS
create table if not exists public.conversations (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null references public.businesses(id) on delete cascade,
    customer_id uuid not null references public.customers(id) on delete cascade,
    channel text not null default 'web',
    status text not null default 'active', -- active, handoff, closed
    ai_enabled boolean not null default true,
    assigned_to uuid references public.profiles(id) on delete set null,
    last_message_at timestamptz not null default now(),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 6. MESSAGES
create table if not exists public.messages (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null references public.businesses(id) on delete cascade,
    conversation_id uuid not null references public.conversations(id) on delete cascade,
    customer_id uuid not null references public.customers(id) on delete cascade,
    sender_type text not null check (sender_type in ('customer', 'ai', 'agent', 'system')),
    sender_id uuid references public.profiles(id) on delete set null,
    content text not null,
    intent text,
    ai_confidence numeric,
    metadata jsonb default '{}'::jsonb,
    created_at timestamptz not null default now()
);

-- 7. KNOWLEDGE BASE ITEMS
create table if not exists public.knowledge_base_items (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null references public.businesses(id) on delete cascade,
    title text not null,
    content text not null,
    category text not null default 'General',
    tags text[] default '{}'::text[],
    priority integer not null default 0,
    is_active boolean not null default true,
    source_type text not null default 'manual',
    created_by uuid references public.profiles(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz
);

-- 8. SERVICES
create table if not exists public.services (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null references public.businesses(id) on delete cascade,
    name text not null,
    description text,
    category text,
    duration_minutes integer,
    is_bookable boolean not null default true,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 9. SERVICE PRICES
create table if not exists public.service_prices (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null references public.businesses(id) on delete cascade,
    service_id uuid not null references public.services(id) on delete cascade,
    price numeric,
    price_min numeric,
    price_max numeric,
    currency text not null default 'TRY',
    display_price boolean not null default true,
    note text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 10. APPOINTMENTS
create table if not exists public.appointments (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null references public.businesses(id) on delete cascade,
    customer_id uuid not null references public.customers(id) on delete cascade,
    conversation_id uuid references public.conversations(id) on delete set null,
    service_id uuid references public.services(id) on delete set null,
    requested_date date,
    requested_time time,
    customer_name text,
    customer_phone text,
    note text,
    source_channel text not null default 'web',
    status text not null default 'new', -- new, pending_confirmation, confirmed, cancelled, completed
    assigned_to uuid references public.profiles(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 11. LEAD EVENTS
create table if not exists public.lead_events (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null references public.businesses(id) on delete cascade,
    customer_id uuid not null references public.customers(id) on delete cascade,
    conversation_id uuid references public.conversations(id) on delete set null,
    event_type text not null, -- price_question, phone_provided, etc
    score_delta integer not null,
    description text,
    created_at timestamptz not null default now()
);

-- 12. HANDOFFS
create table if not exists public.handoffs (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null references public.businesses(id) on delete cascade,
    conversation_id uuid not null references public.conversations(id) on delete cascade,
    customer_id uuid not null references public.customers(id) on delete cascade,
    reason text,
    priority text not null default 'medium', -- low, medium, high, urgent
    status text not null default 'open', -- open, assigned, resolved, closed
    assigned_to uuid references public.profiles(id) on delete set null,
    created_at timestamptz not null default now(),
    resolved_at timestamptz
);

-- 13. TAGS
create table if not exists public.tags (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null references public.businesses(id) on delete cascade,
    name text not null,
    color text not null default '#6b7280',
    created_at timestamptz not null default now(),
    unique(business_id, name)
);

-- 14. CUSTOMER TAGS
create table if not exists public.customer_tags (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null references public.businesses(id) on delete cascade,
    customer_id uuid not null references public.customers(id) on delete cascade,
    tag_id uuid not null references public.tags(id) on delete cascade,
    created_at timestamptz not null default now(),
    unique(customer_id, tag_id)
);

-- 15. AI LOGS
create table if not exists public.ai_logs (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null references public.businesses(id) on delete cascade,
    conversation_id uuid not null references public.conversations(id) on delete cascade,
    message_id uuid references public.messages(id) on delete set null,
    provider text not null,
    model text not null,
    prompt_tokens integer,
    completion_tokens integer,
    intent text,
    confidence numeric,
    risk_level text,
    raw_response jsonb,
    error text,
    created_at timestamptz not null default now()
);

-- 16. AI FEEDBACK
create table if not exists public.ai_feedback (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null references public.businesses(id) on delete cascade,
    message_id uuid not null references public.messages(id) on delete cascade,
    feedback_type text not null, -- thumbs_up, thumbs_down
    comment text,
    created_by uuid references public.profiles(id) on delete set null,
    created_at timestamptz not null default now()
);

-- 17. INTEGRATIONS
create table if not exists public.integrations (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null references public.businesses(id) on delete cascade,
    provider text not null, -- whatsapp, instagram, calendar
    status text not null default 'disconnected', -- active, disconnected, error
    config jsonb default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique(business_id, provider)
);

-- 18. NOTIFICATIONS
create table if not exists public.notifications (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null references public.businesses(id) on delete cascade,
    user_id uuid references public.profiles(id) on delete cascade,
    type text not null, -- handoff_required, hot_lead, appointment_requested, system
    title text not null,
    body text not null,
    status text not null default 'unread', -- unread, read
    metadata jsonb default '{}'::jsonb,
    created_at timestamptz not null default now(),
    read_at timestamptz
);

-- 19. AUDIT LOGS
create table if not exists public.audit_logs (
    id uuid primary key default gen_random_uuid(),
    business_id uuid references public.businesses(id) on delete set null,
    user_id uuid references public.profiles(id) on delete set null,
    action text not null,
    entity_type text not null,
    entity_id uuid,
    metadata jsonb default '{}'::jsonb,
    created_at timestamptz not null default now()
);

-- 20. USAGE LOGS
create table if not exists public.usage_logs (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null references public.businesses(id) on delete cascade,
    usage_type text not null, -- ai_message, handoff_agent, integration_call
    quantity integer not null default 1,
    metadata jsonb default '{}'::jsonb,
    created_at timestamptz not null default now()
);

-- 21. SUBSCRIPTIONS
create table if not exists public.subscriptions (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null references public.businesses(id) on delete cascade,
    plan text not null default 'starter', -- starter, professional, enterprise
    status text not null default 'active', -- active, trialing, past_due, canceled
    current_period_start timestamptz not null default now(),
    current_period_end timestamptz not null default (now() + interval '30 days'),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ==================================================
-- INDEXES
-- ==================================================
create index if not exists idx_businesses_slug on public.businesses(slug);
create index if not exists idx_business_users_user on public.business_users(user_id);
create index if not exists idx_customers_business_id on public.customers(business_id);
create index if not exists idx_customers_phone on public.customers(business_id, phone);
create index if not exists idx_customers_lead_score on public.customers(business_id, lead_score);
create index if not exists idx_conversations_business_id_last_message on public.conversations(business_id, last_message_at desc);
create index if not exists idx_messages_conversation_id_created on public.messages(conversation_id, created_at asc);
create index if not exists idx_appointments_business_status on public.appointments(business_id, status);
create index if not exists idx_handoffs_business_status on public.handoffs(business_id, status);
create index if not exists idx_kb_business_category on public.knowledge_base_items(business_id, category);
create index if not exists idx_audit_logs_business_created on public.audit_logs(business_id, created_at desc);

-- ==================================================
-- UPDATED_AT TRIGGERS
-- ==================================================
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_businesses_updated_at before update on public.businesses
    for each row execute function public.update_updated_at_column();

create trigger update_customers_updated_at before update on public.customers
    for each row execute function public.update_updated_at_column();

create trigger update_conversations_updated_at before update on public.conversations
    for each row execute function public.update_updated_at_column();

create trigger update_kb_items_updated_at before update on public.knowledge_base_items
    for each row execute function public.update_updated_at_column();

create trigger update_services_updated_at before update on public.services
    for each row execute function public.update_updated_at_column();

create trigger update_service_prices_updated_at before update on public.service_prices
    for each row execute function public.update_updated_at_column();

create trigger update_appointments_updated_at before update on public.appointments
    for each row execute function public.update_updated_at_column();

create trigger update_integrations_updated_at before update on public.integrations
    for each row execute function public.update_updated_at_column();

create trigger update_subscriptions_updated_at before update on public.subscriptions
    for each row execute function public.update_updated_at_column();


-- ==================================================
-- AUTH USER REGISTRATION SYNC TRIGGER
-- ==================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, full_name, email, avatar_url)
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
        coalesce(new.email, ''),
        coalesce(new.raw_user_meta_data->>'avatar_url', '')
    );
    return new;
end;
$$ language plpgsql security definer;

-- Note: In a live Supabase environment, you would run:
-- create trigger on_auth_user_created
--   after insert on auth.users
--   for each row execute procedure public.handle_new_user();
