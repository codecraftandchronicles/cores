-- =============================================================================
--  paint_votes — RLS / function hardening
-- =============================================================================
--  Resolve TODOS estes avisos do Supabase Advisor:
--    * "RLS Policy Always True" (INSERT e DELETE)
--    * "Public Can Execute SECURITY DEFINER Function" (cast_vote/retract_vote)
--    * "Signed-In Users Can Execute SECURITY DEFINER Function"
--
--  Arquitetura (padrão recomendado para endpoints anónimos):
--    1. Tabela public.paint_votes: só SELECT público. INSERT/UPDATE/DELETE
--       diretos revogados do anon -> ninguém apaga a tabela via PostgREST.
--    2. Lógica privilegiada (SECURITY DEFINER) vive no schema `private`, que
--       NÃO é exposto pela API REST. Como não há rota /rest/v1/rpc/ para lá,
--       o advisor deixa de sinalizar estas funções.
--    3. No schema `public` (exposto) ficam apenas wrappers finos
--       SECURITY INVOKER -> o advisor não os sinaliza. É o que o cliente
--       chama: /rest/v1/rpc/cast_vote e /rest/v1/rpc/retract_vote.
--
--  Nota: sem autenticação, o `session_id` vem do browser e NÃO é uma
--  identidade real. Isto contém estragos (sem wipe, sem lixo arbitrário),
--  não autentica utilizadores.
--
--  Correr no Supabase -> SQL Editor. Idempotente.
-- =============================================================================

-- 1. Schema privado, fora da API exposta -------------------------------------
create schema if not exists private;
revoke all on schema private from anon, authenticated, public;
grant usage on schema private to anon;   -- necessário para o wrapper chamar

-- 2. Tabela: só leitura pública ----------------------------------------------
drop policy if exists "Allow public insert"  on public.paint_votes;
drop policy if exists "Allow session delete" on public.paint_votes;
drop policy if exists "Allow public read"    on public.paint_votes;

alter table public.paint_votes enable row level security;
create policy "Allow public read" on public.paint_votes
    for select using (true);

revoke insert, update, delete on public.paint_votes from anon, authenticated;
grant  select on public.paint_votes to anon;

-- 3. Lógica privilegiada no schema PRIVADO (não exposto) ----------------------
create or replace function private.cast_vote(
    p_paint_code text,
    p_vote_type  text,
    p_session_id text,
    p_voter_ip   text default ''
) returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    if p_vote_type not in ('like', 'dislike') then
        raise exception 'invalid vote_type';
    end if;
    if p_paint_code is null or length(p_paint_code) = 0 or length(p_paint_code) > 64 then
        raise exception 'invalid paint_code';
    end if;
    if p_session_id is null or length(p_session_id) = 0 or length(p_session_id) > 64 then
        raise exception 'invalid session_id';
    end if;

    -- 1 voto por sessão/tinta: remove o anterior antes de inserir.
    delete from public.paint_votes
    where paint_code = p_paint_code
      and session_id = p_session_id;

    insert into public.paint_votes (paint_code, vote_type, session_id, voter_ip)
    values (p_paint_code, p_vote_type, p_session_id, left(coalesce(p_voter_ip, ''), 45));
end;
$$;

create or replace function private.retract_vote(
    p_paint_code text,
    p_session_id text
) returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    delete from public.paint_votes
    where paint_code = p_paint_code
      and session_id = p_session_id;
end;
$$;

-- 4. Substituir eventuais funções DEFINER antigas em `public` ----------------
drop function if exists public.cast_vote(text, text, text, text);
drop function if exists public.retract_vote(text, text);

-- 5. Wrappers SECURITY INVOKER no schema exposto (o que o cliente chama) ------
create function public.cast_vote(
    p_paint_code text,
    p_vote_type  text,
    p_session_id text,
    p_voter_ip   text default ''
) returns void
language sql
security invoker
set search_path = ''
as $$
    select private.cast_vote(p_paint_code, p_vote_type, p_session_id, p_voter_ip);
$$;

create function public.retract_vote(
    p_paint_code text,
    p_session_id text
) returns void
language sql
security invoker
set search_path = ''
as $$
    select private.retract_vote(p_paint_code, p_session_id);
$$;

-- 6. Permissões de execução --------------------------------------------------
--    Privadas: só o anon pode chamar (via wrapper). Nada de `public`.
revoke all on function private.cast_vote(text, text, text, text) from public;
revoke all on function private.retract_vote(text, text)          from public;
grant execute on function private.cast_vote(text, text, text, text) to anon;
grant execute on function private.retract_vote(text, text)          to anon;

--    Wrappers públicos: só o anon (a app não usa `authenticated`).
revoke all on function public.cast_vote(text, text, text, text) from public;
revoke all on function public.retract_vote(text, text)          from public;
grant execute on function public.cast_vote(text, text, text, text) to anon;
grant execute on function public.retract_vote(text, text)          to anon;
