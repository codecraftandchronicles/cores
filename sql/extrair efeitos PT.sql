SELECT *
FROM (
    SELECT 
        e.NomeOriginal AS "Nome do Produto",
        e.Codigo AS "Código",
        e.Hex AS "Hex",
        ept.Funcao AS "Função",
        ept.Keywords AS "Keywords",
        e.Fabricante AS "Fabricante"
    FROM Efeitos e
    JOIN EfeitosPT ept ON e.EfeitoID = ept.EfeitoID
    FOR JSON PATH, ROOT('efeitos')
) AS js(JsonString)