SELECT *
FROM (
    SELECT 
        e.NomeOriginal AS "Product Name",
        e.Codigo AS "Code",
        e.Hex AS "Hex",
        ept.Funcao AS "Function",
        ept.Keywords AS "Keywords",
        e.Fabricante AS "Manufacturer"
    FROM Efeitos e
    JOIN EfeitosEN ept ON e.EfeitoID = ept.EfeitoID
    FOR JSON PATH, ROOT('efeitos')
) AS js(JsonString)