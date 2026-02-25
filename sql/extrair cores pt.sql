SELECT *
FROM (
    SELECT 
        t.NomeOriginal AS "Cor Base",
        t.Codigo AS "Código",
        t.Hex AS "Hex",
        t.Fabricante AS "Fabricante",
        d.Temperatura AS "Temperatura",
        d.Fase AS "Fase",
        d.Saturacao AS "Saturação",
        d.Funcao AS "Função Principal",
        d.UsoEstrategico AS "Uso Estratégico",
        (SELECT TOP 1 NomeOriginal FROM Tintas WHERE TintaID = t.ComplementarID) AS "Complementar",
        CASE 
            WHEN t.ComplementarID IS NOT NULL THEN d.PapelComplementar 
        ELSE
            null
        END AS "Papel do Complementar",
        d.Keywords AS "Keywords"
    FROM Tintas t
    JOIN DadosPT d ON t.TintaID = d.TintaID
    FOR JSON PATH, ROOT('cores')
) AS js(JsonString)