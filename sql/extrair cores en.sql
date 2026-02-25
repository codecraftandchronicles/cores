SELECT *
FROM (
    SELECT 
        t.NomeOriginal AS "Base Colour",
        t.Codigo AS "Code",
        t.Hex AS "Hex",
        t.Fabricante AS "Manufacturer",
        d.Temperatura AS "Temperature",
        d.Fase AS "Phase",
        d.Saturacao AS "Saturation",
        d.Funcao AS "Primary Function",
        d.UsoEstrategico AS "Strategic Use",
        (SELECT TOP 1 NomeOriginal FROM Tintas WHERE TintaID = t.ComplementarID) AS "Complementary",
        CASE 
            WHEN t.ComplementarID IS NOT NULL THEN d.PapelComplementar 
        ELSE
            null
        END AS "Role of Complementary",
        d.Keywords AS "Keywords"
    FROM Tintas t
    JOIN DadosEN d ON t.TintaID = d.TintaID
    FOR JSON PATH, ROOT('cores')
) AS js(JsonString)