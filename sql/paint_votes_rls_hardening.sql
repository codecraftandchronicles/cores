-- =============================================================================
--  paint_votes — RLS hardening
-- =============================================================================
--  Corrige os avisos "RLS Policy Always True" para INSERT e DELETE.
--
--  Estratégia:
--    * Manter apenas leitura pública direta na tabela (SELECT using(true) é
--      um padrão legítimo e o linter ignora-o de propósito).
--    * Revogar INSERT/DELETE diretos do papel `anon`.
--    * Expor duas funções SECURITY DEFINER que controlam o WHERE/validação,
--      impedindo apagar a tabela inteira e limitando lixo/spam.
--
--  Nota: sem autenticação, o `session_id` vem do browser e NÃO é uma
--  identidade real. Isto contém estragos, não autentica utilizadores.
--
--  Correr no Supabase → SQL Editor.
-- =============================================================================

-- 1. Remover as políticas permissivas ----------------------------------------
drop policy if exists "Allow public insert"  on public.paint_votes;
drop policy if exists "Allow session delete" on public.paint_votes;

-- (A política de leitura mantém-se; recriada aqui de forma idempotente.)
drop policy if exists "Allow public read" on public.paint_votes;
create policy "Allow public read" on public.paint_votes
    for select using (true);

-- 2. Garantir que anon não faz INSERT/DELETE/UPDATE diretos ------------------
revoke insert, update, delete on public.paint_votes from anon;
grant  select on public.paint_votes to anon;

-- 3. INSERT controlado via RPC -----------------------------------------------
--    Valida o formato e garante 1 voto por sessão/tinta (remove o anterior).
create or replace function public.cast_vote(
    p_paint_code text,
    p_vote_type  text,
    p_session_id text,
    p_voter_ip   text default ''
) returns void
language plpgsql
security definer
set search_path = public
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

-- 4. DELETE controlado via RPC (só a própria sessão/tinta) -------------------
create or replace function public.retract_vote(
    p_paint_code text,
    p_session_id text
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    delete from public.paint_votes
    where paint_code = p_paint_code
      and session_id = p_session_id;
end;
$$;

-- 5. Permissões de execução --------------------------------------------------
revoke all on function public.cast_vote(text, text, text, text) from public;
revoke all on function public.retract_vote(text, text)          from public;
grant execute on function public.cast_vote(text, text, text, text) to anon;
grant execute on function public.retract_vote(text, text)          to anon;
